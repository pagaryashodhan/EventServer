import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthDTO } from './dto/auth.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('auth')
  authenticateAdmin(@Body() dto: AuthDTO) {
    return this.adminService.authenticateAdmin(dto);
  }
  @Get('non-registered-users')
  async getNonRegisteredUsers() {
    return this.adminService.getNonRegisteredUsers();
  }
  @Post('add-coordinator')
  async addCoordinator() {
    return '';
  }
}
