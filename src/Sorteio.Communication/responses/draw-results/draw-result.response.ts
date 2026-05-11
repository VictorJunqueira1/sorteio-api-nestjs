import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DrawResultResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    drawSessionId!: string;

    @ApiProperty()
    drawEntryId!: string;

    @ApiProperty()
    displayName!: string;

    @ApiPropertyOptional()
    imageUrl?: string | null;

    @ApiProperty()
    drawnAt!: Date;
}