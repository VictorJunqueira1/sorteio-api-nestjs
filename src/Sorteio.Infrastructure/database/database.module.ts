import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrawEntryModel } from './models/draw-entry.model';
import { DrawSessionModel } from './models/draw-session.model';
import { ParticipantModel } from './models/participant.model';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mssql',
                host: configService.getOrThrow<string>('DB_HOST'),
                port: Number(configService.get<string>('DB_PORT', '1433')),
                username: configService.getOrThrow<string>('DB_USERNAME'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                database: configService.getOrThrow<string>('DB_DATABASE'),
                entities: [
                    ParticipantModel,
                    DrawSessionModel,
                    DrawEntryModel,
                ],
                synchronize: configService.get<string>('TYPEORM_SYNC', 'false') === 'true',
                options: {
                    encrypt: configService.get<string>('DB_ENCRYPT', 'false') === 'true',
                    trustServerCertificate:
                        configService.get<string>('DB_TRUST_SERVER_CERTIFICATE', 'true') ===
                        'true',
                },
            }),
        }),
    ],
})
export class DatabaseModule { }