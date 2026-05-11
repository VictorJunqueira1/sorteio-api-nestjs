import { Inject, Injectable } from '@nestjs/common';

import { CreateBulkManualDrawEntriesRequest } from '../../../Sorteio.Communication/requests/draw-entries/create-bulk-manual-draw-entries.request';
import { BulkDrawEntriesResponse } from '../../../Sorteio.Communication/responses/draw-entries/bulk-draw-entries.response';
import { DrawEntry } from '../../../Sorteio.Domain/entities/draw-entry.entity';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

import { DrawEntryMapper } from './draw-entry.mapper';

@Injectable()
export class CreateBulkManualDrawEntriesUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(
        drawSessionId: string,
        request: CreateBulkManualDrawEntriesRequest,
    ): Promise<BulkDrawEntriesResponse> {
        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        if (drawSession.status === DrawSessionStatus.Finished) {
            throw new BusinessException(
                'Não é possível adicionar entradas em uma sessão finalizada.',
            );
        }

        const normalizedNames = request.names
            .map((name) => this.normalizeName(name))
            .filter((name) => name.length > 0);

        if (normalizedNames.length === 0) {
            throw new BusinessException('Informe ao menos um nome válido.');
        }

        const existingEntries =
            await this.drawEntriesRepository.findBySessionId(drawSessionId);

        const existingNameKeys = new Set(
            existingEntries.map((entry) => this.createNameKey(entry.displayName)),
        );

        const receivedNameKeys = new Set<string>();

        const entriesToCreate: DrawEntry[] = [];
        const ignored: { name: string; reason: string }[] = [];

        for (const name of normalizedNames) {
            const nameKey = this.createNameKey(name);

            if (receivedNameKeys.has(nameKey)) {
                ignored.push({
                    name,
                    reason: 'Nome duplicado na lista enviada.',
                });
                continue;
            }

            receivedNameKeys.add(nameKey);

            if (existingNameKeys.has(nameKey)) {
                ignored.push({
                    name,
                    reason: 'Nome duplicado na sessão.',
                });
                continue;
            }

            entriesToCreate.push(
                DrawEntry.createManual({
                    drawSessionId,
                    displayName: name,
                }),
            );
        }

        const createdEntries =
            await this.drawEntriesRepository.createMany(entriesToCreate);

        return {
            created: createdEntries.map(DrawEntryMapper.toResponse),
            ignored,
            totalReceived: request.names.length,
            totalCreated: createdEntries.length,
            totalIgnored: ignored.length,
        };
    }

    private normalizeName(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private createNameKey(value: string): string {
        return this.normalizeName(value).toLowerCase();
    }
}