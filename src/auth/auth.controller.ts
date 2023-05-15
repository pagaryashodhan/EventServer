import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from './auth.service';
import {
  CheckEmailDTO,
  LoginDTO,
  OtpDTO,
  ResetPasswordDTO,
  SignUpDTO,
  VerifyDTO,
  VerifyEmailMobileDTO,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  //Api for signup
  @Post('signup')
  register(@Body() signUpDTO: SignUpDTO) {
    return this.authService.signUp(signUpDTO);
  }
  @Post('verify-signup')
  verifyEmailPassword(@Body() dto: VerifyEmailMobileDTO) {
    console.log(dto.mobile as number);
    return this.authService.verifySignup(dto);
  }
  //Api for login
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

  //Api for Email Verification Otp generation and sending it to an email using nodemailer
  @Post('send-otp')
  sendOtp(@Body() dto: OtpDTO) {
    return this.authService.sendOtp(dto);
  }

  //Api to verify otp
  @Get('verify-otp')
  verifyOtp(@Body() dto: VerifyDTO) {
    return this.authService.verifyOtp(dto);
  }

  //Api to verify given email
  // @Post('/send-verification-link')
  // async sendVerificationLink(@Body() dto: OtpDTO) {
  //   return this.authService.generateTokenAndSendEmail(dto.email);
  // }

  //Api to reset password
  @Post('/reset-password')
  async resetPassword(@Body() dto: ResetPasswordDTO) {
    return this.authService.resetPassword(dto);
  }
  @Post('/verify-email')
  async checkValidEmail(@Body() dto: CheckEmailDTO) {
    return this.authService.checkValidEmail(dto);
  }
}
