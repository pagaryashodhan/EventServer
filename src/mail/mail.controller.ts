import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // @Post('send')
  // async sendEmail(@Query('email') email, @Query('name') name) {
  //   return await this.mailService.sendMail(email, name);
  // }
}
