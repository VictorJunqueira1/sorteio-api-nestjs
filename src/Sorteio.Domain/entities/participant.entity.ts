import { randomUUID } from 'node:crypto';
import { ParticipantStatus } from '../enums/participant-status.enum';

export interface ParticipantProps {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    imageUrl?: string | null;
    imageKey?: string | null;
    status: ParticipantStatus;
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface CreateParticipantProps {
    name: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    imageUrl?: string | null;
    imageKey?: string | null;
}

export interface UpdateParticipantProps {
    name?: string;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    imageUrl?: string | null;
    imageKey?: string | null;
}

export class Participant {
    private constructor(private readonly props: ParticipantProps) { }

    static create(props: CreateParticipantProps): Participant {
        return new Participant({
            id: randomUUID(),
            name: Participant.normalizeRequiredText(props.name),
            email: Participant.normalizeOptionalText(props.email)?.toLowerCase() ?? null,
            phone: Participant.normalizeOptionalText(props.phone) ?? null,
            document: Participant.normalizeOptionalText(props.document) ?? null,
            imageUrl: props.imageUrl ?? null,
            imageKey: props.imageKey ?? null,
            status: ParticipantStatus.Active,
            createdAt: new Date(),
            updatedAt: null,
        });
    }

    static restore(props: ParticipantProps): Participant {
        return new Participant(props);
    }

    update(props: UpdateParticipantProps): void {
        if (props.name !== undefined) {
            this.props.name = Participant.normalizeRequiredText(props.name);
        }

        if (props.email !== undefined) {
            this.props.email =
                Participant.normalizeOptionalText(props.email)?.toLowerCase() ?? null;
        }

        if (props.phone !== undefined) {
            this.props.phone = Participant.normalizeOptionalText(props.phone) ?? null;
        }

        if (props.document !== undefined) {
            this.props.document =
                Participant.normalizeOptionalText(props.document) ?? null;
        }

        if (props.imageUrl !== undefined) {
            this.props.imageUrl = props.imageUrl;
        }

        if (props.imageKey !== undefined) {
            this.props.imageKey = props.imageKey;
        }

        this.props.updatedAt = new Date();
    }

    get id(): string {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get email(): string | null | undefined {
        return this.props.email;
    }

    get phone(): string | null | undefined {
        return this.props.phone;
    }

    get document(): string | null | undefined {
        return this.props.document;
    }

    get imageUrl(): string | null | undefined {
        return this.props.imageUrl;
    }

    get imageKey(): string | null | undefined {
        return this.props.imageKey;
    }

    get status(): ParticipantStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null | undefined {
        return this.props.updatedAt;
    }

    private static normalizeRequiredText(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private static normalizeOptionalText(value?: string | null): string | null {
        const normalized = value?.trim().replace(/\s+/g, ' ');
        return normalized ? normalized : null;
    }
}