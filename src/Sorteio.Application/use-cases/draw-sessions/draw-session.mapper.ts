import { DrawSessionResponse } from '../../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { DrawSession } from '../../../Sorteio.Domain/entities/draw-session.entity';

export class DrawSessionMapper {
    static toResponse(drawSession: DrawSession): DrawSessionResponse {
        return {
            id: drawSession.id,
            title: drawSession.title,
            description: drawSession.description ?? null,
            type: drawSession.type,
            status: drawSession.status,
            allowRepeatedWinners: drawSession.allowRepeatedWinners,
            isPublic: drawSession.isPublic,
            publicCode: drawSession.publicCode ?? null,
            requireParticipantName: drawSession.requireParticipantName,
            allowDuplicatePublicEntries: drawSession.allowDuplicatePublicEntries,
            createdAt: drawSession.createdAt,
            updatedAt: drawSession.updatedAt ?? null,
            finishedAt: drawSession.finishedAt ?? null,
        };
    }
}