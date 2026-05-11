import { randomUUID } from 'node:crypto';

export interface DrawResultProps {
    id: string;
    drawSessionId: string;
    drawEntryId: string;
    displayName: string;
    imageUrl?: string | null;
    drawnAt: Date;
}

export interface CreateDrawResultProps {
    drawSessionId: string;
    drawEntryId: string;
    displayName: string;
    imageUrl?: string | null;
}

export class DrawResult {
    private constructor(private readonly props: DrawResultProps) { }

    static create(props: CreateDrawResultProps): DrawResult {
        return new DrawResult({
            id: randomUUID(),
            drawSessionId: props.drawSessionId,
            drawEntryId: props.drawEntryId,
            displayName: DrawResult.normalizeRequiredText(props.displayName),
            imageUrl: props.imageUrl ?? null,
            drawnAt: new Date(),
        });
    }

    static restore(props: DrawResultProps): DrawResult {
        return new DrawResult(props);
    }

    get id(): string {
        return this.props.id;
    }

    get drawSessionId(): string {
        return this.props.drawSessionId;
    }

    get drawEntryId(): string {
        return this.props.drawEntryId;
    }

    get displayName(): string {
        return this.props.displayName;
    }

    get imageUrl(): string | null | undefined {
        return this.props.imageUrl;
    }

    get drawnAt(): Date {
        return this.props.drawnAt;
    }

    private static normalizeRequiredText(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }
}