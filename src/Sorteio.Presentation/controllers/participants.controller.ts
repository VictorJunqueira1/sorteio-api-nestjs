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
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/create-participant.use-case';
import { DeleteParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/delete-participant.use-case';
import { GetParticipantByIdUseCase } from '../../Sorteio.Application/use-cases/participants/get-participant-by-id.use-case';
import { ListParticipantsUseCase } from '../../Sorteio.Application/use-cases/participants/list-participants.use-case';
import { UpdateParticipantUseCase } from '../../Sorteio.Application/use-cases/participants/update-participant.use-case';
import { CreateParticipantRequest } from '../../Sorteio.Communication/requests/participants/create-participant.request';
import { ListParticipantsRequest } from '../../Sorteio.Communication/requests/participants/list-participants.request';
import { UpdateParticipantRequest } from '../../Sorteio.Communication/requests/participants/update-participant.request';
import { ParticipantResponse } from '../../Sorteio.Communication/responses/participants/participant.response';
import type { ParticipantImageFile } from 'src/Sorteio.Application/use-cases/participants/types/participant-image-file';

@ApiTags('Participantes')
@Controller('participants')
export class ParticipantsController {
    constructor(
        private readonly createParticipantUseCase: CreateParticipantUseCase,
        private readonly listParticipantsUseCase: ListParticipantsUseCase,
        private readonly getParticipantByIdUseCase: GetParticipantByIdUseCase,
        private readonly updateParticipantUseCase: UpdateParticipantUseCase,
        private readonly deleteParticipantUseCase: DeleteParticipantUseCase,
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: { type: 'string', example: 'Pedro Henrique' },
                email: { type: 'string', example: 'pedro@email.com' },
                phone: { type: 'string', example: '(19) 99999-9999' },
                document: { type: 'string', example: '12345678900' },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiCreatedResponse({ type: ParticipantResponse })
    async create(
        @Body() request: CreateParticipantRequest,
        @UploadedFile() image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        return await this.createParticipantUseCase.execute(request, image);
    }

    @Get()
    @ApiOkResponse({ type: ParticipantResponse, isArray: true })
    async findAll(
        @Query() request: ListParticipantsRequest,
    ): Promise<ParticipantResponse[]> {
        return await this.listParticipantsUseCase.execute(request);
    }

    @Get(':id')
    @ApiOkResponse({ type: ParticipantResponse })
    async findById(@Param('id') id: string): Promise<ParticipantResponse> {
        return await this.getParticipantByIdUseCase.execute(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Pedro Henrique' },
                email: { type: 'string', example: 'pedro@email.com' },
                phone: { type: 'string', example: '(19) 99999-9999' },
                document: { type: 'string', example: '12345678900' },
                image: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiOkResponse({ type: ParticipantResponse })
    async update(
        @Param('id') id: string,
        @Body() request: UpdateParticipantRequest,
        @UploadedFile() image?: ParticipantImageFile,
    ): Promise<ParticipantResponse> {
        return await this.updateParticipantUseCase.execute(id, request, image);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.deleteParticipantUseCase.execute(id);
    }
}