import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawEntriesController } from '../controllers/draw-entries.controller';
import { DrawSessionsController } from '../controllers/draw-sessions.controller';
import { ParticipantsModule } from './participants.module';
import { DrawSessionModel } from 'src/Sorteio.Infrastructure/database/models/draw-session.model';
import { DrawEntryModel } from 'src/Sorteio.Infrastructure/database/models/draw-entry.model';
import { CreateDrawSessionUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/create-draw-session.use-case';
import { ListDrawSessionsUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/list-draw-sessions.use-case';
import { GetDrawSessionByIdUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/get-draw-session-by-id.use-case';
import { DeleteDrawSessionUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/delete-draw-session.use-case';
import { CreateManualDrawEntryUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/create-manual-draw-entry.use-case';
import { CreateRegisteredDrawEntryUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/create-registered-draw-entry.use-case';
import { DeleteDrawEntryUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/delete-draw-entry.use-case';
import { ListDrawEntriesBySessionUseCase } from 'src/Sorteio.Application/use-cases/draw-entries/list-draw-entries-by-session.use-case';
import { DRAW_ENTRIES_REPOSITORY } from 'src/Sorteio.Domain/repositories/draw-entries/draw-entries.repository';
import { DRAW_SESSIONS_REPOSITORY } from 'src/Sorteio.Domain/repositories/draw-sessions/draw-sessions.repository';
import { TypeOrmDrawEntriesRepository } from 'src/Sorteio.Infrastructure/repositories/typeorm-draw-entries.repository';
import { TypeOrmDrawSessionsRepository } from 'src/Sorteio.Infrastructure/repositories/typeorm-draw-sessions.repository';
import { FinishDrawSessionUseCase } from 'src/Sorteio.Application/use-cases/draw-sessions/finish-draw-session.use-case';
import { CreateBulkManualDrawEntriesUseCase } from '../../Sorteio.Application/use-cases/draw-entries/create-bulk-manual-draw-entries.use-case';
import { DrawResultsController } from '../controllers/draw-results.controller';
import { ExecuteSimpleDrawUseCase } from '../../Sorteio.Application/use-cases/draw-results/execute-simple-draw.use-case';
import { ListDrawResultsBySessionUseCase } from '../../Sorteio.Application/use-cases/draw-results/list-draw-results-by-session.use-case';
import { DRAW_RESULTS_REPOSITORY } from '../../Sorteio.Domain/repositories/draw-results/draw-results.repository';
import { DrawResultModel } from '../../Sorteio.Infrastructure/database/models/draw-result.model';
import { TypeOrmDrawResultsRepository } from '../../Sorteio.Infrastructure/repositories/typeorm-draw-results.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([DrawSessionModel, DrawEntryModel, DrawResultModel]),
        ParticipantsModule,
    ],
    controllers: [DrawSessionsController, DrawEntriesController, DrawResultsController],
    providers: [
        CreateDrawSessionUseCase,
        ListDrawSessionsUseCase,
        GetDrawSessionByIdUseCase,
        DeleteDrawSessionUseCase,

        CreateManualDrawEntryUseCase,
        CreateRegisteredDrawEntryUseCase,
        CreateBulkManualDrawEntriesUseCase,
        ListDrawEntriesBySessionUseCase,
        DeleteDrawEntryUseCase,

        ExecuteSimpleDrawUseCase,
        ListDrawResultsBySessionUseCase,

        FinishDrawSessionUseCase,

        {
            provide: DRAW_SESSIONS_REPOSITORY,
            useClass: TypeOrmDrawSessionsRepository,
        },
        {
            provide: DRAW_ENTRIES_REPOSITORY,
            useClass: TypeOrmDrawEntriesRepository,
        },
        {
            provide: DRAW_RESULTS_REPOSITORY,
            useClass: TypeOrmDrawResultsRepository,
        },
    ],
})
export class DrawSessionsModule { }