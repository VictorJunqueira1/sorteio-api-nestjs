import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { PARTICIPANTS_REPOSITORY } from '../../../Sorteio.Domain/repositories/participants/participants.repository';
import type { ParticipantsRepository } from '../../../Sorteio.Domain/repositories/participants/participants.repository';

@Injectable()
export class DeleteParticipantUseCase {
    constructor(
        @Inject(PARTICIPANTS_REPOSITORY)
        private readonly participantsRepository: ParticipantsRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const participant = await this.participantsRepository.findById(id);

        if (!participant) {
            throw new NotFoundException('Participante não encontrado.');
        }

        await this.participantsRepository.delete(id);
    }
}