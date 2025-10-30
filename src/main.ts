import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';
import * as fs from 'node:fs';

function createOpenApi(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Public API service')
    .setVersion('1.0.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  app
    .getHttpAdapter()
    .get('/openapi.json', (_req: Request, res: Response) => res.json(document));

  app.use(
    '/reference',
    apiReference({
      url: '/openapi.json',
      theme: 'purple',
    }),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
      transform: true,
    }),
  );

  createOpenApi(app);

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  const baseUrl = await app.getUrl();
  console.log(
    `🚀 Server running at ${baseUrl}\n` +
      `   • OpenAPI JSON:  ${baseUrl}/openapi.json\n` +
      `   • Scalar (UI):   ${baseUrl}/reference\n`,
  );
}

bootstrap();
