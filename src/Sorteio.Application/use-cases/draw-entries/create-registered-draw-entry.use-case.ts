import { Injectable, Inject } from '@nestjs/common';
import { CreateRegisteredDrawEntryRequest } from '../../../Sorteio.Communication/requests/draw-entries/create-registered-draw-entry.request';
import { DrawEntryResponse } from '../../../Sorteio.Communication/responses/draw-entries/draw-entry.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { PARTICIPANTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import type { ParticipantsRepository } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import { DrawEntryMapper } from './draw-entry.mapper';

@Injectable()
export class CreateRegisteredDrawEntryUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
        @Inject(PARTICIPANTS_REPOSITORY)
        private readonly participantsRepository: ParticipantsRepository,
    ) { }

    async execute(
        drawSessionId: string,
        request: CreateRegisteredDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        const participant = await this.participantsRepository.findById(request.participantId);

        if (!participant) {
            throw new NotFoundException('Participante não encontrado.');
        }

        const exists = await this.drawEntriesRepository.existsInSession({
            drawSessionId,
            participantId: request.participantId,
        });

        if (exists) {
            throw new BusinessException('Este participante já está vinculado nesta sessão.');
        }

        const drawEntry = DrawEntry.createRegistered({
            drawSessionId,
            participantId: participant.id,
            displayName: participant.name,
            imageUrl: participant.imageUrl,
        });

        const createdDrawEntry = await this.drawEntriesRepository.create(drawEntry);

        return DrawEntryMapper.toResponse(createdDrawEntry);
    }
}