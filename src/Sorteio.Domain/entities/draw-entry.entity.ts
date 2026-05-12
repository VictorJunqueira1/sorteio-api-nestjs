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

export interface CreateNumericDrawEntryProps {
    drawSessionId: string;
    displayName: string;
}

export interface CreateQrCodeDrawEntryProps {
    drawSessionId: string;
    displayName: string;
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

    static createNumeric(props: CreateNumericDrawEntryProps): DrawEntry {
        return new DrawEntry({
            id: randomUUID(),
            drawSessionId: props.drawSessionId,
            participantId: null,
            displayName: DrawEntry.normalizeRequiredText(props.displayName),
            imageUrl: null,
            source: DrawEntrySource.Numeric,
            isWinner: false,
            createdAt: new Date(),
        });
    }

    markAsWinner(): void {
        this.props.isWinner = true;
    }

    static restore(props: DrawEntryProps): DrawEntry {
        return new DrawEntry(props);
    }

    static createQrCode(props: CreateQrCodeDrawEntryProps): DrawEntry {
        return new DrawEntry({
            id: randomUUID(),
            drawSessionId: props.drawSessionId,
            participantId: null,
            displayName: DrawEntry.normalizeRequiredText(props.displayName),
            imageUrl: null,
            source: DrawEntrySource.QrCode,
            isWinner: false,
            createdAt: new Date(),
        });
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