import { Inject, Injectable } from '@nestjs/common';

import { ListDrawSessionsRequest } from '../../../Sorteio.Communication/requests/draw-sessions/list-draw-sessions.request';
import { DrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawSessionMapper } from './draw-session.mapper';

@Injectable()
export class ListDrawSessionsUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(request: ListDrawSessionsRequest): Promise<DrawSessionResponse[]> {
        const drawSessions = await this.drawSessionsRepository.findAll({
            search: request.search,
            page: request.page,
            pageSize: request.pageSize,
        });

        return drawSessions.map(DrawSessionMapper.toResponse);
    }
}