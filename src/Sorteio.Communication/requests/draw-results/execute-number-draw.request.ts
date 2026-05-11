import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

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
}