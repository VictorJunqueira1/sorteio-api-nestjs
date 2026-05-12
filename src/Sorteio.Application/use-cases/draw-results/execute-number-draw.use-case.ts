import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

import { ExecuteNumberDrawRequest } from '../../../Sorteio.Communication/requests/draw-results/execute-number-draw.request';
import { DrawResultResponse } from '../../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { DrawResult } from '../../../Sorteio.Domain/entities/draw-result.entity';
import { DrawEntrySource } from '../../../Sorteio.Domain/enums/draw-entry-source.enum';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { DrawSessionType } from '../../../Sorteio.Domain/enums/draw-session-type.enum';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_RESULTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import type { DrawResultsRepository } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { DRAW_SESSION_REALTIME_NOTIFIER } from '../../../Sorteio.Domain/services/realtime/draw-session-realtime-notifier.service';
import type { DrawSessionRealtimeNotifier } from '../../../Sorteio.Domain/services/realtime/draw-session-realtime-notifier.service';

import { DrawResultMapper } from './draw-result.mapper';

@Injectable()
export class ExecuteNumberDrawUseCase {
    private readonly maxRangeSize = 10000;

    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_RESULTS_REPOSITORY)
        private readonly drawResultsRepository: DrawResultsRepository,

        @Inject(DRAW_SESSION_REALTIME_NOTIFIER)
        private readonly realtimeNotifier: DrawSessionRealtimeNotifier,
    ) { }

    async execute(
        drawSessionId: string,
        request: ExecuteNumberDrawRequest,
    ): Promise<DrawResultResponse> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        if (drawSession.status === DrawSessionStatus.Finished) {
            throw new BusinessException('Não é possível sortear em uma sessão finalizada.');
        }

        if (drawSession.status === DrawSessionStatus.Canceled) {
            throw new BusinessException('Não é possível sortear em uma sessão cancelada.');
        }

        if (drawSession.type !== DrawSessionType.Numeric) {
            throw new BusinessException('Esta sessão não é do tipo numérico.');
        }

        this.validateRange(request.min, request.max);

        const selectedNumber = drawSession.allowRepeatedWinners
            ? this.drawRandomNumber(request.min, request.max)
            : await this.drawAvailableNumber(drawSessionId, request.min, request.max);

        const displayName = String(selectedNumber);

        const drawEntry = DrawEntry.createNumeric({
            drawSessionId: drawSession.id,
            displayName,
        });

        drawEntry.markAsWinner();

        const createdEntry = await this.drawEntriesRepository.create(drawEntry);

        const drawResult = DrawResult.create({
            drawSessionId: drawSession.id,
            drawEntryId: createdEntry.id,
            displayName: createdEntry.displayName,
            imageUrl: null,
        });

        const createdDrawResult = await this.drawResultsRepository.create(drawResult);

        await this.realtimeNotifier.notifyDrawResultCreated({
            drawSessionId: createdDrawResult.drawSessionId,
            drawEntryId: createdDrawResult.drawEntryId,
            displayName: createdDrawResult.displayName,
            imageUrl: createdDrawResult.imageUrl ?? null,
            drawnAt: createdDrawResult.drawnAt,
        });

        return DrawResultMapper.toResponse(createdDrawResult);
    }

    private validateRange(min: number, max: number): void {
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
            throw new BusinessException('Os valores mínimo e máximo devem ser números inteiros.');
        }

        if (min < 0 || max < 0) {
            throw new BusinessException('Os valores mínimo e máximo não podem ser negativos.');
        }

        if (min > max) {
            throw new BusinessException('O número inicial não pode ser maior que o número final.');
        }

        const rangeSize = max - min + 1;

        if (rangeSize > this.maxRangeSize) {
            throw new BusinessException(
                `O intervalo do sorteio numérico não pode ultrapassar ${this.maxRangeSize} números.`,
            );
        }
    }

    private drawRandomNumber(min: number, max: number): number {
        return randomInt(min, max + 1);
    }

    private async drawAvailableNumber(
        drawSessionId: string,
        min: number,
        max: number,
    ): Promise<number> {
        const existingEntries = await this.drawEntriesRepository.findBySessionId(drawSessionId);

        const alreadyDrawnNumbers = new Set(
            existingEntries
                .filter((entry) => entry.source === DrawEntrySource.Numeric)
                .filter((entry) => entry.isWinner)
                .map((entry) => Number(entry.displayName))
                .filter((value) => Number.isInteger(value))
                .filter((value) => value >= min && value <= max),
        );

        const availableNumbers: number[] = [];

        for (let number = min; number <= max; number++) {
            if (!alreadyDrawnNumbers.has(number)) {
                availableNumbers.push(number);
            }
        }

        if (availableNumbers.length === 0) {
            throw new BusinessException(
                'Não há mais números disponíveis para sorteio nesta sessão.',
            );
        }

        const selectedIndex = randomInt(availableNumbers.length);

        return availableNumbers[selectedIndex];
    }
}