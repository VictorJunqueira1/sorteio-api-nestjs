import { ApiProperty } from '@nestjs/swagger';
import { DrawEntryResponse } from './draw-entry.response';

export class IgnoredDrawEntryResponse {
    @ApiProperty({ example: 'Rafael Barboza' })
    name!: string;

    @ApiProperty({ example: 'Nome duplicado na sessão.' })
    reason!: string;
}

export class BulkDrawEntriesResponse {
    @ApiProperty({
        type: DrawEntryResponse,
        isArray: true,
        description: 'Entradas criadas com sucesso.',
    })
    created!: DrawEntryResponse[];

    @ApiProperty({
        type: IgnoredDrawEntryResponse,
        isArray: true,
        description: 'Nomes ignorados com o motivo.',
    })
    ignored!: IgnoredDrawEntryResponse[];

    @ApiProperty({ example: 3 })
    totalReceived!: number;

    @ApiProperty({ example: 2 })
    totalCreated!: number;

    @ApiProperty({ example: 1 })
    totalIgnored!: number;
}