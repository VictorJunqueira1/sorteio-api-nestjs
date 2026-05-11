import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrawEntrySource } from '../../../Sorteio.Domain/enums/draw-entry-source.enum';

export class DrawEntryResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    drawSessionId!: string;

    @ApiPropertyOptional()
    participantId?: string | null;

    @ApiProperty()
    displayName!: string;

    @ApiPropertyOptional()
    imageUrl?: string | null;

    @ApiProperty({ enum: DrawEntrySource })
    source!: DrawEntrySource;

    @ApiProperty()
    isWinner!: boolean;

    @ApiProperty()
    createdAt!: Date;
}