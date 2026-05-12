import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicDrawSessionCodeResponse {
    @ApiProperty()
    drawSessionId!: string;

    @ApiProperty({ example: 'a1b2c3d4e5f6' })
    publicCode!: string;

    @ApiPropertyOptional({
        example: 'http://localhost:3000/public/draw-sessions/a1b2c3d4e5f6',
    })
    publicUrl?: string | null;

    @ApiProperty()
    requireParticipantName!: boolean;

    @ApiProperty()
    allowDuplicatePublicEntries!: boolean;
}