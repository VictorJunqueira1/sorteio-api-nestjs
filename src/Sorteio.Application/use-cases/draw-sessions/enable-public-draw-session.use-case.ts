import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnablePublicDrawSessionRequest } from '../../../Sorteio.Communication/requests/draw-sessions/enable-public-draw-session.request';
import { PublicDrawSessionCodeResponse } from '../../../Sorteio.Communication/responses/draw-sessions/public-draw-session-code.response';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

@Injectable()
export class EnablePublicDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
        private readonly configService: ConfigService,
    ) { }

    async execute(
        id: string,
        request: EnablePublicDrawSessionRequest,
    ): Promise<PublicDrawSessionCodeResponse> {
        const drawSession = await this.drawSessionsRepository.findById(id);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        drawSession.enablePublicAccess({
            requireParticipantName: request.requireParticipantName,
            allowDuplicatePublicEntries: request.allowDuplicatePublicEntries,
        });

        const updatedDrawSession = await this.drawSessionsRepository.update(drawSession);

        const publicCode = updatedDrawSession.publicCode as string;

        return {
            drawSessionId: updatedDrawSession.id,
            publicCode,
            publicUrl: this.buildPublicUrl(publicCode),
            requireParticipantName: updatedDrawSession.requireParticipantName,
            allowDuplicatePublicEntries: updatedDrawSession.allowDuplicatePublicEntries,
        };
    }

    private buildPublicUrl(publicCode: string): string | null {
        const baseUrl = this.configService.get<string>(
            'PUBLIC_DRAW_SESSION_URL_BASE',
        );

        if (!baseUrl) {
            return null;
        }

        return `${baseUrl.replace(/\/$/, '')}/${publicCode}`;
    }
}