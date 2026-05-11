import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateBulkManualDrawEntriesRequest {
    @ApiProperty({
        example: ['Rafael Barboza', 'Samuel Frederick', 'Davi William'],
        description: 'Lista de nomes que serão adicionados na sessão de sorteio.',
        isArray: true,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @IsString({ each: true })
    @MinLength(2, { each: true })
    @MaxLength(150, { each: true })
    names!: string[];
}