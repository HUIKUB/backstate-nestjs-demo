import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { stringify as yamlStringify } from 'yaml';

function writeOpenApiFiles(document: OpenAPIObject) {
  const outDir = path.resolve(process.cwd(), 'openapi');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'openapi.json'),
    JSON.stringify(document, null, 2),
    'utf-8',
  );

  let yamlText: string;
  try {
    const result = (yamlStringify as (input: unknown) => string)(document);
    if (typeof result !== 'string') {
      throw new TypeError('yamlStringify did not return a string');
    }
    yamlText = result;
  } catch (err) {
    console.error('Failed to stringify OpenAPI document to YAML:', err);
    yamlText = '';
  }
  fs.writeFileSync(path.join(outDir, 'openapi.yaml'), yamlText, 'utf-8');
}

function createOpenApi(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Public API service')
    .setVersion('1.0.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

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

  return document;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  try {
    const document = createOpenApi(app);
    writeOpenApiFiles(document);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to generate OpenAPI files:', err.message);
      console.error(err.stack);
    } else {
      console.error('Failed to generate OpenAPI files:', String(err));
    }
  }

  await app.listen(
    Number(process.env.PORT) || 3000,
    process.env.HOST || '0.0.0.0',
  );
}
void bootstrap();
