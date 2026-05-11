import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CreateManualDrawEntryUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-manual-draw-entry.use-case';
import { CreateRegisteredDrawEntryUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-registered-draw-entry.use-case';
import { DeleteDrawEntryUseCase } from '../../Sorteio.Application/use-cases/draw-entries/delete-draw-entry.use-case';
import { ListDrawEntriesBySessionUseCase } from '../../Sorteio.Application/use-cases/draw-entries/list-draw-entries-by-session.use-case';
import { CreateManualDrawEntryRequest } from '../../Sorteio.Communication/requests/draw-entries/create-manual-draw-entry.request';
import { CreateRegisteredDrawEntryRequest } from '../../Sorteio.Communication/requests/draw-entries/create-registered-draw-entry.request';
import { DrawEntryResponse } from '../../Sorteio.Communication/responses/draw-entries/draw-entry.response';

@ApiTags('Entradas da Sessão')
@Controller('draw-sessions/:drawSessionId/entries')
export class DrawEntriesController {
    constructor(
        private readonly createManualDrawEntryUseCase: CreateManualDrawEntryUseCase,
        private readonly createRegisteredDrawEntryUseCase: CreateRegisteredDrawEntryUseCase,
        private readonly listDrawEntriesBySessionUseCase: ListDrawEntriesBySessionUseCase,
        private readonly deleteDrawEntryUseCase: DeleteDrawEntryUseCase,
    ) { }

    @Post('manual')
    @ApiCreatedResponse({ type: DrawEntryResponse })
    async createManual(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: CreateManualDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        return await this.createManualDrawEntryUseCase.execute(
            drawSessionId,
            request,
        );
    }

    @Post('registered')
    @ApiCreatedResponse({ type: DrawEntryResponse })
    async createRegistered(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: CreateRegisteredDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        return await this.createRegisteredDrawEntryUseCase.execute(
            drawSessionId,
            request,
        );
    }

    @Get()
    @ApiOkResponse({ type: DrawEntryResponse, isArray: true })
    async findBySession(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawEntryResponse[]> {
        return await this.listDrawEntriesBySessionUseCase.execute(drawSessionId);
    }

    @Delete(':entryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    async delete(
        @Param('drawSessionId') drawSessionId: string,
        @Param('entryId') entryId: string,
    ): Promise<void> {
        await this.deleteDrawEntryUseCase.execute(drawSessionId, entryId);
    }
}