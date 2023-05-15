import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { failureReturn, successfullReturn } from 'src/common/constants';
import * as nodemailerhbs from 'nodemailer-express-handlebars';

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}

  transporter = nodemailer
    .createTransport({
      service: 'gmail',
      host: this.config.get('MAIL_HOST'),
      port: 465,
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    })
    .use(
      'compile',
      nodemailerhbs({
        viewEngine: {
          extName: '.hbs',
          partialsDir: 'path/to/partials',
          layoutsDir: 'path/to/layouts',
          defaultLayout: '',
        },
        viewPath: './src/mail/templates/',
        extName: '.hbs',
      }),
    );

  private expiryTime = 2; // minutes

  async sendEmail(to: string, subject: string, content: string) {
    await this.transporter.verify();
    const message = {
      from: { address: this.config.get('MAIL_FROM'), name: 'Praxis' },
      to: to,
      subject: subject.toString(),
      template: 'email',
      context: {
        content: content,
      },
    };
    console.log(message);

    await this.transporter.sendMail(message);

    return successfullReturn(null, 'message sent successfully');
  }
  async sendEmailVerificationLink(email: string, password: string) {
    try {
      this.transporter.verify();
      const message = {
        from: { address: this.config.get('MAIL_FROM'), name: 'Praxis' },
        to: email,
        subject: 'Codewars Registration Successful',
        template: 'verification',
        context: {
          email: email,
          password: password,
        },
      };
      await this.transporter.sendMail(message);

      return successfullReturn(null, 'Email sent successfully');
    } catch (err) {
      return failureReturn(err);
    }
  }
  async sendCertificateEmail(mailOptions: any) {
    await this.transporter.verify();
    try {
      console.log('here');

      await this.transporter
        .sendMail(mailOptions)
        .then((m) => console.log('Mail sent'));
      console.log('Email sent with attachment successfully');
      return successfullReturn(null, 'Email sent with attachment successfully');
    } catch (error) {
      return failureReturn(error);
    }
  }
  async sendOTP(email: string, otp: number) {
    try {
      await this.transporter.verify();
      const message = {
        from: { address: this.config.get('MAIL_FROM'), name: 'Praxis' },
        to: email,
        subject: 'OTP Verification',
        template: 'email',
        context: {
          content:
            'Use the following OTP to complete your Sign Up procedures. OTP is valid for ' +
            this.expiryTime +
            ' minutes',
          otp: otp,
        },
      };
      console.log(message);

      await this.transporter.sendMail(message);

      return successfullReturn({ otp: otp }, 'message sent successfully');
    } catch (err) {
      console.log(err);
      return failureReturn(err);
    }
  }
}
