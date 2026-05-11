import { Inject, Injectable } from '@nestjs/common';

import { DrawEntryResponse } from '../../../Sorteio.Communication/responses/draw-entries/draw-entry.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawEntryMapper } from './draw-entry.mapper';

@Injectable()
export class ListDrawEntriesBySessionUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(drawSessionId: string): Promise<DrawEntryResponse[]> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        const drawEntries =
            await this.drawEntriesRepository.findBySessionId(drawSessionId);

        return drawEntries.map(DrawEntryMapper.toResponse);
    }
}