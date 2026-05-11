import { Inject, Injectable } from '@nestjs/common';

import { DrawEntriesImportParserService } from '../../services/draw-entries/draw-entries-import-parser.service';
import { ImportDrawEntriesRequest } from '../../../Sorteio.Communication/requests/draw-entries/import-draw-entries.request';
import { PreviewImportDrawEntriesResponse } from '../../../Sorteio.Communication/responses/draw-entries/preview-import-draw-entries.response';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_ENTRIES_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import type { DrawEntriesRepository } from '../../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { ImportDrawEntriesFileValidator } from '../../validators/import-draw-entries-file.validator';
import type { ImportDrawEntriesFile } from './types/import-draw-entries-file';

@Injectable()
export class PreviewImportDrawEntriesUseCase {
    constructor(
        @Inject(DRAW_ENTRIES_REPOSITORY)
        private readonly drawEntriesRepository: DrawEntriesRepository,

        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,

        private readonly drawEntriesImportParserService: DrawEntriesImportParserService,
    ) { }

    async execute(
        drawSessionId: string,
        request: ImportDrawEntriesRequest,
        file?: ImportDrawEntriesFile,
    ): Promise<PreviewImportDrawEntriesResponse> {
        ImportDrawEntriesFileValidator.validate(file);

        if (!file) {
            throw new BusinessException('O arquivo é obrigatório.');
        }

        const drawSession = await this.drawSessionsRepository.findById(drawSessionId);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        if (drawSession.status === DrawSessionStatus.Finished) {
            throw new BusinessException(
                'Não é possível importar entradas em uma sessão finalizada.',
            );
        }

        const parsedFile = await this.drawEntriesImportParserService.parse(
            file,
            request.skipFirstRow ?? false,
        );

        const existingEntries =
            await this.drawEntriesRepository.findBySessionId(drawSessionId);

        const existingNameKeys = new Set(
            existingEntries.map((entry) => this.createNameKey(entry.displayName)),
        );

        const receivedNameKeys = new Set<string>();

        const readyToImport: { rowNumber: number; name: string }[] = [];
        const duplicatedInFile: {
            rowNumber: number;
            name: string;
            reason: string;
        }[] = [];
        const duplicatedInSession: {
            rowNumber: number;
            name: string;
            reason: string;
        }[] = [];

        for (const validName of parsedFile.validNames) {
            const nameKey = this.createNameKey(validName.name);

            if (receivedNameKeys.has(nameKey)) {
                duplicatedInFile.push({
                    rowNumber: validName.rowNumber,
                    name: validName.name,
                    reason: 'Nome duplicado no arquivo.',
                });
                continue;
            }

            receivedNameKeys.add(nameKey);

            if (existingNameKeys.has(nameKey)) {
                duplicatedInSession.push({
                    rowNumber: validName.rowNumber,
                    name: validName.name,
                    reason: 'Nome já existente na sessão.',
                });
                continue;
            }

            readyToImport.push({
                rowNumber: validName.rowNumber,
                name: validName.name,
            });
        }

        return {
            fileName: file.originalname,
            skipFirstRow: request.skipFirstRow ?? false,
            totalRowsRead: parsedFile.totalRowsRead,
            totalValidNames: parsedFile.validNames.length,
            totalReadyToImport: readyToImport.length,
            totalDuplicatedInFile: duplicatedInFile.length,
            totalDuplicatedInSession: duplicatedInSession.length,
            totalInvalidRows: parsedFile.invalidRows.length,
            readyToImport,
            duplicatedInFile,
            duplicatedInSession,
            invalidRows: parsedFile.invalidRows,
        };
    }

    private normalizeName(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private createNameKey(value: string): string {
        return this.normalizeName(value).toLowerCase();
    }
}