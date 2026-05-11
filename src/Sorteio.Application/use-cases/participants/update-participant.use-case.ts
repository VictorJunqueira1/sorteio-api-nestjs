import { Inject, Injectable } from '@nestjs/common';
import { UpdateParticipantRequest } from '../../../Sorteio.Communication/requests/participants/update-participant.request';
import { ParticipantResponse } from '../../../Sorteio.Communication/responses/participants/participant.response';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { PARTICIPANTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import type { ParticipantsRepository } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import { FILE_STORAGE_SERVICE } from '../../../Sorteio.Domain/services/storage/file-storage.service';
import type { FileStorageService } from '../../../Sorteio.Domain/services/storage/file-storage.service';
import { ParticipantFileValidator } from '../../validators/participant-file.validator';
import { ParticipantMapper } from './participant.mapper';
import { ParticipantImageFile } from './types/participant-image-file';

@Injectable()
export class UpdateParticipantUseCase {
    constructor(
        @Inject(PARTICIPANTS_REPOSITORY)
        private readonly participantsRepository: ParticipantsRepository,
        @Inject(FILE_STORAGE_SERVICE)
        private readonly fileStorageService: FileStorageService,
    ) { }

    async execute(
        id: string,
        request: UpdateParticipantRequest,
        image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        ParticipantFileValidator.validateImage(image);

        const participant = await this.participantsRepository.findById(id);

        if (!participant) {
            throw new NotFoundException('Participante não encontrado.');
        }

        const exists = await this.participantsRepository.existsByEmailOrDocument({
            email: request.email,
            document: request.document,
            ignoreId: id,
        });

        if (exists) {
            throw new BusinessException(
                'Já existe outro participante com este e-mail ou documento.',
            );
        }

        const uploadedImage = image
            ? await this.fileStorageService.upload({
                folder: 'participants',
                originalName: image.originalname,
                mimeType: image.mimetype,
                buffer: image.buffer,
            })
            : null;

        participant.update({
            ...request,
            imageUrl: uploadedImage?.url,
            imageKey: uploadedImage?.key,
        });

        const updatedParticipant =
            await this.participantsRepository.update(participant);

        return ParticipantMapper.toResponse(updatedParticipant);
    }
}