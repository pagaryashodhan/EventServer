import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { failureReturn, successfullReturn } from 'src/common/constants';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyRegisterDTO } from './dto';
import { AddEventDTO } from './dto/addevent.dto';
import { RegisterEventDTO } from './dto/register.dto';
import { RegisterCodewarsDTO } from './dto/register_codewars.dto';
import * as argon from 'argon2';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}
  async checkRegistration(eventId: string) {
    const data = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        data: true,
      },
    });
    const usersList = [];

    const users = await this.prisma.user.findMany();
    for (let i = 0; i < users.length; i++) {
      // users
      if (users[i].registeredEventsId.includes(eventId)) {
        usersList.push(users[i].email);
      }
    }

    for (let j = 0; j < data.data.length; j++) {
      const obj = data.data[j];
      for (let i = 0; i < Object.entries(obj).length; i++) {
        const entry = Object.entries(obj)[i];
        if (entry[0].substring(0, 5).toLowerCase() == 'email') {
          const index = usersList.indexOf(entry[1]);
          console.log(entry[1]);

          if (index > -1) {
            usersList.splice(index, 1);
          }
        }
      }
    }
    const usersDetails = [];
    for (let i = 0; i < usersList.length; i++) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { email: usersList[i] },
          select: {
            first_name: true,
            last_name: true,
            mobile: true,
            email: true,
            college: true,
            year: true,
          },
        });
        usersDetails.push(user);
      } catch (error) {
        console.log(error);
      }
    }
    return successfullReturn(
      { users: usersDetails, count: usersDetails.length },
      '',
    );
  }
  async getFormsData(eventId: string) {
    const data = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        data: true,
      },
    });

    for (let j = 0; j < data.data.length; j++) {
      const obj = data.data[j];
      let count = 1;
      for (let i = 0; i < Object.entries(obj).length; i++) {
        const entry = Object.entries(obj)[i];
        // Object.entries(obj).map(async (entry) => {
        // console.log(entry);

        if (entry[0].substring(0, 5).toLowerCase() == 'email') {
          try {
            const user = await this.prisma.user.findUnique({
              where: { email: entry[1] },
              select: {
                first_name: true,
                last_name: true,
                mobile: true,
                email: true,
                year: true,
                college: true,
              },
            });
            data.data[j][`name of Player ${count}`] =
              user.first_name + ' ' + user.last_name;
            data.data[j][`mobile of Player ${count}`] = user.mobile;
            data.data[j][`year of Player ${count}`] = user.year;
            data.data[j][`college of Player ${count}`] = user.college;
            count++;
          } catch (error) {
            console.log(entry[1]);
            console.log(error);
          }

          // console.log(user);
        }
      }

      // for (const key in Object.keys(obj)) {
      //   // console.log(obj[Object.keys[key]]);
      //   // if (key.substring(0, 5).toLowerCase() == 'email') {
      //   //   const user = await this.prisma.user.findUnique({
      //   //     where: {
      //   //       email: data.data[key].toString(),
      //   //     },
      //   //   });
      //   //   console.log(user);
      //   // }
      // }
    }
    // const arr = data.data;
    const grades = new Map();
    data.data.forEach(function (item) {
      grades.set(JSON.stringify(item), item);
    });

    // console.log([...grades.values()]);

    console.log(data);
    return [...grades.values()];
  }
  async participantCount(eventId: string) {
    let count = 0;
    const usersList = [];
    const users = await this.prisma.user.findMany();
    for (let i = 0; i < users.length; i++) {
      // users
      if (users[i].registeredEventsId.includes(eventId)) {
        count++;
        usersList.push(users[i]);
      }
    }

    return successfullReturn({ users: usersList, count: count }, '');
  }
  // Get all events
  async addEvent(dto: AddEventDTO) {
    try {
      await this.prisma.event.create({
        data: {
          // userId: '',
          description: dto.description,
          startDate: new Date('2020-03-19T14:21:00+0200'),
          endDate: new Date('2021-03-19T14:21:00+0200'),
          // endDate: dto.end_date,
          name: dto.name,
          posterUrl: dto.poster_url,
          registration_fee: dto.registration_fee,
          rulebookUrl: dto.rulebook_url,
          // startDate: dto.start_date,
          venue: dto.venue,
        },
      });
      return successfullReturn('Event Added');
    } catch (error) {
      console.log(error);
    }
  }
  async getAllEvents() {
    try {
      const events = await this.prisma.event.findMany();
      return successfullReturn(events, 'Events Fetched Successfully');
    } catch (error) {
      // console.log(error);
      return failureReturn(error);
    }
  }
  async registerForCodewars(dto: RegisterCodewarsDTO) {
    const password = Math.random().toString(36).slice(-8);
    const name = dto.displayName.split(' ');
    const firstName = name[0];

    const lastName = name.length > 1 ? name[name.length - 1] : '-';
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user && user.registeredEventsId.includes('63f499cf228cba057e4e844c')) {
      return failureReturn('Already registered for codewars');
    }

    //If no user is present
    if (!user) {
      const hash = await argon.hash(password);
      try {
        const newUser = await this.prisma.user.create({
          data: {
            branch: dto.collegeBranch,
            email: dto.email,
            first_name: firstName,
            last_name: lastName,
            mobile: dto.phoneNumber,
            year: 4 - (dto.graduationYear - 2023),
            password: hash,
            registeredEventsId: { set: '63f499cf228cba057e4e844c' },
          },
        });
        await this.prisma.event.update({
          where: {
            id: '63f499cf228cba057e4e844c',
          },
          data: {
            participantsId: { push: newUser.id },
          },
        });
        this.mailService.sendEmailVerificationLink(dto.email, password);

        return successfullReturn(
          null,
          'Created a user and registered for Codewars successfully ',
        );
      } catch (error) {
        return failureReturn(error);
      }
    } else {
      const oldUser = await this.prisma.user
        .update({
          where: {
            email: dto.email,
          },
          data: {
            registeredEventsId: {
              push: '63f499cf228cba057e4e844c',
            },
          },
        })
        .then(async (res) => {
          await this.prisma.event
            .update({
              where: {
                id: '63f499cf228cba057e4e844c',
              },
              data: {
                participantsId: { push: res.id },
              },
            })
            .then((res) => {
              this.mailService.sendEmail(
                dto.email,
                'Event Registration Successfull',
                'Thank You for registering for ' +
                  'Codewars' +
                  '' +
                  '\nFollow this whatsapp link to join our Whatsapp Group: ' +
                  'https://chat.whatsapp.com/E7ZuSgqOgB24wwxmema2jj',
              );
              return successfullReturn(
                null,
                'Registered for codewars successfully',
              );
            });
        })
        .catch((e) => {
          return failureReturn(e);
        });
    }
  }
  async getEventById(eventId: string) {
    try {
      const events = await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });
      return successfullReturn(events, 'Event Fetched Successfully');
    } catch (error) {
      return failureReturn(error);
    }
  }
  async verifyRegistration(eventId: string, dto: VerifyRegisterDTO) {
    try {
      console.log(dto);

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      if (dto.referal != '') {
        if (
          !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(dto.referal)
        ) {
          return failureReturn('Enter a valid referal Email');
        }
        const referal = await this.prisma.user.findUnique({
          where: {
            email: dto.referal,
          },
        });
        if (!referal) {
          return failureReturn('Enter a valid referal email');
        }
      }
      let count = 0;
      for (let i = 0; i < dto.emails.length; i++) {
        const domain = dto.emails[i].split('@')[1];
        const user = await this.prisma.user.findUnique({
          where: { email: dto.emails[i] },
        });

        if (!user) {
          return failureReturn(
            'Enter registered email id for user ' + dto.emails[i].toString(),
          );
        } else if (!user.registeredEventsId.indexOf(eventId)) {
          return failureReturn(
            'Email ' + dto.emails[i].toString() + ' is already registred',
          );
        } else {
          if (domain != 'pccoepune.org') count++;
        }
      }
      return successfullReturn(count, 'Verified');
    } catch (error) {
      return failureReturn(error);
    }
  }
  async registerUsersForEvent(eventId: string, dto: RegisterEventDTO) {
    try {
      console.log(dto.emails);
      console.log(dto.payload);

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      for (let i = 0; i < dto.emails.length; i++) {
        const user = await this.prisma.user.findUnique({
          where: { email: dto.emails[i] },
        });
        if (!user) {
          return failureReturn('Enter registered email id for user ' + (i + 1));
        }
      }
      if (dto.referal != '') {
        const us = await this.prisma.user.findFirst({
          where: { email: dto.referal },
        });
        const referal = await this.prisma.user.update({
          where: { email: dto.referal },
          data: {
            referal: us.referal + 1,
          },
        });
        console.log(referal);

        if (!referal) {
          return failureReturn('Enter a valid referal email');
        }
      }

      for (let i = 0; i < dto.emails.length; i++) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: {
            participants: { connect: { email: dto.emails[i] } },
            data: {
              push: {
                ...dto.payload,
              },
            },
          },
        });
      }
      for (let i = 0; i < dto.emails.length; i++) {
        this.mailService.sendEmail(
          dto.emails[i],
          'Event Registration Successfull',
          'Thank You for registering for ' +
            event.name +
            '\nFollow this whatsapp link to join our Whatsapp Group: ' +
            event.whatsapp_url,
        );
      }

      return successfullReturn(null, 'Registered Successfully');
    } catch (error) {
      console.log(error);
      return failureReturn(error);
    }
  }

  async getRegisteredUsers(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return failureReturn('No Event Found');
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: event.participantsId },
      },
      select: {
        first_name: true,
        last_name: true,
        mobile: true,
        branch: true,
        year: true,
        email: true,
        college: true,
      },
    });

    return successfullReturn(
      { users: users, count: users.length },
      'Users returned successfully',
    );
  }
  async getEventDetails(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    const coordinators = [];
    const volunteers = [];
    event.coordinatorId.map(async (id) => {
      try {
        const user = await this.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        coordinators.push(userDetails(user));
      } catch (error) {
        failureReturn(error);
      }
    });
    event.volunteerIds.map(async (id) => {
      try {
        const user = await this.prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        volunteers.push(userDetails(user));
      } catch (error) {
        failureReturn(error);
      }
    });
    const lead = [];
    try {
      const response = await this.prisma.user.findUnique({
        where: {
          id: event.eventLeadId[0],
        },
      });
      lead.push(response);
    } catch (error) {}
    const payload = {
      start_time: event.startDate,
      end_time: event.endDate,
      users: event.participantsId,
      venue: event.venue,
      coordinator: coordinators,
      volunteers: volunteers,
      fees: event.registration_fee,
      lead: lead,
    };
    return successfullReturn(payload, 'Event Details Fetched Successfully');
  }
}
function userDetails(user: User) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    photo_url: user.image_url,
    mobile: user.mobile,
  };
}
