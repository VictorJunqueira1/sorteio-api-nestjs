import { Inject, Injectable } from '@nestjs/common';

import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

@Injectable()
export class DeleteDrawEntryUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(drawSessionId: string, entryId: string): Promise<void> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        const drawEntry = await this.drawEntriesRepository.findById(entryId);

        if (!drawEntry || drawEntry.drawSessionId !== drawSessionId) {
            throw new NotFoundException('Entrada da sessão não encontrada.');
        }

        await this.drawEntriesRepository.delete(entryId);
    }
}