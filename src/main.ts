import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as hbs from 'express-handlebars';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, 'mail', 'templates'));
  app.engine('hbs', hbs.engine({ extname: 'hbs' }));
  app.setViewEngine('hbs');
  app.enableCors();
  app.use(
    session({
      secret: 'secret key',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 400000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
