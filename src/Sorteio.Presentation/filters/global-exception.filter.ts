import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../Sorteio.Domain/exceptions/not-found.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        const { statusCode, message } = this.getErrorResponse(exception);

        response.status(statusCode).json({
            statusCode,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }

    private getErrorResponse(exception: unknown): {
        statusCode: number;
        message: string | string[];
    } {
        if (exception instanceof BusinessException) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: exception.message,
            };
        }

        if (exception instanceof NotFoundException) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: exception.message,
            };
        }

        if (exception instanceof BadRequestException) {
            const response = exception.getResponse();

            if (typeof response === 'object' && response && 'message' in response) {
                return {
                    statusCode: exception.getStatus(),
                    message: (response as { message: string | string[] }).message,
                };
            }
        }

        if (exception instanceof HttpException) {
            return {
                statusCode: exception.getStatus(),
                message: exception.message,
            };
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro interno do servidor.',
        };
    }
}