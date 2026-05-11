import { Participant } from '../../entities/participant.entity';

export const PARTICIPANTS_REPOSITORY = Symbol('PARTICIPANTS_REPOSITORY');

export interface ListParticipantsFilters {
    search?: string;
    page: number;
    pageSize: number;
}

export interface CheckDuplicateParticipantInput {
    email?: string | null;
    document?: string | null;
    ignoreId?: string;
}

export interface ParticipantsRepository {
    create(participant: Participant): Promise<Participant>;
    update(participant: Participant): Promise<Participant>;
    findById(id: string): Promise<Participant | null>;
    findAll(filters: ListParticipantsFilters): Promise<Participant[]>;
    existsByEmailOrDocument(input: CheckDuplicateParticipantInput): Promise<boolean>;
    delete(id: string): Promise<void>;
}