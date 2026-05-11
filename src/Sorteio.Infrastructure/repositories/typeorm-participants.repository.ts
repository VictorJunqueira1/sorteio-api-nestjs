import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Participant } from '../../Sorteio.Domain/entities/participant.entity';
import {
    CheckDuplicateParticipantInput,
    ListParticipantsFilters,
    ParticipantsRepository,
} from '../../Sorteio.Domain/repositories/participants/participants.repository';
import { ParticipantModel } from '../database/models/participant.model';

@Injectable()
export class TypeOrmParticipantsRepository implements ParticipantsRepository {
    constructor(
        @InjectRepository(ParticipantModel)
        private readonly repository: Repository<ParticipantModel>,
    ) { }

    async create(participant: Participant): Promise<Participant> {
        const model = this.repository.create(this.toModel(participant));
        const savedParticipant = await this.repository.save(model);
        return this.toDomain(savedParticipant);
    }

    async update(participant: Participant): Promise<Participant> {
        const model = this.repository.create(this.toModel(participant));
        const savedParticipant = await this.repository.save(model);
        return this.toDomain(savedParticipant);
    }

    async findById(id: string): Promise<Participant | null> {
        const participant = await this.repository.findOne({ where: { id } });
        return participant ? this.toDomain(participant) : null;
    }

    async findAll(filters: ListParticipantsFilters): Promise<Participant[]> {
        const query = this.repository
            .createQueryBuilder('participant')
            .orderBy('participant.createdAt', 'DESC')
            .skip((filters.page - 1) * filters.pageSize)
            .take(filters.pageSize);

        if (filters.search?.trim()) {
            const search = `%${filters.search.trim().toLowerCase()}%`;

            query.andWhere(
                new Brackets((qb) => {
                    qb.where('LOWER(participant.name) LIKE :search', { search })
                        .orWhere('LOWER(participant.email) LIKE :search', { search })
                        .orWhere('LOWER(participant.document) LIKE :search', { search });
                }),
            );
        }

        const participants = await query.getMany();
        return participants.map((participant) => this.toDomain(participant));
    }

    async existsByEmailOrDocument(
        input: CheckDuplicateParticipantInput,
    ): Promise<boolean> {
        const email = input.email?.trim().toLowerCase();
        const document = input.document?.trim();

        if (!email && !document) {
            return false;
        }

        const query = this.repository.createQueryBuilder('participant');

        query.where(
            new Brackets((qb) => {
                if (email) qb.orWhere('LOWER(participant.email) = :email', { email });
                if (document) {
                    qb.orWhere('participant.document = :document', { document });
                }
            }),
        );

        if (input.ignoreId) {
            query.andWhere('participant.id <> :ignoreId', {
                ignoreId: input.ignoreId,
            });
        }

        return await query.getExists();
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    private toModel(participant: Participant): Partial<ParticipantModel> {
        return {
            id: participant.id,
            name: participant.name,
            email: participant.email ?? null,
            phone: participant.phone ?? null,
            document: participant.document ?? null,
            imageUrl: participant.imageUrl ?? null,
            imageKey: participant.imageKey ?? null,
            status: participant.status,
            createdAt: participant.createdAt,
            updatedAt: participant.updatedAt ?? null,
        };
    }

    private toDomain(model: ParticipantModel): Participant {
        return Participant.restore({
            id: model.id,
            name: model.name,
            email: model.email ?? null,
            phone: model.phone ?? null,
            document: model.document ?? null,
            imageUrl: model.imageUrl ?? null,
            imageKey: model.imageKey ?? null,
            status: model.status,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt ?? null,
        });
    }
}