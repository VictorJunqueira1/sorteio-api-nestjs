import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { JoinPublicDrawSessionRequest } from '../../../Sorteio.Communication/requests/public-draw-sessions/join-public-draw-session.request';
import { JoinPublicDrawSessionResponse } from '../../../Sorteio.Communication/responses/public-draw-sessions/join-public-draw-session.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { DRAW_SESSION_REALTIME_NOTIFIER } from '../../../Sorteio.Domain/services/realtime/draw-session-realtime-notifier.service';
import type { DrawSessionRealtimeNotifier } from '../../../Sorteio.Domain/services/realtime/draw-session-realtime-notifier.service';

@Injectable()
export class JoinPublicDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_SESSION_REALTIME_NOTIFIER)
        private readonly realtimeNotifier: DrawSessionRealtimeNotifier
    ) { }

    async execute(
        publicCode: string,
        request: JoinPublicDrawSessionRequest,
    ): Promise<JoinPublicDrawSessionResponse> {
        const drawSession =
            await this.drawSessionsRepository.findByPublicCode(publicCode);

        if (!drawSession) {
            throw new NotFoundException('Sessão pública não encontrada.');
        }

        if (drawSession.status === DrawSessionStatus.Finished) {
            throw new BusinessException('Não é possível entrar em uma sessão finalizada.');
        }

        if (drawSession.status === DrawSessionStatus.Canceled) {
            throw new BusinessException('Não é possível entrar em uma sessão cancelada.');
        }

        const displayName = this.resolveDisplayName(
            request.displayName,
            drawSession.requireParticipantName,
        );

        if (!drawSession.allowDuplicatePublicEntries) {
            const exists = await this.drawEntriesRepository.existsInSession({
                drawSessionId: drawSession.id,
                displayName,
            });

            if (exists) {
                throw new BusinessException(
                    'Já existe um participante com este nome nesta sessão.',
                );
            }
        }

        const drawEntry = DrawEntry.createQrCode({
            drawSessionId: drawSession.id,
            displayName,
        });

        const createdEntry = await this.drawEntriesRepository.create(drawEntry);

        const entries = await this.drawEntriesRepository.findBySessionId(drawSession.id);

        await this.realtimeNotifier.notifyPublicParticipantJoined({
            drawSessionId: drawSession.id,
            publicCode,
            totalParticipants: entries.length,
            entry: {
                id: createdEntry.id,
                drawSessionId: createdEntry.drawSessionId,
                participantId: createdEntry.participantId ?? null,
                displayName: createdEntry.displayName,
                imageUrl: createdEntry.imageUrl ?? null,
                source: createdEntry.source,
                isWinner: createdEntry.isWinner,
                createdAt: createdEntry.createdAt,
            },
        });

        return {
            entryId: createdEntry.id,
            publicCode,
            displayName: createdEntry.displayName,
            joinedAt: createdEntry.createdAt,
        };
    }

    private resolveDisplayName(
        displayName: string | undefined,
        requireParticipantName: boolean,
    ): string {
        const normalizedDisplayName = this.normalizeName(displayName ?? '');

        if (requireParticipantName && normalizedDisplayName.length === 0) {
            throw new BusinessException('O nome do participante é obrigatório.');
        }

        if (normalizedDisplayName.length > 0) {
            return normalizedDisplayName;
        }

        return `Participante ${randomUUID().slice(0, 8).toUpperCase()}`;
    }

    private normalizeName(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }
}