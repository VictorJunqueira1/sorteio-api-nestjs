import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
    FileStorageService,
    UploadedFile,
    UploadFileInput,
} from '../../../Sorteio.Domain/services/storage/file-storage.service';

@Injectable()
export class S3FileStorageService implements FileStorageService {
    private readonly client: S3Client;
    private readonly bucketName: string;
    private readonly publicBaseUrl?: string;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
        this.publicBaseUrl = this.configService.get<string>('AWS_S3_PUBLIC_BASE_URL');

        this.client = new S3Client({
            region: this.configService.getOrThrow<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
        });
    }

    async upload(input: UploadFileInput): Promise<UploadedFile> {
        const extension = extname(input.originalName);
        const key = `${input.folder}/${randomUUID()}${extension}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: input.buffer,
                ContentType: input.mimeType,
            }),
        );

        return {
            key,
            url: this.buildFileUrl(key),
        };
    }

    private buildFileUrl(key: string): string {
        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
        }

        const region = this.configService.getOrThrow<string>('AWS_REGION');
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }
}