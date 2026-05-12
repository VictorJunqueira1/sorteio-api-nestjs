import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { DrawSessionType } from '../../../Sorteio.Domain/enums/draw-session-type.enum';

@Entity({ name: 'draw_sessions' })
export class DrawSessionModel {
    @PrimaryColumn({ name: 'id', type: 'uniqueidentifier' })
    id!: string;

    @Column({ name: 'title', type: 'varchar', length: 150 })
    title!: string;

    @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
    description?: string | null;

    @Column({ name: 'type', type: 'varchar', length: 30 })
    type!: DrawSessionType;

    @Column({
        name: 'status',
        type: 'varchar',
        length: 30,
        default: DrawSessionStatus.Open,
    })
    status!: DrawSessionStatus;

    @Column({
        name: 'allow_repeated_winners',
        type: 'bit',
        default: false,
    })
    allowRepeatedWinners!: boolean;

    @Column({
        name: 'is_public',
        type: 'bit',
        default: false,
    })
    isPublic!: boolean;

    @Column({
        name: 'public_code',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    publicCode?: string | null;

    @Column({
        name: 'require_participant_name',
        type: 'bit',
        default: true,
    })
    requireParticipantName!: boolean;

    @Column({
        name: 'allow_duplicate_public_entries',
        type: 'bit',
        default: false,
    })
    allowDuplicatePublicEntries!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime2', nullable: true })
    updatedAt?: Date | null;

    @Column({ name: 'finished_at', type: 'datetime2', nullable: true })
    finishedAt?: Date | null;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
    deletedAt?: Date | null;
}