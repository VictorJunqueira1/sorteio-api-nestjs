import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class JoinPublicDrawSessionRequest {
    @ApiPropertyOptional({
        example: 'Pedro Henrique',
        description: 'Nome do participante. Será obrigatório quando a sessão exigir nome.',
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    displayName?: string;
}