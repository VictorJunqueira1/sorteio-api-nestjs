import { DrawEntry } from '../../entities/draw-entry.entity';

export const DRAW_ENTRIES_REPOSITORY = Symbol('DRAW_ENTRIES_REPOSITORY');

export interface CheckDuplicateDrawEntryInput {
    drawSessionId: string;
    displayName?: string | null;
    participantId?: string | null;
}

export interface DrawEntriesRepository {
    create(drawEntry: DrawEntry): Promise<DrawEntry>;
    findById(id: string): Promise<DrawEntry | null>;
    findBySessionId(drawSessionId: string): Promise<DrawEntry[]>;
    existsInSession(input: CheckDuplicateDrawEntryInput): Promise<boolean>;
    delete(id: string): Promise<void>;
}