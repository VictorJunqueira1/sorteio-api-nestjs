import { Inject, Injectable } from '@nestjs/common';

import { DrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_RESULTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import type { DrawResultsRepository } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawSessionMapper } from './draw-session.mapper';

@Injectable()
export class RestartDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_RESULTS_REPOSITORY)
        private readonly drawResultsRepository: DrawResultsRepository,
    ) { }

    async execute(id: string): Promise<DrawSessionResponse> {
        const drawSession = await this.drawSessionsRepository.findById(id);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        await this.drawResultsRepository.deleteBySessionId(id);
        await this.drawEntriesRepository.resetWinnersBySessionId(id);

        drawSession.restart();

        const updatedDrawSession = await this.drawSessionsRepository.update(drawSession);

        return DrawSessionMapper.toResponse(updatedDrawSession);
    }
}