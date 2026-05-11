import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/create-participant.use-case';
import { DeleteParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/delete-participant.use-case';
import { GetParticipantByIdUseCase } from '../../Sorteio.Application/use-cases/participants/get-participant-by-id.use-case';
import { ListParticipantsUseCase } from '../../Sorteio.Application/use-cases/participants/list-participants.use-case';
import { UpdateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/update-participant.use-case';
import type { ParticipantImageFile } from '../../Sorteio.Application/use-cases/participants/types/participant-image-file';

import { CreateParticipantRequest } from '../../Sorteio.Communication/requests/participants/create-participant.request';
import { ListParticipantsRequest } from '../../Sorteio.Communication/requests/participants/list-participants.request';
import { UpdateParticipantRequest } from '../../Sorteio.Communication/requests/participants/update-participant.request';
import { ParticipantResponse } from '../../Sorteio.Communication/responses/participants/participant.response';

@ApiTags('Participantes')
@Controller('participants')
export class ParticipantsController {
    constructor(
        private readonly createParticipantUseCase: CreateParticipantUseCase,
        private readonly listParticipantsUseCase: ListParticipantsUseCase,
        private readonly getParticipantByIdUseCase: GetParticipantByIdUseCase,
        private readonly updateParticipantUseCase: UpdateParticipantUseCase,
        private readonly deleteParticipantUseCase: DeleteParticipantUseCase,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({
        summary: 'Criar participante',
        description:
            'Cria um participante global que poderá ser reutilizado em uma ou mais sessões de sorteio. A imagem é opcional.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    example: 'Pedro Henrique',
                },
                email: {
                    type: 'string',
                    example: 'pedro@email.com',
                },
                phone: {
                    type: 'string',
                    example: '(19) 99999-9999',
                },
                document: {
                    type: 'string',
                    example: '12345678900',
                },
                image: {
                    type: 'string',
                    format: 'binary',
                    nullable: true,
                    description: 'Imagem opcional do participante.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Participante criado com sucesso.',
        type: ParticipantResponse,
    })
    @ApiBadRequestResponse({
        description: 'Dados inválidos ou participante duplicado.',
    })
    async create(
        @Body() request: CreateParticipantRequest,
        @UploadedFile() image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        return await this.createParticipantUseCase.execute(request, image);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar participantes',
        description:
            'Lista participantes cadastrados, com paginação e filtro opcional por nome, e-mail ou documento.',
    })
    @ApiOkResponse({
        description: 'Participantes retornados com sucesso.',
        type: ParticipantResponse,
        isArray: true,
    })
    async findAll(
        @Query() request: ListParticipantsRequest,
    ): Promise<ParticipantResponse[]> {
        return await this.listParticipantsUseCase.execute(request);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obter participante por ID',
        description: 'Retorna os dados de um participante específico.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do participante.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiOkResponse({
        description: 'Participante encontrado.',
        type: ParticipantResponse,
    })
    @ApiNotFoundResponse({
        description: 'Participante não encontrado.',
    })
    async findById(@Param('id') id: string): Promise<ParticipantResponse> {
        return await this.getParticipantByIdUseCase.execute(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({
        summary: 'Atualizar participante',
        description:
            'Atualiza os dados de um participante. A imagem é opcional e, quando enviada, substitui a URL atual.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do participante.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    example: 'Pedro Henrique',
                },
                email: {
                    type: 'string',
                    example: 'pedro@email.com',
                },
                phone: {
                    type: 'string',
                    example: '(19) 99999-9999',
                },
                document: {
                    type: 'string',
                    example: '12345678900',
                },
                image: {
                    type: 'string',
                    format: 'binary',
                    nullable: true,
                    description: 'Nova imagem opcional do participante.',
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'Participante atualizado com sucesso.',
        type: ParticipantResponse,
    })
    @ApiBadRequestResponse({
        description: 'Dados inválidos ou participante duplicado.',
    })
    @ApiNotFoundResponse({
        description: 'Participante não encontrado.',
    })
    async update(
        @Param('id') id: string,
        @Body() request: UpdateParticipantRequest,
        @UploadedFile() image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        return await this.updateParticipantUseCase.execute(id, request, image);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Excluir participante',
        description: 'Remove logicamente um participante cadastrado.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do participante.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiNoContentResponse({
        description: 'Participante excluído com sucesso.',
    })
    @ApiNotFoundResponse({
        description: 'Participante não encontrado.',
    })
    async delete(@Param('id') id: string): Promise<void> {
        await this.deleteParticipantUseCase.execute(id);
    }
}