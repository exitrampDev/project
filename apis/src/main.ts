import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './logger/winston.logger';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Enable Winston Logger globally
    logger:  WinstonModule.createLogger(winstonLoggerOptions),
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // accessible via http://localhost:3000/uploads/<filename>
  });
  
  app.useGlobalFilters(new ValidationExceptionFilter());
  // currently not using validation pipes globally
  // Uncomment the following line to enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.useGlobalGuards(new JwtAuthGuard());

   app.enableCors({
    origin: ['http://localhost:5173','http://localhost:3000', 'http://3.87.119.123:5173'], 
    credentials: true,
  });
  const port = 3000;
  await app.listen(port,'0.0.0.0');
  Logger.log(`🚀 Application is running on http://localhost:${port}`);
}
bootstrap();
