import { DrawResultResponse } from '../../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { DrawResult } from '../../../Sorteio.Domain/entities/draw-result.entity';

export class DrawResultMapper {
    static toResponse(drawResult: DrawResult): DrawResultResponse {
        return {
            id: drawResult.id,
            drawSessionId: drawResult.drawSessionId,
            drawEntryId: drawResult.drawEntryId,
            displayName: drawResult.displayName,
            imageUrl: drawResult.imageUrl ?? null,
            drawnAt: drawResult.drawnAt,
        };
    }
}