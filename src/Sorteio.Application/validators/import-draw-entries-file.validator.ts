import { extname } from 'node:path';
import { BusinessException } from '../../Sorteio.Domain/exceptions/business.exception';
import type { ImportDrawEntriesFile } from '../use-cases/draw-entries/types/import-draw-entries-file';

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.txt'];
const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export class ImportDrawEntriesFileValidator {
    static validate(file?: ImportDrawEntriesFile): void {
        if (!file) {
            throw new BusinessException('O arquivo é obrigatório.');
        }

        const extension = extname(file.originalname).toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            throw new BusinessException(
                'O arquivo deve estar no formato CSV, XLSX ou TXT.',
            );
        }

        if (file.size > MAX_FILE_SIZE_IN_BYTES) {
            throw new BusinessException('O arquivo deve ter no máximo 5MB.');
        }

        if (!file.buffer || file.buffer.length === 0) {
            throw new BusinessException('O arquivo enviado está vazio.');
        }
    }
}