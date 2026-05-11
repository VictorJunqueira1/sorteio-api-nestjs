import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DrawSessionType } from '../../../Sorteio.Domain/enums/draw-session-type.enum';

export class CreateDrawSessionRequest {
    @ApiProperty({ example: 'Sorteio Semana Acadêmica' })
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    title!: string;

    @ApiPropertyOptional({ example: 'Sorteio de brindes do evento.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ enum: DrawSessionType, example: DrawSessionType.Simple })
    @IsEnum(DrawSessionType)
    type!: DrawSessionType;

    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @IsBoolean()
    allowRepeatedWinners?: boolean;
}