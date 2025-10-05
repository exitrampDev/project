import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If it's a class-validator validation error
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse['message'] &&
      Array.isArray(exceptionResponse['message'])
    ) {
      const formattedErrors: Record<string, string> = {};

      for (const error of exceptionResponse['message']) {
        // Parse "field must be xyz" into: field => message
        const [fieldMatch] = error.match(/^[\w_]+/) || [];
        if (fieldMatch) {
          formattedErrors[fieldMatch] = error;
        }
      }

      return response.status(status).json({
        statusCode: status,
        message: formattedErrors,
        error: 'Bad Request',
      });
    }

    // Fallback to default error response
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
