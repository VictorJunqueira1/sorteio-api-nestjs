import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { DrawEntrySource } from '../../../Sorteio.Domain/enums/draw-entry-source.enum';
import { DrawSessionModel } from './draw-session.model';
import { ParticipantModel } from './participant.model';

@Entity({ name: 'draw_entries' })
export class DrawEntryModel {
    @PrimaryColumn({ name: 'id', type: 'uniqueidentifier' })
    id!: string;

    @Column({ name: 'draw_session_id', type: 'uniqueidentifier' })
    drawSessionId!: string;

    @Column({ name: 'participant_id', type: 'uniqueidentifier', nullable: true })
    participantId?: string | null;

    @Column({ name: 'display_name', type: 'varchar', length: 150 })
    displayName!: string;

    @Column({ name: 'image_url', type: 'varchar', length: 1000, nullable: true })
    imageUrl?: string | null;

    @Column({ name: 'source', type: 'varchar', length: 30 })
    source!: DrawEntrySource;

    @Column({ name: 'is_winner', type: 'bit', default: false })
    isWinner!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
    deletedAt?: Date | null;

    @ManyToOne(() => DrawSessionModel)
    @JoinColumn({ name: 'draw_session_id' })
    drawSession?: DrawSessionModel;

    @ManyToOne(() => ParticipantModel, { nullable: true })
    @JoinColumn({ name: 'participant_id' })
    participant?: ParticipantModel | null;
}