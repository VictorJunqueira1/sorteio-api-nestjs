import { Inject, Injectable } from '@nestjs/common';
import { ListParticipantsRequest } from '../../../Sorteio.Communication/requests/participants/list-participants.request';
import { ParticipantResponse } from '../../../Sorteio.Communication/responses/participants/participant.response';
import { PARTICIPANTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import type { ParticipantsRepository } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import { ParticipantMapper } from './participant.mapper';

@Injectable()
export class ListParticipantsUseCase {
    constructor(
        @Inject(PARTICIPANTS_REPOSITORY)
        private readonly participantsRepository: ParticipantsRepository,
    ) { }

    async execute(request: ListParticipantsRequest): Promise<ParticipantResponse[]> {
        const participants = await this.participantsRepository.findAll({
            search: request.search,
            page: request.page,
            pageSize: request.pageSize,
        });

        return participants.map(ParticipantMapper.toResponse);
    }
}