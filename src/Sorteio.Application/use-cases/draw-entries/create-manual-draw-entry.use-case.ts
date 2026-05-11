import { Injectable, Inject } from '@nestjs/common';
import { CreateManualDrawEntryRequest } from '../../../Sorteio.Communication/requests/draw-entries/create-manual-draw-entry.request';
import { DrawEntryResponse } from '../../../Sorteio.Communication/responses/draw-entries/draw-entry.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { DrawEntryMapper } from './draw-entry.mapper';

@Injectable()
export class CreateManualDrawEntryUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(
        drawSessionId: string,
        request: CreateManualDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        const exists = await this.drawEntriesRepository.existsInSession({
            drawSessionId,
            displayName: request.displayName,
        });

        if (exists) {
            throw new BusinessException('Já existe uma entrada com este nome nesta sessão.');
        }

        const drawEntry = DrawEntry.createManual({
            drawSessionId,
            displayName: request.displayName,
            imageUrl: request.imageUrl,
        });

        const createdDrawEntry = await this.drawEntriesRepository.create(drawEntry);

        return DrawEntryMapper.toResponse(createdDrawEntry);
    }
}