import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { GetPublicDrawSessionUseCase } from '../../Sorteio.Application/use-cases/public-draw-sessions/get-public-draw-session.use-case';
import { JoinPublicDrawSessionUseCase } from '../../Sorteio.Application/use-cases/public-draw-sessions/join-public-draw-session.use-case';
import { JoinPublicDrawSessionRequest } from '../../Sorteio.Communication/requests/public-draw-sessions/join-public-draw-session.request';
import { PublicDrawSessionResponse } from '../../Sorteio.Communication/responses/draw-sessions/public-draw-session.response';
import { JoinPublicDrawSessionResponse } from '../../Sorteio.Communication/responses/public-draw-sessions/join-public-draw-session.response';

@ApiTags('Sessão Pública')
@Controller('public/draw-sessions')
export class PublicDrawSessionsController {
    constructor(
        private readonly getPublicDrawSessionUseCase: GetPublicDrawSessionUseCase,
        private readonly joinPublicDrawSessionUseCase: JoinPublicDrawSessionUseCase,
    ) { }

    @Get(':publicCode')
    @ApiOperation({
        summary: 'Obter sessão pública',
        description:
            'Retorna dados públicos de uma sessão de sorteio a partir do código público.',
    })
    @ApiParam({
        name: 'publicCode',
        description: 'Código público da sessão.',
        example: 'a1b2c3d4e5f6',
    })
    @ApiOkResponse({
        description: 'Sessão pública encontrada.',
        type: PublicDrawSessionResponse,
    })
    @ApiNotFoundResponse({
        description: 'Sessão pública não encontrada.',
    })
    async findPublicSession(
        @Param('publicCode') publicCode: string,
    ): Promise<PublicDrawSessionResponse> {
        return await this.getPublicDrawSessionUseCase.execute(publicCode);
    }

    @Post(':publicCode/join')
    @ApiOperation({
        summary: 'Entrar em sessão pública',
        description:
            'Adiciona um participante na sessão pública por meio do código gerado para QR Code.',
    })
    @ApiParam({
        name: 'publicCode',
        description: 'Código público da sessão.',
        example: 'a1b2c3d4e5f6',
    })
    @ApiCreatedResponse({
        description: 'Participante adicionado à sessão pública.',
        type: JoinPublicDrawSessionResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Nome obrigatório, nome duplicado, sessão finalizada ou cancelada.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão pública não encontrada.',
    })
    async joinPublicSession(
        @Param('publicCode') publicCode: string,
        @Body() request: JoinPublicDrawSessionRequest,
    ): Promise<JoinPublicDrawSessionResponse> {
        return await this.joinPublicDrawSessionUseCase.execute(
            publicCode,
            request,
        );
    }
}