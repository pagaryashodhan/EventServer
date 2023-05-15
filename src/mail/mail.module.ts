import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Global() // 👈 global module
@Module({
  imports: [ConfigModule],
  providers: [MailService, ConfigService],
  exports: [MailService],
})
export class MailModule {}
