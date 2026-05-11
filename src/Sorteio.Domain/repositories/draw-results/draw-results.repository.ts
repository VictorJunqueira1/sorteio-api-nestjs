import { DrawResult } from '../../entities/draw-result.entity';

export const DRAW_RESULTS_REPOSITORY = Symbol('DRAW_RESULTS_REPOSITORY');

export interface DrawResultsRepository {
    create(drawResult: DrawResult): Promise<DrawResult>;
    findBySessionId(drawSessionId: string): Promise<DrawResult[]>;
    deleteBySessionId(drawSessionId: string): Promise<void>;
}