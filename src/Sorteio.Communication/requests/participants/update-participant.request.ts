import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateParticipantRequest {
    @ApiPropertyOptional({ example: 'Pedro Henrique' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    name?: string;

    @ApiPropertyOptional({ example: 'pedro@email.com' })
    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @ApiPropertyOptional({ example: '(19) 99999-9999' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @ApiPropertyOptional({ example: '12345678900' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    document?: string;

    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'Imagem opcional do participante',
    })
    @IsOptional()
    image?: unknown;
}