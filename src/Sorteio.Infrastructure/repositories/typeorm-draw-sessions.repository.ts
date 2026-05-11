import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { DrawSession } from '../../Sorteio.Domain/entities/draw-session.entity';
import type {
    DrawSessionsRepository,
    ListDrawSessionsFilters,
} from '../../Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { DrawSessionModel } from '../database/models/draw-session.model';

@Injectable()
export class TypeOrmDrawSessionsRepository implements DrawSessionsRepository {
    constructor(
        @InjectRepository(DrawSessionModel)
        private readonly repository: Repository<DrawSessionModel>,
    ) { }

    async create(drawSession: DrawSession): Promise<DrawSession> {
        const model = this.repository.create(this.toModel(drawSession));
        const savedDrawSession = await this.repository.save(model);

        return this.toDomain(savedDrawSession);
    }

    async update(drawSession: DrawSession): Promise<DrawSession> {
        const model = this.repository.create(this.toModel(drawSession));
        const savedDrawSession = await this.repository.save(model);

        return this.toDomain(savedDrawSession);
    }

    async findById(id: string): Promise<DrawSession | null> {
        const drawSession = await this.repository.findOne({
            where: { id },
        });

        return drawSession ? this.toDomain(drawSession) : null;
    }

    async findAll(filters: ListDrawSessionsFilters): Promise<DrawSession[]> {
        const query = this.repository
            .createQueryBuilder('drawSession')
            .orderBy('drawSession.createdAt', 'DESC')
            .skip((filters.page - 1) * filters.pageSize)
            .take(filters.pageSize);

        if (filters.search?.trim()) {
            const search = `%${filters.search.trim().toLowerCase()}%`;

            query.andWhere(
                new Brackets((qb) => {
                    qb.where('LOWER(drawSession.title) LIKE :search', { search })
                        .orWhere('LOWER(drawSession.description) LIKE :search', {
                            search,
                        });
                }),
            );
        }

        const drawSessions = await query.getMany();

        return drawSessions.map((drawSession) => this.toDomain(drawSession));
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    private toModel(drawSession: DrawSession): Partial<DrawSessionModel> {
        return {
            id: drawSession.id,
            title: drawSession.title,
            description: drawSession.description ?? null,
            type: drawSession.type,
            status: drawSession.status,
            allowRepeatedWinners: drawSession.allowRepeatedWinners,
            createdAt: drawSession.createdAt,
            updatedAt: drawSession.updatedAt ?? null,
            finishedAt: drawSession.finishedAt ?? null,
        };
    }

    private toDomain(model: DrawSessionModel): DrawSession {
        return DrawSession.restore({
            id: model.id,
            title: model.title,
            description: model.description ?? null,
            type: model.type,
            status: model.status,
            allowRepeatedWinners: model.allowRepeatedWinners,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt ?? null,
            finishedAt: model.finishedAt ?? null,
        });
    }
}