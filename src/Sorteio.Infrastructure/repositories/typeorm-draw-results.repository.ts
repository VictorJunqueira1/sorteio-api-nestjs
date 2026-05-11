import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DrawResult } from '../../Sorteio.Domain/entities/draw-result.entity';
import type { DrawResultsRepository } from '../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DrawResultModel } from '../database/models/draw-result.model';

@Injectable()
export class TypeOrmDrawResultsRepository implements DrawResultsRepository {
    constructor(
        @InjectRepository(DrawResultModel)
        private readonly repository: Repository<DrawResultModel>,
    ) { }

    async create(drawResult: DrawResult): Promise<DrawResult> {
        const model = this.repository.create(this.toModel(drawResult));
        const savedDrawResult = await this.repository.save(model);

        return this.toDomain(savedDrawResult);
    }

    async findBySessionId(drawSessionId: string): Promise<DrawResult[]> {
        const drawResults = await this.repository.find({
            where: { drawSessionId },
            order: {
                drawnAt: 'DESC',
            },
        });

        return drawResults.map((drawResult) => this.toDomain(drawResult));
    }

    async deleteBySessionId(drawSessionId: string): Promise<void> {
        await this.repository.delete({ drawSessionId });
    }

    private toModel(drawResult: DrawResult): Partial<DrawResultModel> {
        return {
            id: drawResult.id,
            drawSessionId: drawResult.drawSessionId,
            drawEntryId: drawResult.drawEntryId,
            displayName: drawResult.displayName,
            imageUrl: drawResult.imageUrl ?? null,
            drawnAt: drawResult.drawnAt,
        };
    }

    private toDomain(model: DrawResultModel): DrawResult {
        return DrawResult.restore({
            id: model.id,
            drawSessionId: model.drawSessionId,
            drawEntryId: model.drawEntryId,
            displayName: model.displayName,
            imageUrl: model.imageUrl ?? null,
            drawnAt: model.drawnAt,
        });
    }
}