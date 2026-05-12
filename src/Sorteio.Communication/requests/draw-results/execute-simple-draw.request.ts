import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ExecuteSimpleDrawRequest {
    @ApiPropertyOptional({
        example: false,
        description: 'Define se esta execução pode repetir itens já sorteados. Quando não enviado, usa a configuração salva na sessão.',
    })
    @IsOptional()
    @IsBoolean()
    allowRepeatedWinners?: boolean;
}