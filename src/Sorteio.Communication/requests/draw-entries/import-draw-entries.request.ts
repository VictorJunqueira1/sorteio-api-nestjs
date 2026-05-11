import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ImportDrawEntriesRequest {
    @ApiPropertyOptional({
        example: true,
        default: false,
        description:
            'Quando true, a primeira linha do arquivo será ignorada por ser considerada cabeçalho.',
    })
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true' || value === '1')
    @IsBoolean()
    skipFirstRow: boolean = false;

    @IsOptional()
    file?: unknown;
}