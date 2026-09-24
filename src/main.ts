import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { setupSwagger } from '@config/swagger.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  const apiPrefix = config.get<string>('apiPrefix') ?? 'api/v1';
  const nodeEnv = config.get<string>('nodeEnv') ?? 'development';
  const isProd = nodeEnv === 'production';

  app.enableCors({
    origin: isProd
      ? ['https://echogpt.appifydevs.com'] // tighten for prod
      : true, // reflect origin in dev (Chrome extension + localhost)
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ───────────────────────────────────────────────────────────
  // Routing
  // ───────────────────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());

  // ───────────────────────────────────────────────────────────
  // Graceful shutdown (SIGTERM / SIGINT → onModuleDestroy hooks)
  // ───────────────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ───────────────────────────────────────────────────────────
  // Swagger (skipped automatically when SWAGGER_ENABLED=false)
  // ───────────────────────────────────────────────────────────
  setupSwagger(app, config);

  // ───────────────────────────────────────────────────────────
  // Listen
  // ───────────────────────────────────────────────────────────
  app.useSecurityHeaders();
  await app.listen(port ?? 3000);

  const url = await app.getUrl();
  const swaggerPath = config.get<string>('swagger.path') ?? 'api/docs';

  logger.log(`🚀 ${config.get('appName') ?? 'EchoGPT API'} running`);
  logger.log(`   Environment : ${nodeEnv}`);
  logger.log(`   Base URL    : ${url}/${apiPrefix}`);
  if (config.get<boolean>('swagger.enabled')) {
    logger.log(`   Swagger UI  : ${url}/${swaggerPath}`);
  }
  logger.log(`   Health      : ${url}/${apiPrefix}/health`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Fatal bootstrap error', err);
  process.exit(1);
});
