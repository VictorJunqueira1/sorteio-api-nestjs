import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipantStatus } from '../../../Sorteio.Domain/enums/participant-status.enum';

export class ParticipantResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional()
    email?: string | null;

    @ApiPropertyOptional()
    phone?: string | null;

    @ApiPropertyOptional()
    document?: string | null;

    @ApiPropertyOptional()
    imageUrl?: string | null;

    @ApiProperty({ enum: ParticipantStatus })
    status!: ParticipantStatus;

    @ApiProperty()
    createdAt!: Date;

    @ApiPropertyOptional()
    updatedAt?: Date | null;
}