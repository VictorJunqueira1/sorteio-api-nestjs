import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListParticipantsRequest {
    @ApiPropertyOptional({ example: 'Pedro' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Transform(({ value }) => Number(value ?? 1))
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20 })
    @IsOptional()
    @Transform(({ value }) => Number(value ?? 20))
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize: number = 20;
}