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
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CreateDrawSessionUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/create-draw-session.use-case';
import { FinishDrawSessionUseCase } from '../../Sorteio.Application/use-cases/draw-sessions/finish-draw-session.use-case';
import { CreateDrawSessionRequest } from '../../Sorteio.Communication/requests/draw-sessions/create-draw-session.request';
import { ListDrawSessionsRequest } from '../../Sorteio.Communication/requests/draw-sessions/list-draw-sessions.request';
import { DrawSessionResponse } from '../../Sorteio.Communication/responses/draw-sessions/draw-session.response';
import { DeleteDrawSessionUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/delete-draw-session.use-case';
import { GetDrawSessionByIdUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/get-draw-session-by-id.use-case';
import { ListDrawSessionsUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/list-draw-sessions.use-case';

@ApiTags('Sessões de Sorteio')
@Controller('draw-sessions')
export class DrawSessionsController {
    constructor(
        private readonly createDrawSessionUseCase: CreateDrawSessionUseCase,
        private readonly listDrawSessionsUseCase: ListDrawSessionsUseCase,
        private readonly getDrawSessionByIdUseCase: GetDrawSessionByIdUseCase,
        private readonly deleteDrawSessionUseCase: DeleteDrawSessionUseCase,
        private readonly finishDrawSessionUseCase: FinishDrawSessionUseCase,
    ) { }

    @Post()
    @ApiCreatedResponse({ type: DrawSessionResponse })
    async create(
        @Body() request: CreateDrawSessionRequest,
    ): Promise<DrawSessionResponse> {
        return await this.createDrawSessionUseCase.execute(request);
    }

    @Get()
    @ApiOkResponse({ type: DrawSessionResponse, isArray: true })
    async findAll(
        @Query() request: ListDrawSessionsRequest,
    ): Promise<DrawSessionResponse[]> {
        return await this.listDrawSessionsUseCase.execute(request);
    }

    @Get(':id')
    @ApiOkResponse({ type: DrawSessionResponse })
    async findById(@Param('id') id: string): Promise<DrawSessionResponse> {
        return await this.getDrawSessionByIdUseCase.execute(id);
    }

    @Patch(':id/finish')
    @ApiOkResponse({ type: DrawSessionResponse })
    async finish(@Param('id') id: string): Promise<DrawSessionResponse> {
        return await this.finishDrawSessionUseCase.execute(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    async delete(@Param('id') id: string): Promise<void> {
        await this.deleteDrawSessionUseCase.execute(id);
    }
}