import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileDTO } from './dto/profile.dto';
import { UserService } from './user.service';
import { CertificateDTO } from './dto/certificate.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  async getUserProfileDetails(@Body() dto: ProfileDTO) {
    return await this.userService.getProfileDetails(dto);
  }
  @Post('get-user-token/:userId')
  async getToken(@Param('userId') userId: string) {
    return await this.userService.getToken(userId);
  }

  @Get('getAllUsers')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }
  @Get('get-pass/:userId')
  async getPass(@Param('userId') userId: string) {
    return this.userService.getPass(userId);
  }
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Get(':userId')
  // async getRegisteredEventsForUser(@Param('userId') userId: string) {
  //   return await this.eventService.getRegisteredEvents(userId);
  // }
  @Get('get-certificate')
  async getCertificate(@Body() dto: CertificateDTO) {
    return this.userService.getCertificate(dto);
  }
}
