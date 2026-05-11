import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { ExecuteSimpleDrawUseCase } from '../../Sorteio.Application/use-cases/draw-results/execute-simple-draw.use-case';
import { ListDrawResultsBySessionUseCase } from '../../Sorteio.Application/use-cases/draw-results/list-draw-results-by-session.use-case';
import { DrawResultResponse } from '../../Sorteio.Communication/responses/draw-results/draw-result.response';
import { ExecuteNumberDrawUseCase } from 'src/Sorteio.Application/use-cases/draw-results/execute-number-draw.use-case';
import { ExecuteNumberDrawRequest } from 'src/Sorteio.Communication/requests/draw-results/execute-number-draw.request';

@ApiTags('Resultados do Sorteio')
@Controller('draw-sessions/:drawSessionId')
export class DrawResultsController {
    constructor(
        private readonly executeSimpleDrawUseCase: ExecuteSimpleDrawUseCase,
        private readonly listDrawResultsBySessionUseCase: ListDrawResultsBySessionUseCase,
        private readonly executeNumberDrawUseCase: ExecuteNumberDrawUseCase
    ) { }

    @Post('draw/simple')
    @ApiOperation({
        summary: 'Executar sorteio simples',
        description:
            'Sorteia uma entrada da sessão, registra o resultado no histórico e marca a entrada como vencedora quando a sessão não permite repetição.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiCreatedResponse({
        description: 'Sorteio executado com sucesso.',
        type: DrawResultResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Sessão finalizada, sessão sem entradas ou sem entradas disponíveis para sorteio.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async executeSimpleDraw(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawResultResponse> {
        return await this.executeSimpleDrawUseCase.execute(drawSessionId);
    }

    @Post('draw/number')
    @ApiOperation({
        summary: 'Executar sorteio numérico',
        description:
            'Sorteia um número dentro do intervalo informado. Quando a sessão não permite repetição, números já sorteados ficam indisponíveis.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiCreatedResponse({
        description: 'Sorteio numérico executado com sucesso.',
        type: DrawResultResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Intervalo inválido, sessão finalizada ou sem números disponíveis para sorteio.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async executeNumberDraw(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: ExecuteNumberDrawRequest,
    ): Promise<DrawResultResponse> {
        return await this.executeNumberDrawUseCase.execute(drawSessionId, request);
    }

    @Get('results')
    @ApiOperation({
        summary: 'Listar resultados da sessão',
        description:
            'Lista o histórico de resultados sorteados em uma sessão específica.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiOkResponse({
        description: 'Resultados retornados com sucesso.',
        type: DrawResultResponse,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async findResultsBySession(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawResultResponse[]> {
        return await this.listDrawResultsBySessionUseCase.execute(drawSessionId);
    }
}