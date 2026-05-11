import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

import { ExecuteNumberDrawRequest } from '../../../Sorteio.Communication/requests/draw-results/execute-number-draw.request';
import { DrawResultResponse } from '../../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { DrawResult } from '../../../Sorteio.Domain/entities/draw-result.entity';
import { DrawEntrySource } from '../../../Sorteio.Domain/enums/draw-entry-source.enum';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_RESULTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import type { DrawResultsRepository } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

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

        if (request.min > request.max) {
            throw new BusinessException('O número inicial não pode ser maior que o número final.');
        }

        const rangeSize = request.max - request.min + 1;

        if (rangeSize > this.maxRangeSize) {
            throw new BusinessException(
                `O intervalo do sorteio numérico não pode ultrapassar ${this.maxRangeSize} números.`,
            );
        }

        const numericEntries = await this.getOrCreateNumericEntries(
            drawSessionId,
            request.min,
            request.max,
        );

        const availableEntries = drawSession.allowRepeatedWinners
            ? numericEntries
            : numericEntries.filter((entry) => !entry.isWinner);

        if (availableEntries.length === 0) {
            throw new BusinessException(
                'Não há mais números disponíveis para sorteio nesta sessão.',
            );
        }

        const selectedIndex = randomInt(availableEntries.length);
        const selectedEntry = availableEntries[selectedIndex];

        const drawResult = DrawResult.create({
            drawSessionId: drawSession.id,
            drawEntryId: selectedEntry.id,
            displayName: selectedEntry.displayName,
            imageUrl: null,
        });

        const createdDrawResult =
            await this.drawResultsRepository.create(drawResult);

        selectedEntry.markAsWinner();
        await this.drawEntriesRepository.update(selectedEntry);

        return DrawResultMapper.toResponse(createdDrawResult);
    }

    private async getOrCreateNumericEntries(
        drawSessionId: string,
        min: number,
        max: number,
    ): Promise<DrawEntry[]> {
        const existingEntries =
            await this.drawEntriesRepository.findBySessionId(drawSessionId);

        const existingNumericEntries = existingEntries.filter((entry) => {
            if (entry.source !== DrawEntrySource.Numeric) {
                return false;
            }

            const numericValue = Number(entry.displayName);

            return Number.isInteger(numericValue) && numericValue >= min && numericValue <= max;
        });

        const existingNumberKeys = new Set(
            existingNumericEntries.map((entry) => entry.displayName),
        );

        const entriesToCreate: DrawEntry[] = [];

        for (let number = min; number <= max; number++) {
            const displayName = String(number);

            if (existingNumberKeys.has(displayName)) {
                continue;
            }

            entriesToCreate.push(
                DrawEntry.createNumeric({
                    drawSessionId,
                    displayName,
                }),
            );
        }

        const createdEntries =
            await this.drawEntriesRepository.createMany(entriesToCreate);

        return [...existingNumericEntries, ...createdEntries];
    }
}