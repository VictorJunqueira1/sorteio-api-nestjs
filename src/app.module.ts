import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './Sorteio.Infrastructure/database/database.module';
import { ParticipantsModule } from './Sorteio.Presentation/modules/participants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ParticipantsModule,
  ],
})
export class AppModule {}