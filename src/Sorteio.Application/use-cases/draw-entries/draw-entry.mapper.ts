import { DrawEntryResponse } from '../../../Sorteio.Communication/responses/draw-entries/draw-entry.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';

export class DrawEntryMapper {
    static toResponse(drawEntry: DrawEntry): DrawEntryResponse {
        return {
            id: drawEntry.id,
            drawSessionId: drawEntry.drawSessionId,
            participantId: drawEntry.participantId ?? null,
            displayName: drawEntry.displayName,
            imageUrl: drawEntry.imageUrl ?? null,
            source: drawEntry.source,
            isWinner: drawEntry.isWinner,
            createdAt: drawEntry.createdAt,
        };
    }
}