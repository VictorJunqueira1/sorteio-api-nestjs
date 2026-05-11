import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { CreateDrawSessionUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/create-draw-session.use-case';
import { DeleteDrawSessionUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/delete-draw-session.use-case';
import { FinishDrawSessionUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/finish-draw-session.use-case';
import { GetDrawSessionByIdUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/get-draw-session-by-id.use-case';
import { ListDrawSessionsUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/list-draw-sessions.use-case';

import { CreateDrawSessionRequest } from '../../Sorteio.Communication/requests/draw-sessions/create-draw-session.request';
import { ListDrawSessionsRequest } from '../../Sorteio.Communication/requests/draw-sessions/list-draw-sessions.request';
import { DrawSessionResponse } from '../../Sorteio.Communication/responses/draw-sessions/draw-session.response';

@ApiTags('Sessões de Sorteio')
@Controller('draw-sessions')
export class DrawSessionsController {
    constructor(
        private readonly createDrawSessionUseCase: CreateDrawSessionUseCase,
        private readonly listDrawSessionsUseCase: ListDrawSessionsUseCase,
        private readonly getDrawSessionByIdUseCase: GetDrawSessionByIdUseCase,
        private readonly deleteDrawSessionUseCase: DeleteDrawSessionUseCase,
        private readonly finishDrawSessionUseCase: FinishDrawSessionUseCase,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Criar sessão de sorteio',
        description:
            'Cria uma sessão que poderá receber entradas manuais, participantes cadastrados e resultados de sorteio.',
    })
    @ApiCreatedResponse({
        description: 'Sessão criada com sucesso.',
        type: DrawSessionResponse,
    })
    @ApiBadRequestResponse({
        description: 'Dados inválidos.',
    })
    async create(
        @Body() request: CreateDrawSessionRequest,
    ): Promise<DrawSessionResponse> {
        return await this.createDrawSessionUseCase.execute(request);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar sessões de sorteio',
        description:
            'Lista sessões cadastradas, com paginação e filtro opcional por título ou descrição.',
    })
    @ApiOkResponse({
        description: 'Sessões retornadas com sucesso.',
        type: DrawSessionResponse,
        isArray: true,
    })
    async findAll(
        @Query() request: ListDrawSessionsRequest,
    ): Promise<DrawSessionResponse[]> {
        return await this.listDrawSessionsUseCase.execute(request);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obter sessão por ID',
        description: 'Retorna os dados de uma sessão de sorteio específica.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiOkResponse({
        description: 'Sessão encontrada.',
        type: DrawSessionResponse,
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async findById(@Param('id') id: string): Promise<DrawSessionResponse> {
        return await this.getDrawSessionByIdUseCase.execute(id);
    }

    @Patch(':id/finish')
    @ApiOperation({
        summary: 'Finalizar sessão de sorteio',
        description:
            'Finaliza uma sessão, impedindo novos sorteios e registrando a data de finalização.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiOkResponse({
        description: 'Sessão finalizada com sucesso.',
        type: DrawSessionResponse,
    })
    @ApiBadRequestResponse({
        description: 'A sessão já está finalizada.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async finish(@Param('id') id: string): Promise<DrawSessionResponse> {
        return await this.finishDrawSessionUseCase.execute(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Excluir sessão de sorteio',
        description: 'Remove logicamente uma sessão de sorteio.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiNoContentResponse({
        description: 'Sessão excluída com sucesso.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async delete(@Param('id') id: string): Promise<void> {
        await this.deleteDrawSessionUseCase.execute(id);
    }
}