import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ExecuteSimpleDrawUseCase } from '../../Sorteio.Application/use-cases/draw-results/execute-simple-draw.use-case';
import { ListDrawResultsBySessionUseCase } from '../../Sorteio.Application/use-cases/draw-results/list-draw-results-by-session.use-case';
import { DrawResultResponse } from '../../Sorteio.Communication/responses/draw-results/draw-result.response';

@ApiTags('Resultados do Sorteio')
@Controller('draw-sessions/:drawSessionId')
export class DrawResultsController {
    constructor(
        private readonly executeSimpleDrawUseCase: ExecuteSimpleDrawUseCase,
        private readonly listDrawResultsBySessionUseCase: ListDrawResultsBySessionUseCase,
    ) { }

    @Post('draw/simple')
    @ApiCreatedResponse({ type: DrawResultResponse })
    async executeSimpleDraw(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawResultResponse> {
        return await this.executeSimpleDrawUseCase.execute(drawSessionId);
    }

    @Get('results')
    @ApiOkResponse({ type: DrawResultResponse, isArray: true })
    async findResultsBySession(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawResultResponse[]> {
        return await this.listDrawResultsBySessionUseCase.execute(drawSessionId);
    }
}