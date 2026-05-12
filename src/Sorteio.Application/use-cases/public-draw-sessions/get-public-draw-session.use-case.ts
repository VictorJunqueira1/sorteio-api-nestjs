import { Inject, Injectable } from '@nestjs/common';

import { PublicDrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/public-draw-session.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

@Injectable()
export class GetPublicDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,
    ) { }

    async execute(publicCode: string): Promise<PublicDrawSessionResponse> {
        const drawSession = await this.drawSessionsRepository.findByPublicCode(publicCode);

        if (!drawSession) {
            throw new NotFoundException('Sessão pública não encontrada.');
        }

        const entries = await this.drawEntriesRepository.findBySessionId(
            drawSession.id,
        );

        return {
            publicCode: drawSession.publicCode as string,
            title: drawSession.title,
            description: drawSession.description ?? null,
            status: drawSession.status,
            requireParticipantName: drawSession.requireParticipantName,
            allowDuplicatePublicEntries: drawSession.allowDuplicatePublicEntries,
            totalParticipants: entries.length,
        };
    }
}