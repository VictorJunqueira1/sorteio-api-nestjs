import { randomUUID } from 'node:crypto';
import { DrawEntrySource } from '../enums/draw-entry-source.enum';

export interface DrawEntryProps {
    id: string;
    drawSessionId: string;
    participantId?: string | null;
    displayName: string;
    imageUrl?: string | null;
    source: DrawEntrySource;
    isWinner: boolean;
    createdAt: Date;
}

export interface CreateManualDrawEntryProps {
    drawSessionId: string;
    displayName: string;
    imageUrl?: string | null;
}

export interface CreateRegisteredDrawEntryProps {
    drawSessionId: string;
    participantId: string;
    displayName: string;
    imageUrl?: string | null;
}

export class DrawEntry {
    private constructor(private readonly props: DrawEntryProps) { }

    static createManual(props: CreateManualDrawEntryProps): DrawEntry {
        return new DrawEntry({
            id: randomUUID(),
            drawSessionId: props.drawSessionId,
            participantId: null,
            displayName: DrawEntry.normalizeRequiredText(props.displayName),
            imageUrl: props.imageUrl ?? null,
            source: DrawEntrySource.Manual,
            isWinner: false,
            createdAt: new Date(),
        });
    }

    static createRegistered(props: CreateRegisteredDrawEntryProps): DrawEntry {
        return new DrawEntry({
            id: randomUUID(),
            drawSessionId: props.drawSessionId,
            participantId: props.participantId,
            displayName: DrawEntry.normalizeRequiredText(props.displayName),
            imageUrl: props.imageUrl ?? null,
            source: DrawEntrySource.Registered,
            isWinner: false,
            createdAt: new Date(),
        });
    }

    static restore(props: DrawEntryProps): DrawEntry {
        return new DrawEntry(props);
    }

    get id(): string {
        return this.props.id;
    }

    get drawSessionId(): string {
        return this.props.drawSessionId;
    }

    get participantId(): string | null | undefined {
        return this.props.participantId;
    }

    get displayName(): string {
        return this.props.displayName;
    }

    get imageUrl(): string | null | undefined {
        return this.props.imageUrl;
    }

    get source(): DrawEntrySource {
        return this.props.source;
    }

    get isWinner(): boolean {
        return this.props.isWinner;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    private static normalizeRequiredText(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }
}