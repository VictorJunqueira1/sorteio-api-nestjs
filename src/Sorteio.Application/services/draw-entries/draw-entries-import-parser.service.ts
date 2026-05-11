import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { extname } from 'node:path';

import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import type { ImportDrawEntriesFile } from '../../use-cases/draw-entries/types/import-draw-entries-file';

export interface ParsedImportedDrawEntryName {
    rowNumber: number;
    name: string;
}

export interface InvalidImportedDrawEntryRow {
    rowNumber: number;
    reason: string;
    rawValue: string;
}

export interface ParsedImportedDrawEntriesFile {
    totalRowsRead: number;
    validNames: ParsedImportedDrawEntryName[];
    invalidRows: InvalidImportedDrawEntryRow[];
}

@Injectable()
export class DrawEntriesImportParserService {
    async parse(
        file: ImportDrawEntriesFile,
        skipFirstRow: boolean,
    ): Promise<ParsedImportedDrawEntriesFile> {
        const extension = extname(file.originalname).toLowerCase();

        if (extension === '.xlsx') {
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
    ): Promise<ParsedImportedDrawEntriesFile> {
        const workbook = new Workbook();
        const arrayBuffer = this.toArrayBuffer(file.buffer);

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
    ): ParsedImportedDrawEntriesFile {
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
    ): ParsedImportedDrawEntriesFile {
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
    ): ParsedImportedDrawEntriesFile {
        const rowsToProcess = skipFirstRow ? rows.slice(1) : rows;
        const rowNumberOffset = skipFirstRow ? 2 : 1;

        const validNames: ParsedImportedDrawEntryName[] = [];
        const invalidRows: InvalidImportedDrawEntryRow[] = [];

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
        const cell = row.find((value) => {
            return this.stringifyCellValue(value).trim().length > 0;
        });

        return this.stringifyCellValue(cell).trim();
    }

    private stringifyCellValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (typeof value === 'object') {
            const objectValue = value as {
                text?: unknown;
                result?: unknown;
                hyperlink?: unknown;
                richText?: Array<{ text?: unknown }>;
            };

            if (objectValue.text !== undefined) {
                return String(objectValue.text);
            }

            if (objectValue.result !== undefined) {
                return String(objectValue.result);
            }

            if (Array.isArray(objectValue.richText)) {
                return objectValue.richText
                    .map((item) => String(item.text ?? ''))
                    .join('');
            }
        }

        return String(value);
    }

    private normalizeName(value: string): string {
        return value
            .replace(/^\uFEFF/, '')
            .trim()
            .replace(/\s+/g, ' ');
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

    private toArrayBuffer(buffer: Buffer): ArrayBuffer {
        return buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer;
    }
}