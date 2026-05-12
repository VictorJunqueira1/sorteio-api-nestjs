import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';

export class PublicDrawSessionResponse {
    @ApiProperty()
    publicCode!: string;

    @ApiProperty()
    title!: string;

    @ApiPropertyOptional()
    description?: string | null;

    @ApiProperty({ enum: DrawSessionStatus })
    status!: DrawSessionStatus;

    @ApiProperty()
    requireParticipantName!: boolean;

    @ApiProperty()
    allowDuplicatePublicEntries!: boolean;

    @ApiProperty()
    totalParticipants!: number;
}