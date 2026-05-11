import { Inject, Injectable } from '@nestjs/common';

import { NotFoundException } from '../../../Sorteio.Domain/exceptions/not-found.exception';
import { DRAW_SESSIONS_REPOSITORY } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import type { DrawSessionsRepository } from '../../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';

@Injectable()
export class DeleteDrawSessionUseCase {
    constructor(
        @Inject(DRAW_SESSIONS_REPOSITORY)
        private readonly drawSessionsRepository: DrawSessionsRepository,
    ) { }

    async execute(id: string): Promise<void> {
        const drawSession = await this.drawSessionsRepository.findById(id);

        if (!drawSession) {
            throw new NotFoundException('Sessão de sorteio não encontrada.');
        }

        await this.drawSessionsRepository.delete(id);
    }
}