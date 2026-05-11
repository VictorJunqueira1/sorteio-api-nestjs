import { Injectable } from '@nestjs/common';

import { DrawEntriesImportParserService } from '../../services/draw-entries/draw-entries-import-parser.service';
import { ImportDrawEntriesRequest } from '../../../Sorteio.Communication/requests/draw-entries/import-draw-entries.request';
import { ImportDrawEntriesResponse } from '../../../Sorteio.Communication/responses/draw-entries/import-draw-entries.response';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { ImportDrawEntriesFileValidator } from '../../validators/import-draw-entries-file.validator';
import { CreateBulkManualDrawEntriesUseCase } from './create-bulk-manual-draw-entries.use-case';
import type { ImportDrawEntriesFile } from './types/import-draw-entries-file';

@Injectable()
export class ImportManualDrawEntriesUseCase {
    constructor(
        private readonly createBulkManualDrawEntriesUseCase: CreateBulkManualDrawEntriesUseCase,
        private readonly drawEntriesImportParserService: DrawEntriesImportParserService,
    ) {}

    async execute(
        drawSessionId: string,
        request: ImportDrawEntriesRequest,
        file?: ImportDrawEntriesFile,
    ): Promise<ImportDrawEntriesResponse> {
        ImportDrawEntriesFileValidator.validate(file);

        if (!file) {
            throw new BusinessException('O arquivo é obrigatório.');
        }

        const parsedFile = await this.drawEntriesImportParserService.parse(
            file,
            request.skipFirstRow ?? false,
        );

        if (parsedFile.validNames.length === 0) {
            throw new BusinessException('Nenhum nome válido foi encontrado no arquivo.');
        }

        const bulkResult = await this.createBulkManualDrawEntriesUseCase.execute(
            drawSessionId,
            {
                names: parsedFile.validNames.map((item) => item.name),
            },
        );

        return {
            fileName: file.originalname,
            skipFirstRow: request.skipFirstRow ?? false,
            totalRowsRead: parsedFile.totalRowsRead,
            totalValidNames: parsedFile.validNames.length,
            totalCreated: bulkResult.totalCreated,
            totalIgnored: bulkResult.totalIgnored,
            totalInvalidRows: parsedFile.invalidRows.length,
            created: bulkResult.created,
            ignored: bulkResult.ignored,
            invalidRows: parsedFile.invalidRows,
        };
    }
}