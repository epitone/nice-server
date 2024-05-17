import { Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepository } from './app.repository.impl';
import { ConfigModule } from '@nestjs/config';

const repository: Provider[] = [
  {
    provide: 'niceApiRepository',
    useClass: AppRepository,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ...repository],
})
export class AppModule {}
