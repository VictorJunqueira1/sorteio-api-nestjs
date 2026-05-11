import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

import { DrawResultResponse } from '../../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { DrawResult } from '../../../Sorteio.Domain/entities/draw-result.entity';
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
export class ExecuteSimpleDrawUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_RESULTS_REPOSITORY)
        private readonly drawResultsRepository: DrawResultsRepository,
    ) { }

    async execute(drawSessionId: string): Promise<DrawResultResponse> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        if (drawSession.status === DrawSessionStatus.Finished) {
            throw new BusinessException('Não é possível sortear em uma sessão finalizada.');
        }

        const entries = await this.drawEntriesRepository.findBySessionId(drawSessionId);

        if (entries.length === 0) {
            throw new BusinessException('A sessão não possui entradas para sorteio.');
        }

        const availableEntries = drawSession.allowRepeatedWinners
            ? entries
            : entries.filter((entry) => !entry.isWinner);

        if (availableEntries.length === 0) {
            throw new BusinessException(
                'Não há mais entradas disponíveis para sorteio nesta sessão.',
            );
        }

        const selectedIndex = randomInt(availableEntries.length);
        const selectedEntry = availableEntries[selectedIndex];

        const drawResult = DrawResult.create({
            drawSessionId: drawSession.id,
            drawEntryId: selectedEntry.id,
            displayName: selectedEntry.displayName,
            imageUrl: selectedEntry.imageUrl,
        });

        const createdDrawResult =
            await this.drawResultsRepository.create(drawResult);

        selectedEntry.markAsWinner();
        await this.drawEntriesRepository.update(selectedEntry);

        return DrawResultMapper.toResponse(createdDrawResult);
    }
}