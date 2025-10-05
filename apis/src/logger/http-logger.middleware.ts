import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;
    const start = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const { statusCode } = res;

      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);

      // ✅ Safely log body (skip if not present or empty)
      if (method !== 'GET' && body && Object.keys(body).length > 0) {
        this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
      }
    });

    next();
  }
}
