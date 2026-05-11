import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
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

import { CreateManualDrawEntryUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-manual-draw-entry.use-case';
import { CreateRegisteredDrawEntryUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-registered-draw-entry.use-case';
import { CreateManualDrawEntryRequest } from '../../Sorteio.Communication/requests/draw-entries/create-manual-draw-entry.request';
import { CreateRegisteredDrawEntryRequest } from '../../Sorteio.Communication/requests/draw-entries/create-registered-draw-entry.request';
import { DrawEntryResponse } from '../../Sorteio.Communication/responses/draw-entries/draw-entry.response';
import { DeleteDrawEntryUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/delete-draw-entry.use-case';
import { ListDrawEntriesBySessionUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/list-draw-entries-by-session.use-case';
import { CreateBulkManualDrawEntriesUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-bulk-manual-draw-entries.use-case';
import { CreateBulkManualDrawEntriesRequest } from '../../Sorteio.Communication/requests/draw-entries/create-bulk-manual-draw-entries.request';
import { BulkDrawEntriesResponse } from '../../Sorteio.Communication/responses/draw-entries/bulk-draw-entries.response';
import { ImportManualDrawEntriesUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/import-manual-draw-entries.use-case';
import { ImportDrawEntriesResponse } from 'src/Sorteio.Communication/responses/draw-entries/import-draw-entries.response';
import { ImportDrawEntriesRequest } from 'src/Sorteio.Communication/requests/draw-entries/import-draw-entries.request';
import * as importDrawEntriesFile from 'src/Sorteio.Application/use-cases/draw-entries/types/import-draw-entries-file';
import { PreviewImportDrawEntriesUseCase } from '../../Sorteio.Application/use-cases/draw-entries/preview-import-draw-entries.use-case';
import { PreviewImportDrawEntriesResponse } from '../../Sorteio.Communication/responses/draw-entries/preview-import-draw-entries.response';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Entradas da Sessão')
@Controller('draw-sessions/:drawSessionId/entries')
export class DrawEntriesController {
    constructor(
        private readonly createManualDrawEntryUseCase: CreateManualDrawEntryUseCase,
        private readonly createRegisteredDrawEntryUseCase: CreateRegisteredDrawEntryUseCase,
        private readonly createBulkManualDrawEntriesUseCase: CreateBulkManualDrawEntriesUseCase,
        private readonly listDrawEntriesBySessionUseCase: ListDrawEntriesBySessionUseCase,
        private readonly previewImportDrawEntriesUseCase: PreviewImportDrawEntriesUseCase,
        private readonly deleteDrawEntryUseCase: DeleteDrawEntryUseCase,
        private readonly importManualDrawEntriesUseCase: ImportManualDrawEntriesUseCase,
    ) { }

    @Post('manual')
    @ApiOperation({
        summary: 'Adicionar entrada manual na sessão',
        description:
            'Adiciona um nome avulso diretamente em uma sessão de sorteio, sem exigir cadastro global do participante.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiCreatedResponse({
        description: 'Entrada manual criada com sucesso.',
        type: DrawEntryResponse,
    })
    @ApiBadRequestResponse({
        description: 'Entrada duplicada ou dados inválidos.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async createManual(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: CreateManualDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        return await this.createManualDrawEntryUseCase.execute(
            drawSessionId,
            request,
        );
    }

    @Post('bulk')
    @ApiOperation({
        summary: 'Adicionar entradas manuais em lote na sessão',
        description:
            'Adiciona vários nomes de uma vez em uma sessão de sorteio. Nomes duplicados na sessão ou repetidos na lista enviada são ignorados e retornados com o motivo.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiCreatedResponse({
        description: 'Entradas processadas com sucesso.',
        type: BulkDrawEntriesResponse,
    })
    @ApiBadRequestResponse({
        description: 'Sessão finalizada, lista vazia ou dados inválidos.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async createBulkManual(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: CreateBulkManualDrawEntriesRequest,
    ): Promise<BulkDrawEntriesResponse> {
        return await this.createBulkManualDrawEntriesUseCase.execute(
            drawSessionId,
            request,
        );
    }

    @Post('registered')
    @ApiOperation({
        summary: 'Vincular participante cadastrado na sessão',
        description:
            'Cria uma entrada na sessão usando um participante previamente cadastrado.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiCreatedResponse({
        description: 'Participante vinculado com sucesso.',
        type: DrawEntryResponse,
    })
    @ApiBadRequestResponse({
        description: 'Participante já vinculado nesta sessão ou dados inválidos.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão ou participante não encontrado.',
    })
    async createRegistered(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: CreateRegisteredDrawEntryRequest,
    ): Promise<DrawEntryResponse> {
        return await this.createRegisteredDrawEntryUseCase.execute(
            drawSessionId,
            request,
        );
    }

    @Post('import/preview')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: 'Pré-visualizar importação de entradas por arquivo',
        description:
            'Lê um arquivo CSV, XLSX ou TXT e retorna uma prévia dos nomes que podem ser importados, duplicados no arquivo, duplicados na sessão e linhas inválidas. Nenhum dado é salvo no banco.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo CSV, XLSX ou TXT com os nomes.',
                },
                skipFirstRow: {
                    type: 'boolean',
                    example: true,
                    default: false,
                    description:
                        'Quando true, desconsidera a primeira linha do arquivo.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Preview processado com sucesso.',
        type: PreviewImportDrawEntriesResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Arquivo inválido, sessão finalizada ou dados inválidos.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async previewImportFile(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: ImportDrawEntriesRequest,
        @UploadedFile() file?: importDrawEntriesFile.ImportDrawEntriesFile,
    ): Promise<PreviewImportDrawEntriesResponse> {
        return await this.previewImportDrawEntriesUseCase.execute(
            drawSessionId,
            request,
            file,
        );
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: 'Importar entradas por arquivo',
        description:
            'Importa nomes para uma sessão de sorteio a partir de arquivos CSV, XLSX, XLS ou TXT. A flag skipFirstRow permite ignorar a primeira linha quando ela representa cabeçalho.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo CSV, XLSX, XLS ou TXT com os nomes.',
                },
                skipFirstRow: {
                    type: 'boolean',
                    example: true,
                    default: false,
                    description:
                        'Quando true, desconsidera a primeira linha do arquivo.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Arquivo processado com sucesso.',
        type: ImportDrawEntriesResponse,
    })
    @ApiBadRequestResponse({
        description:
            'Arquivo inválido, sessão finalizada, lista sem nomes válidos ou dados inválidos.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async importFile(
        @Param('drawSessionId') drawSessionId: string,
        @Body() request: ImportDrawEntriesRequest,
        @UploadedFile() file?: importDrawEntriesFile.ImportDrawEntriesFile,
    ): Promise<ImportDrawEntriesResponse> {
        return await this.importManualDrawEntriesUseCase.execute(
            drawSessionId,
            request,
            file,
        );
    }

    @Get()
    @ApiOperation({
        summary: 'Listar entradas da sessão',
        description:
            'Lista todas as entradas de uma sessão, incluindo nomes manuais e participantes cadastrados.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiOkResponse({
        description: 'Entradas retornadas com sucesso.',
        type: DrawEntryResponse,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Sessão de sorteio não encontrada.',
    })
    async findBySession(
        @Param('drawSessionId') drawSessionId: string,
    ): Promise<DrawEntryResponse[]> {
        return await this.listDrawEntriesBySessionUseCase.execute(drawSessionId);
    }

    @Delete(':entryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remover entrada da sessão',
        description:
            'Remove logicamente uma entrada específica de uma sessão de sorteio.',
    })
    @ApiParam({
        name: 'drawSessionId',
        description: 'ID da sessão de sorteio.',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
    @ApiParam({
        name: 'entryId',
        description: 'ID da entrada da sessão.',
        example: '8a7c4f61-1111-4321-9999-2c963f66afa6',
    })
    @ApiNoContentResponse({
        description: 'Entrada removida com sucesso.',
    })
    @ApiNotFoundResponse({
        description: 'Sessão ou entrada não encontrada.',
    })
    async delete(
        @Param('drawSessionId') drawSessionId: string,
        @Param('entryId') entryId: string,
    ): Promise<void> {
        await this.deleteDrawEntryUseCase.execute(drawSessionId, entryId);
    }
}