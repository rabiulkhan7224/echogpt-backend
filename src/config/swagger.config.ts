import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  config: ConfigService,
): void {
  if (config.get('swagger.enabled') !== true) return;

  const doc = new DocumentBuilder()
    .setTitle('EchoGPT API')
    .setDescription(
      'Backend for the EchoGPT Chrome Extension — NestJS + PostgreSQL + TypeORM',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth')
    .addTag('users')
    .addTag('subscriptions')
    .addTag('providers')
    .addTag('chat')
    .addTag('chat-sessions')
    .addTag('search')
    .addTag('admin')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, doc);
  SwaggerModule.setup(config.get<string>('swagger.path')!, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
