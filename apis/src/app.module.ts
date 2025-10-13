import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { HttpLoggerMiddleware } from './logger/http-logger.middleware';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { BusinessListingModule } from './business-listing/business-listing.module';
import { FreeBuyerModule } from './free-buyer/free-buyer.module';
import { FavoriteListingModule } from './favorite-listing/favorite-listing.module';
import { RecentlyListingModule } from './recently-listing/recently-listing.module';
import { FreeSellerController } from './free-seller/free-seller.controller';
import { FreeSellerService } from './free-seller/free-seller.service';
import { FreeSellerModule } from './free-seller/free-seller.module';
import { NdaService } from './nda/nda.service';
import { NdaController } from './nda/nda.controller';
import { NdaModule } from './nda/nda.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost/exitramp',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    BusinessListingModule,
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          auth: {
            user: configService.get('EMAIL_USERNAME'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"Exit Ramp" <noreply@yourapp.com>',
        },
        template: {
          dir: join(__dirname, 'common', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    FreeBuyerModule,
    FavoriteListingModule,
    RecentlyListingModule,
    FreeSellerModule,
    NdaModule,
    FilesModule,
  ]
 
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
