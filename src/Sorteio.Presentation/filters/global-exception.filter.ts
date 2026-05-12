import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BusinessException } from '../../Sorteio.Domain/exceptions/business.exception';
import { NotFoundException } from '../../Sorteio.Domain/exceptions/not-found.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        if (!(exception instanceof BusinessException)
            && !(exception instanceof NotFoundException)
            && !(exception instanceof HttpException)) {
            this.logger.error(
                `Unhandled exception on ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

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
            const exceptionResponse = exception.getResponse();

            if (
                typeof exceptionResponse === 'object'
                && exceptionResponse
                && 'message' in exceptionResponse
            ) {
                return {
                    statusCode: exception.getStatus(),
                    message: (exceptionResponse as { message: string | string[] }).message,
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