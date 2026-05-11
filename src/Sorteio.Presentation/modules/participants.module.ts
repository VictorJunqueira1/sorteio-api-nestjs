import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/create-participant.use-case';
import { DeleteParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/delete-participant.use-case';
import { GetParticipantByIdUseCase } from '../../Sorteio.Application/use-cases/participants/get-participant-by-id.use-case';
import { ListParticipantsUseCase } from '../../Sorteio.Application/use-cases/participants/list-participants.use-case';
import { UpdateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/update-participant.use-case';
import { PARTICIPANTS_REPOSITORY } from '../../Sorteio.Domain/repositories/participants/participants.repository';
import { FILE_STORAGE_SERVICE } from '../../Sorteio.Domain/services/storage/file-storage.service';
import { ParticipantModel } from '../../Sorteio.Infrastructure/database/models/participant.model';
import { TypeOrmParticipantsRepository } from '../../Sorteio.Infrastructure/repositories/typeorm-participants.repository';
import { S3FileStorageService } from '../../Sorteio.Infrastructure/services/storage/s3-file-storage.service';
import { ParticipantsController } from '../controllers/participants.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ParticipantModel])],
    controllers: [ParticipantsController],
    providers: [
        CreateParticipantUseCase,
        ListParticipantsUseCase,
        GetParticipantByIdUseCase,
        UpdateParticipantUseCase,
        DeleteParticipantUseCase,
        {
            provide: PARTICIPANTS_REPOSITORY,
            useClass: TypeOrmParticipantsRepository,
        },
        {
            provide: FILE_STORAGE_SERVICE,
            useClass: S3FileStorageService,
        },
    ],
    exports: [PARTICIPANTS_REPOSITORY],
})
export class ParticipantsModule { }