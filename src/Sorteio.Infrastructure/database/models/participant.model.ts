import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ParticipantStatus } from '../../../Sorteio.Domain/enums/participant-status.enum';

@Entity({ name: 'participants' })
export class ParticipantModel {
    @PrimaryColumn({ name: 'id', type: 'uniqueidentifier' })
    id!: string;

    @Column({ name: 'name', type: 'varchar', length: 150 })
    name!: string;

    @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
    email?: string | null;

    @Column({ name: 'phone', type: 'varchar', length: 30, nullable: true })
    phone?: string | null;

    @Column({ name: 'document', type: 'varchar', length: 50, nullable: true })
    document?: string | null;

    @Column({ name: 'image_url', type: 'varchar', length: 1000, nullable: true })
    imageUrl?: string | null;

    @Column({ name: 'image_key', type: 'varchar', length: 500, nullable: true })
    imageKey?: string | null;

    @Column({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: ParticipantStatus.Active,
    })
    status!: ParticipantStatus;

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime2', nullable: true })
    updatedAt?: Date | null;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime2', nullable: true })
    deletedAt?: Date | null;
}