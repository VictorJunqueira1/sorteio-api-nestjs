import { Inject, Injectable } from '@nestjs/common';
import { CreateParticipantRequest } from '../../../Sorteio.Communication/requests/participants/create-participant.request';
import { ParticipantResponse } from '../../../Sorteio.Communication/responses/participants/participant.response';
import { Participant } from '../../../Sorteio.Domain/entities/participant.entity';
import { BusinessException } from '../../../Sorteio.Domain/exceptions/business.exception';
import { PARTICIPANTS_REPOSITORY, } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import type { ParticipantsRepository, } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import { FILE_STORAGE_SERVICE, } from '../../../Sorteio.Domain/services/storage/file-storage.service';
import type { FileStorageService, } from '../../../Sorteio.Domain/services/storage/file-storage.service';
import { ParticipantFileValidator } from '../../validators/participant-file.validator';
import { ParticipantMapper } from './participant.mapper';
import { ParticipantImageFile } from './types/participant-image-file';

@Injectable()
export class CreateParticipantUseCase {
    constructor(
        @Inject(PARTICIPANTS_REPOSITORY)
        private readonly participantsRepository: ParticipantsRepository,
        @Inject(FILE_STORAGE_SERVICE)
        private readonly fileStorageService: FileStorageService,
    ) { }

    async execute(
        request: CreateParticipantRequest,
        image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        ParticipantFileValidator.validateImage(image);

        const exists = await this.participantsRepository.existsByEmailOrDocument({
            email: request.email,
            document: request.document,
        });

        if (exists) {
            throw new BusinessException(
                'Já existe um participante com este e-mail ou documento.',
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

        const participant = Participant.create({
            name: request.name,
            email: request.email,
            phone: request.phone,
            document: request.document,
            imageUrl: uploadedImage?.url ?? null,
            imageKey: uploadedImage?.key ?? null,
        });

        const createdParticipant = await this.participantsRepository.create(participant);

        return ParticipantMapper.toResponse(createdParticipant);
    }
}