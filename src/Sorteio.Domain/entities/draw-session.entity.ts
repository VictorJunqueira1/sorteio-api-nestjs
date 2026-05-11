import { randomUUID } from 'node:crypto';
import { DrawSessionStatus } from '../enums/draw-session-status.enum';
import { DrawSessionType } from '../enums/draw-session-type.enum';
import { BusinessException } from '../exceptions/business.exception';

export interface DrawSessionProps {
    id: string;
    title: string;
    description?: string | null;
    type: DrawSessionType;
    status: DrawSessionStatus;
    allowRepeatedWinners: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
    finishedAt?: Date | null;
}

export interface CreateDrawSessionProps {
    title: string;
    description?: string | null;
    type: DrawSessionType;
    allowRepeatedWinners?: boolean;
}

export class DrawSession {
    private constructor(private readonly props: DrawSessionProps) { }

    static create(props: CreateDrawSessionProps): DrawSession {
        return new DrawSession({
            id: randomUUID(),
            title: DrawSession.normalizeRequiredText(props.title),
            description: DrawSession.normalizeOptionalText(props.description),
            type: props.type,
            status: DrawSessionStatus.Open,
            allowRepeatedWinners: props.allowRepeatedWinners ?? false,
            createdAt: new Date(),
            updatedAt: null,
            finishedAt: null,
        });
    }

    static restore(props: DrawSessionProps): DrawSession {
        return new DrawSession(props);
    }

    finish(): void {
        if (this.props.status === DrawSessionStatus.Finished) {
            throw new BusinessException('A sessão já está finalizada.');
        }

        this.props.status = DrawSessionStatus.Finished;
        this.props.finishedAt = new Date();
        this.props.updatedAt = new Date();
    }

    get id(): string {
        return this.props.id;
    }

    get title(): string {
        return this.props.title;
    }

    get description(): string | null | undefined {
        return this.props.description;
    }

    get type(): DrawSessionType {
        return this.props.type;
    }

    get status(): DrawSessionStatus {
        return this.props.status;
    }

    get allowRepeatedWinners(): boolean {
        return this.props.allowRepeatedWinners;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null | undefined {
        return this.props.updatedAt;
    }

    get finishedAt(): Date | null | undefined {
        return this.props.finishedAt;
    }

    private static normalizeRequiredText(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private static normalizeOptionalText(value?: string | null): string | null {
        const normalized = value?.trim().replace(/\s+/g, ' ');
        return normalized ? normalized : null;
    }
}