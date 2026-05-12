export const DRAW_SESSION_REALTIME_NOTIFIER = Symbol(
    'DRAW_SESSION_REALTIME_NOTIFIER',
);

export interface RealtimeDrawEntry {
    id: string;
    drawSessionId: string;
    participantId?: string | null;
    displayName: string;
    imageUrl?: string | null;
    source: string;
    isWinner: boolean;
    createdAt: Date;
}

export interface NotifyPublicParticipantJoinedInput {
    drawSessionId: string;
    publicCode: string;
    entry: RealtimeDrawEntry;
    totalParticipants: number;
}

export interface NotifyDrawResultCreatedInput {
    drawSessionId: string;
    drawEntryId: string;
    displayName: string;
    imageUrl?: string | null;
    drawnAt: Date;
}

export interface DrawSessionRealtimeNotifier {
    notifyPublicParticipantJoined(
        input: NotifyPublicParticipantJoinedInput,
    ): Promise<void>;

    notifyDrawResultCreated(input: NotifyDrawResultCreatedInput): Promise<void>;
}