import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';

import { DrawEntryModel } from './draw-entry.model';
import { DrawSessionModel } from './draw-session.model';

@Entity({ name: 'draw_results' })
export class DrawResultModel {
    @PrimaryColumn({ name: 'id', type: 'uniqueidentifier' })
    id!: string;

    @Column({ name: 'draw_session_id', type: 'uniqueidentifier' })
    drawSessionId!: string;

    @Column({ name: 'draw_entry_id', type: 'uniqueidentifier' })
    drawEntryId!: string;

    @Column({ name: 'display_name', type: 'varchar', length: 150 })
    displayName!: string;

    @Column({ name: 'image_url', type: 'varchar', length: 1000, nullable: true })
    imageUrl?: string | null;

    @Column({ name: 'drawn_at', type: 'datetime2' })
    drawnAt!: Date;

    @ManyToOne(() => DrawSessionModel)
    @JoinColumn({ name: 'draw_session_id' })
    drawSession?: DrawSessionModel;

    @ManyToOne(() => DrawEntryModel)
    @JoinColumn({ name: 'draw_entry_id' })
    drawEntry?: DrawEntryModel;
}