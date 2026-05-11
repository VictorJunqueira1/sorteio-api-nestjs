import { Injectable } from '@nestjs/common';
import { extname } from 'node:path';
import { Workbook } from 'exceljs';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { ImportDrawEntriesFileValidator } from '../../validators/import-draw-entries-file.validator';
import { CreateBulkManualDrawEntriesUseCase } from './create-bulk-manual-draw-entries.use-case';
import type { ImportDrawEntriesFile } from './types/import-draw-entries-file';
import { ImportDrawEntriesRequest } from 'src/Sorteio.Communication/requests/draw-entries/import-draw-entries.request';
import { ImportDrawEntriesResponse } from 'src/Sorteio.Communication/responses/draw-entries/import-draw-entries.response';

interface ParsedImportedName {
    rowNumber: number;
    name: string;
}

interface InvalidImportedRow {
    rowNumber: number;
    reason: string;
    rawValue: string;
}

interface ParsedImportedFile {
    totalRowsRead: number;
    validNames: ParsedImportedName[];
    invalidRows: InvalidImportedRow[];
}

@Injectable()
export class ImportManualDrawEntriesUseCase {
    constructor(
        private readonly createBulkManualDrawEntriesUseCase: CreateBulkManualDrawEntriesUseCase,
    ) { }

    async execute(
        drawSessionId: string,
        request: ImportDrawEntriesRequest,
        file?: ImportDrawEntriesFile,
    ): Promise<ImportDrawEntriesResponse> {
        ImportDrawEntriesFileValidator.validate(file);

        if (!file) {
            throw new BusinessException('O arquivo é obrigatório.');
        }

        const parsedFile = await this.parseFile(file, request.skipFirstRow);

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
            skipFirstRow: request.skipFirstRow,
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

    private async parseFile(
        file: ImportDrawEntriesFile,
        skipFirstRow: boolean,
    ): Promise<ParsedImportedFile> {
        const extension = extname(file.originalname).toLowerCase();

        if (extension === '.xlsx' || extension === '.xls') {
            return await this.parseExcel(file, skipFirstRow);
        }

        if (extension === '.csv') {
            return this.parseCsv(file, skipFirstRow);
        }

        if (extension === '.txt') {
            return this.parseTxt(file, skipFirstRow);
        }

        throw new BusinessException('Formato de arquivo não suportado.');
    }

    private async parseExcel(
        file: ImportDrawEntriesFile,
        skipFirstRow: boolean,
    ): Promise<ParsedImportedFile> {
        const workbook = new Workbook();

        const arrayBuffer = file.buffer.buffer.slice(
            file.buffer.byteOffset,
            file.buffer.byteOffset + file.buffer.byteLength,
        ) as ArrayBuffer;

        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            throw new BusinessException('A planilha não possui abas para leitura.');
        }

        const rows: unknown[][] = [];

        worksheet.eachRow({ includeEmpty: false }, (row) => {
            const values = Array.isArray(row.values)
                ? row.values.slice(1)
                : [];

            rows.push(values);
        });

        return this.extractNamesFromRows(rows, skipFirstRow);
    }

    private parseCsv(
        file: ImportDrawEntriesFile,
        skipFirstRow: boolean,
    ): ParsedImportedFile {
        const content = file.buffer.toString('utf8');
        const lines = content
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0);

        const delimiter = this.detectDelimiter(lines[0] ?? '');
        const rows = lines.map((line) => this.parseDelimitedLine(line, delimiter));

        return this.extractNamesFromRows(rows, skipFirstRow);
    }

    private parseTxt(
        file: ImportDrawEntriesFile,
        skipFirstRow: boolean,
    ): ParsedImportedFile {
        const content = file.buffer.toString('utf8');
        const lines = content
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0);

        const rows = lines.map((line) => [line]);

        return this.extractNamesFromRows(rows, skipFirstRow);
    }

    private extractNamesFromRows(
        rows: unknown[][],
        skipFirstRow: boolean,
    ): ParsedImportedFile {
        const rowsToProcess = skipFirstRow ? rows.slice(1) : rows;
        const rowNumberOffset = skipFirstRow ? 2 : 1;

        const validNames: ParsedImportedName[] = [];
        const invalidRows: InvalidImportedRow[] = [];

        rowsToProcess.forEach((row, index) => {
            const rowNumber = index + rowNumberOffset;
            const rawValue = this.getFirstNonEmptyCell(row);
            const normalizedName = this.normalizeName(rawValue);

            if (!rawValue) {
                return;
            }

            if (normalizedName.length < 2) {
                invalidRows.push({
                    rowNumber,
                    reason: 'Nome deve ter pelo menos 2 caracteres.',
                    rawValue,
                });
                return;
            }

            if (normalizedName.length > 150) {
                invalidRows.push({
                    rowNumber,
                    reason: 'Nome deve ter no máximo 150 caracteres.',
                    rawValue,
                });
                return;
            }

            validNames.push({
                rowNumber,
                name: normalizedName,
            });
        });

        return {
            totalRowsRead: rowsToProcess.length,
            validNames,
            invalidRows,
        };
    }

    private getFirstNonEmptyCell(row: unknown[]): string {
        const cell = row.find((value) => String(value ?? '').trim().length > 0);
        return String(cell ?? '').trim();
    }

    private normalizeName(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private detectDelimiter(firstLine: string): string {
        const delimiters = [';', ',', '\t'];

        return delimiters.reduce((selectedDelimiter, currentDelimiter) => {
            const selectedCount = firstLine.split(selectedDelimiter).length;
            const currentCount = firstLine.split(currentDelimiter).length;

            return currentCount > selectedCount ? currentDelimiter : selectedDelimiter;
        }, ';');
    }

    private parseDelimitedLine(line: string, delimiter: string): string[] {
        const values: string[] = [];
        let currentValue = '';
        let isInsideQuotes = false;

        for (let index = 0; index < line.length; index++) {
            const char = line[index];
            const nextChar = line[index + 1];

            if (char === '"' && nextChar === '"') {
                currentValue += '"';
                index++;
                continue;
            }

            if (char === '"') {
                isInsideQuotes = !isInsideQuotes;
                continue;
            }

            if (char === delimiter && !isInsideQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
                continue;
            }

            currentValue += char;
        }

        values.push(currentValue.trim());

        return values;
    }
}