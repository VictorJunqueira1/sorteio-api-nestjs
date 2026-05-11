import { Participant } from '../../../Sorteio.Domain/entities/participant.entity';
import { ParticipantResponse } from '../../../Sorteio.Communication/responses/participants/participant.response';

export class ParticipantMapper {
    static toResponse(participant: Participant): ParticipantResponse {
        return {
            id: participant.id,
            name: participant.name,
            email: participant.email ?? null,
            phone: participant.phone ?? null,
            document: participant.document ?? null,
            imageUrl: participant.imageUrl ?? null,
            status: participant.status,
            createdAt: participant.createdAt,
            updatedAt: participant.updatedAt ?? null,
        };
    }
}