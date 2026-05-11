import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { DrawEntry } from '../../Sorteio.Domain/entities/draw-entry.entity';
import type {
    CheckDuplicateDrawEntryInput,
    DrawEntriesRepository,
} from '../../Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DrawEntryModel } from '../database/models/draw-entry.model';

@Injectable()
export class TypeOrmDrawEntriesRepository implements DrawEntriesRepository {
    constructor(
        @InjectRepository(DrawEntryModel)
        private readonly repository: Repository<DrawEntryModel>,
    ) { }

    async create(drawEntry: DrawEntry): Promise<DrawEntry> {
        const model = this.repository.create(this.toModel(drawEntry));
        const savedDrawEntry = await this.repository.save(model);

        return this.toDomain(savedDrawEntry);
    }

    async findById(id: string): Promise<DrawEntry | null> {
        const drawEntry = await this.repository.findOne({
            where: { id },
        });

        return drawEntry ? this.toDomain(drawEntry) : null;
    }

    async findBySessionId(drawSessionId: string): Promise<DrawEntry[]> {
        const drawEntries = await this.repository.find({
            where: { drawSessionId },
            order: {
                createdAt: 'ASC',
            },
        });

        return drawEntries.map((drawEntry) => this.toDomain(drawEntry));
    }

    async existsInSession(input: CheckDuplicateDrawEntryInput): Promise<boolean> {
        const displayName = input.displayName?.trim().toLowerCase();
        const participantId = input.participantId?.trim();

        if (!displayName && !participantId) {
            return false;
        }

        const query = this.repository
            .createQueryBuilder('drawEntry')
            .where('drawEntry.drawSessionId = :drawSessionId', {
                drawSessionId: input.drawSessionId,
            });

        query.andWhere(
            new Brackets((qb) => {
                if (displayName) {
                    qb.orWhere('LOWER(drawEntry.displayName) = :displayName', {
                        displayName,
                    });
                }

                if (participantId) {
                    qb.orWhere('drawEntry.participantId = :participantId', {
                        participantId,
                    });
                }
            }),
        );

        return await query.getExists();
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    private toModel(drawEntry: DrawEntry): Partial<DrawEntryModel> {
        return {
            id: drawEntry.id,
            drawSessionId: drawEntry.drawSessionId,
            participantId: drawEntry.participantId ?? null,
            displayName: drawEntry.displayName,
            imageUrl: drawEntry.imageUrl ?? null,
            source: drawEntry.source,
            isWinner: drawEntry.isWinner,
            createdAt: drawEntry.createdAt,
        };
    }

    private toDomain(model: DrawEntryModel): DrawEntry {
        return DrawEntry.restore({
            id: model.id,
            drawSessionId: model.drawSessionId,
            participantId: model.participantId ?? null,
            displayName: model.displayName,
            imageUrl: model.imageUrl ?? null,
            source: model.source,
            isWinner: model.isWinner,
            createdAt: model.createdAt,
        });
    }
}