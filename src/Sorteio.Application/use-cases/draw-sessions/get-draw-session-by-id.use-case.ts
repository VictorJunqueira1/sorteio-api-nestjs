import { Inject, Injectable } from '@nestjs/common';

import { DrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawSessionMapper } from './draw-session.mapper';

@Injectable()
export class GetDrawSessionByIdUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(id: string): Promise<DrawSessionResponse> {
        const drawSession = await this.drawSessionsRepository.findById(id);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        return DrawSessionMapper.toResponse(drawSession);
    }
}