import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DrawSessionStatus } from '../../../Sorteio.Domain/enums/draw-session-status.enum';
import { DrawSessionType } from '../../../Sorteio.Domain/enums/draw-session-type.enum';

export class DrawSessionResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    title!: string;

    @ApiPropertyOptional()
    description?: string | null;

    @ApiProperty({ enum: DrawSessionType })
    type!: DrawSessionType;

    @ApiProperty({ enum: DrawSessionStatus })
    status!: DrawSessionStatus;

    @ApiProperty()
    allowRepeatedWinners!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiPropertyOptional()
    updatedAt?: Date | null;

    @ApiPropertyOptional()
    finishedAt?: Date | null;
}