import { Injectable, Inject } from '@nestjs/common';
import { CreateDrawSessionRequest } from '../../../Sorteio.Communication/requests/draw-sessions/create-draw-session.request';
import { DrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { DrawSession } from '../../../Sorteio.Domain/entities/draw-session.entity';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { DrawSessionMapper } from './draw-session.mapper';

@Injectable()
export class CreateDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(request: CreateDrawSessionRequest): Promise<DrawSessionResponse> {
        const drawSession = DrawSession.create({
            title: request.title,
            description: request.description,
            type: request.type,
            allowRepeatedWinners: request.allowRepeatedWinners,
        });

        const createdDrawSession = await this.drawSessionsRepository.create(drawSession);

        return DrawSessionMapper.toResponse(createdDrawSession);
    }
}