import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class EnablePublicDrawSessionRequest {
    @ApiPropertyOptional({
        example: true,
        default: true,
        description: 'Define se o participante precisa informar nome para entrar.',
    })
    @IsOptional()
    @IsBoolean()
    requireParticipantName?: boolean;

    @ApiPropertyOptional({
        example: false,
        default: false,
        description: 'Define se nomes repetidos podem entrar mais de uma vez na sessão pública.',
    })
    @IsOptional()
    @IsBoolean()
    allowDuplicatePublicEntries?: boolean;
}