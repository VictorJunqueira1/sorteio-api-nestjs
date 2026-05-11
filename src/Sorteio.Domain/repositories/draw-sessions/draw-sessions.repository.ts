import { DrawSession } from '../../entities/draw-session.entity';

export const DRAW_SESSIONS_REPOSITORY = Symbol('DRAW_SESSIONS_REPOSITORY');

export interface ListDrawSessionsFilters {
    search?: string;
    page: number;
    pageSize: number;
}

export interface DrawSessionsRepository {
    create(drawSession: DrawSession): Promise<DrawSession>;
    update(drawSession: DrawSession): Promise<DrawSession>;
    findById(id: string): Promise<DrawSession | null>;
    findAll(filters: ListDrawSessionsFilters): Promise<DrawSession[]>;
    delete(id: string): Promise<void>;
}