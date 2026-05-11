import { ApiProperty } from '@nestjs/swagger';
import { DrawEntryResponse } from './draw-entry.response';

export class InvalidImportedDrawEntryRowResponse {
    @ApiProperty({ example: 3 })
    rowNumber!: number;

    @ApiProperty({ example: 'Nome vazio ou inválido.' })
    reason!: string;

    @ApiProperty({ example: '' })
    rawValue!: string;
}

export class IgnoredImportedDrawEntryResponse {
    @ApiProperty({ example: 'Rafael Barboza' })
    name!: string;

    @ApiProperty({ example: 'Nome duplicado na sessão.' })
    reason!: string;
}

export class ImportDrawEntriesResponse {
    @ApiProperty({ example: 'participantes.xlsx' })
    fileName!: string;

    @ApiProperty({ example: true })
    skipFirstRow!: boolean;

    @ApiProperty({ example: 10 })
    totalRowsRead!: number;

    @ApiProperty({ example: 8 })
    totalValidNames!: number;

    @ApiProperty({ example: 6 })
    totalCreated!: number;

    @ApiProperty({ example: 2 })
    totalIgnored!: number;

    @ApiProperty({ example: 1 })
    totalInvalidRows!: number;

    @ApiProperty({
        type: DrawEntryResponse,
        isArray: true,
        description: 'Entradas criadas com sucesso.',
    })
    created!: DrawEntryResponse[];

    @ApiProperty({
        type: IgnoredImportedDrawEntryResponse,
        isArray: true,
        description: 'Nomes ignorados por duplicidade.',
    })
    ignored!: IgnoredImportedDrawEntryResponse[];

    @ApiProperty({
        type: InvalidImportedDrawEntryRowResponse,
        isArray: true,
        description: 'Linhas inválidas encontradas no arquivo.',
    })
    invalidRows!: InvalidImportedDrawEntryRowResponse[];
}