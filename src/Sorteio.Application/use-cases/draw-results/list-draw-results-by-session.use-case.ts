import { Inject, Injectable } from '@nestjs/common';

import { DrawResultResponse } from '../../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_RESULTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import type { DrawResultsRepository } from '../../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawResultMapper } from './draw-result.mapper';

@Injectable()
export class ListDrawResultsBySessionUseCase {
    constructor(
        @Inject(DRAW_RESULTS_REPOSITORY)
        private readonly drawResultsRepository: DrawResultsRepository,

        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(drawSessionId: string): Promise<DrawResultResponse[]> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        const drawResults =
            await this.drawResultsRepository.findBySessionId(drawSessionId);

        return drawResults.map(DrawResultMapper.toResponse);
    }
}