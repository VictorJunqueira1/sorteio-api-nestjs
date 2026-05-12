import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ExecuteNumberDrawRequest {
    @ApiProperty({
        example: 0,
        description: 'Menor número que poderá ser sorteado.',
    })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @Max(100000)
    min!: number;

    @ApiProperty({
        example: 100,
        description: 'Maior número que poderá ser sorteado.',
    })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @Max(100000)
    max!: number;

    @ApiPropertyOptional({
        example: false,
        description: 'Define se esta execução pode repetir números já sorteados. Quando não enviado, usa a configuração salva na sessão.',
    })
    @IsOptional()
    @IsBoolean()
    allowRepeatedWinners?: boolean;
}