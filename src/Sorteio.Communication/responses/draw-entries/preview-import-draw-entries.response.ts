import { ApiProperty } from '@nestjs/swagger';

export class PreviewImportedDrawEntryNameResponse {
    @ApiProperty({ example: 2 })
    rowNumber!: number;

    @ApiProperty({ example: 'Rafael Barboza' })
    name!: string;
}

export class PreviewDuplicatedDrawEntryResponse {
    @ApiProperty({ example: 4 })
    rowNumber!: number;

    @ApiProperty({ example: 'Rafael Barboza' })
    name!: string;

    @ApiProperty({ example: 'Nome duplicado no arquivo.' })
    reason!: string;
}

export class PreviewInvalidImportedDrawEntryRowResponse {
    @ApiProperty({ example: 5 })
    rowNumber!: number;

    @ApiProperty({ example: 'Nome deve ter pelo menos 2 caracteres.' })
    reason!: string;

    @ApiProperty({ example: 'A' })
    rawValue!: string;
}

export class PreviewImportDrawEntriesResponse {
    @ApiProperty({ example: 'participantes.xlsx' })
    fileName!: string;

    @ApiProperty({ example: true })
    skipFirstRow!: boolean;

    @ApiProperty({ example: 10 })
    totalRowsRead!: number;

    @ApiProperty({ example: 8 })
    totalValidNames!: number;

    @ApiProperty({ example: 5 })
    totalReadyToImport!: number;

    @ApiProperty({ example: 1 })
    totalDuplicatedInFile!: number;

    @ApiProperty({ example: 2 })
    totalDuplicatedInSession!: number;

    @ApiProperty({ example: 1 })
    totalInvalidRows!: number;

    @ApiProperty({
        type: PreviewImportedDrawEntryNameResponse,
        isArray: true,
        description: 'Nomes válidos que podem ser importados.',
    })
    readyToImport!: PreviewImportedDrawEntryNameResponse[];

    @ApiProperty({
        type: PreviewDuplicatedDrawEntryResponse,
        isArray: true,
        description: 'Nomes duplicados dentro do próprio arquivo.',
    })
    duplicatedInFile!: PreviewDuplicatedDrawEntryResponse[];

    @ApiProperty({
        type: PreviewDuplicatedDrawEntryResponse,
        isArray: true,
        description: 'Nomes já existentes na sessão.',
    })
    duplicatedInSession!: PreviewDuplicatedDrawEntryResponse[];

    @ApiProperty({
        type: PreviewInvalidImportedDrawEntryRowResponse,
        isArray: true,
        description: 'Linhas inválidas encontradas no arquivo.',
    })
    invalidRows!: PreviewInvalidImportedDrawEntryRowResponse[];
}