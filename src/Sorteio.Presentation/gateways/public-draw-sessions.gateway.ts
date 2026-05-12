import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import type {
    DrawSessionRealtimeNotifier,
    NotifyDrawResultCreatedInput,
    NotifyPublicParticipantJoinedInput,
} from '../../Sorteio.Domain/services/realtime/draw-session-realtime-notifier.service';

interface JoinDrawSessionPayload {
    drawSessionId: string;
}

interface JoinPublicSessionPayload {
    publicCode: string;
}

interface WatchPublicEntryPayload {
    publicCode: string;
    entryId: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class PublicDrawSessionsGateway
    implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    DrawSessionRealtimeNotifier {
    @WebSocketServer()
    private readonly server!: Server;

    handleConnection(client: Socket): void {
        client.emit('connection.ready', {
            socketId: client.id,
            connectedAt: new Date().toISOString(),
        });
    }

    handleDisconnect(_client: Socket): void { }

    @SubscribeMessage('draw-session.join')
    handleJoinDrawSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinDrawSessionPayload,
    ): void {
        if (!payload?.drawSessionId) {
            client.emit('error.message', {
                message: 'drawSessionId é obrigatório.',
            });
            return;
        }

        client.join(this.getDrawSessionRoom(payload.drawSessionId));

        client.emit('draw-session.joined', {
            drawSessionId: payload.drawSessionId,
        });
    }

    @SubscribeMessage('public-session.join')
    handleJoinPublicSession(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinPublicSessionPayload,
    ): void {
        if (!payload?.publicCode) {
            client.emit('error.message', {
                message: 'publicCode é obrigatório.',
            });
            return;
        }

        client.join(this.getPublicSessionRoom(payload.publicCode));

        client.emit('public-session.joined', {
            publicCode: payload.publicCode,
        });
    }

    @SubscribeMessage('public-entry.watch')
    handleWatchPublicEntry(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: WatchPublicEntryPayload,
    ): void {
        if (!payload?.publicCode || !payload?.entryId) {
            client.emit('error.message', {
                message: 'publicCode e entryId são obrigatórios.',
            });
            return;
        }

        client.join(this.getPublicSessionRoom(payload.publicCode));
        client.join(this.getEntryRoom(payload.entryId));

        client.emit('public-entry.watching', {
            publicCode: payload.publicCode,
            entryId: payload.entryId,
        });
    }

    async notifyPublicParticipantJoined(
        input: NotifyPublicParticipantJoinedInput,
    ): Promise<void> {
        const payload = {
            drawSessionId: input.drawSessionId,
            publicCode: input.publicCode,
            entry: input.entry,
            totalParticipants: input.totalParticipants,
        };

        this.server
            .to(this.getDrawSessionRoom(input.drawSessionId))
            .emit('public-session.participant-joined', payload);

        this.server
            .to(this.getPublicSessionRoom(input.publicCode))
            .emit('public-session.updated', payload);
    }

    async notifyDrawResultCreated(
        input: NotifyDrawResultCreatedInput,
    ): Promise<void> {
        const payload = {
            drawSessionId: input.drawSessionId,
            drawEntryId: input.drawEntryId,
            displayName: input.displayName,
            imageUrl: input.imageUrl ?? null,
            drawnAt: input.drawnAt,
        };

        this.server
            .to(this.getDrawSessionRoom(input.drawSessionId))
            .emit('draw-session.result-created', payload);

        this.server
            .to(this.getEntryRoom(input.drawEntryId))
            .emit('public-entry.drawn', payload);
    }

    private getDrawSessionRoom(drawSessionId: string): string {
        return `draw-session:${drawSessionId}`;
    }

    private getPublicSessionRoom(publicCode: string): string {
        return `public-session:${publicCode}`;
    }

    private getEntryRoom(entryId: string): string {
        return `entry:${entryId}`;
    }
}