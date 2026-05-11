import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateManualDrawEntryRequest {
    @ApiProperty({ example: 'Pedro Henrique' })
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    displayName!: string;

    @ApiPropertyOptional({ example: 'https://cdn.exemplo.com/foto.png' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    imageUrl?: string;
}