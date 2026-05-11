import { BusinessException } from '../../Sorteio.Domain/exceptions/business.exception';
import type { ParticipantImageFile } from '../use-cases/participants/types/participant-image-file';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export class ParticipantFileValidator {
    static validateImage(file?: ParticipantImageFile): void {
        if (!file) return;

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new BusinessException('A imagem deve estar no formato JPG, PNG ou WEBP.');
        }

        if (file.size > MAX_IMAGE_SIZE_IN_BYTES) {
            throw new BusinessException('A imagem deve ter no máximo 5MB.');
        }
    }
}