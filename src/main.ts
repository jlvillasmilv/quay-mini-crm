import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpStatus } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './filters/entity-not-found.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes MUST be registered before `app.listen()`, otherwise they are
  // added after the application has initialized and never applied to routes.
  app.useGlobalPipes(
    new ValidationPipe({
      // Strips from the payload any property without a decorator in the DTO
      whitelist: true,
      // Rejects (400) requests that contain unknown properties
      forbidNonWhitelisted: true,
      // Converts the payload into instances of the DTO classes
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  app.useGlobalFilters(new EntityNotFoundExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
