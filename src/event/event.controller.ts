import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import {
  AddEventDTO,
  GetParticipantDetailsForEventDTO,
  RegisterEventDTO,
  VerifyRegisterDTO,
} from './dto';
import { EventService } from './event.service';
import { RegisterCodewarsDTO } from './dto/register_codewars.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // @UseGuards(RolesGuard)
  @Get('get-events')
  async getAllEvents() {
    return await this.eventService.getAllEvents();
  }

  @Get('get-event/:eventId')
  async getEventByEventId(@Param('eventId') eventId: string) {
    return await this.eventService.getEventById(eventId);
  }
  //TODO: swap places with /api/user/

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('details/:eventId')
  async getEventDetails(@Param('eventId') eventId: string) {
    return await this.eventService.getEventDetails(eventId);
  }

  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  @Get('participants-verification/:eventId')
  async verifyParticipation(@Param('eventId') eventId: string) {
    return await this.eventService.checkRegistration(eventId);
  }
  @Post('participant-details/:eventId')
  async getParticipantDetails(@Param('eventId') eventId: string) {
    return await this.eventService.getRegisteredUsers(eventId);
  }
  @Post('participants-count/:eventId')
  async participantCount(@Param('eventId') eventId: string) {
    return await this.eventService.participantCount(eventId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('add-event')
  async addEvent(@Body() dto: AddEventDTO) {
    return await this.eventService.addEvent(dto);
  }
  @Post('register/codewars')
  async registerForCodewars(@Body() dto: RegisterCodewarsDTO) {
    return this.eventService.registerForCodewars(dto);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('register/:eventId')
  async registerUserForEvent(
    @Param('eventId') eventId: string,
    @Body() dto: RegisterEventDTO,
  ) {
    return await this.eventService.registerUsersForEvent(eventId, dto);
  }
  @Post('verify-register/:eventId')
  async verifyRegisterUserForEvent(
    @Param('eventId') eventId: string,
    @Body() dto: VerifyRegisterDTO,
  ) {
    return await this.eventService.verifyRegistration(eventId, dto);
  }
  @Get('get-forms-data/:eventId')
  async getFormsData(@Param('eventId') eventId: string) {
    return await this.eventService.getFormsData(eventId);
  }
}
