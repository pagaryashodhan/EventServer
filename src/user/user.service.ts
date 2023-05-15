import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { failureReturn, successfullReturn } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ProfileDTO } from './dto/profile.dto';
import * as pdf from 'html-pdf';
import * as fs from 'fs';
import { CertificateDTO } from './dto/certificate.dto';
import * as Handlebars from 'handlebars';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private service: ConfigService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async getPass(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const email = user.email.split('@')[1];
    if (email == 'pccoepune.org') {
      return failureReturn('No need of pass');
    }
    const passes = [];
    for (let i = 0; i < user.registeredEventsId.length; i++) {
      const event = await this.prisma.event.findUnique({
        where: { id: user.registeredEventsId[i] },
        select: {
          name: true,
          startDate: true,
          endDate: true,
          venue: true,
        },
      });
      const payload = {
        event_name: event.name,
        start_date: event.startDate,
        end_date: event.endDate,
        name: user.first_name + ' ' + user.last_name,
        mobile: user.mobile,
        college: user.college,
        email: user.email,
        venue: event.venue,
      };
      passes.push(payload);
    }
    return successfullReturn(passes, 'Passes generated succesfully');
  }

  async getToken(userId: string) {
    console.log(userId);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const jwt = await this.jwt.sign(
        {
          displayName: user.first_name + ' ' + user.last_name,
          email: user.email,
          phoneNumber: user.mobile,
          collegeName: user.college,
          graduationYear: user.year,
          collegeBranch: user.branch,
        },
        {
          secret: this.service.get('NSCC_JWT_SECRET'),
          expiresIn: '15m',
        },
      );

      return successfullReturn(jwt, 'Redirected successfully');
    } catch (error) {
      return failureReturn(error);
    }
  }

  async getProfileDetails(dto: ProfileDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      const certificatesArray = [];
      const registeredEvents = [];
      for (let i = 0; i < user.registeredEventsId.length; i++) {
        await this.prisma.event
          .findUnique({
            where: {
              id: user.registeredEventsId[i],
            },
          })
          .then((event) => {
            registeredEvents.push({
              id: event.id,
              name: event.name,
              start_date: event.startDate,
              end_date: event.endDate,
              image_url: event.posterUrl,
            });
          });
      }
      try {
        for (let i = 0; i < registeredEvents.length; i++) {
          const hbsTemplateData = fs.readFileSync(
            'src/mail/templates/certificate.hbs',
            'utf8',
          );
          const template = Handlebars.compile(hbsTemplateData);
          const context = {
            name: user.first_name + '' + user.last_name,
            eventName: registeredEvents[i].name,
          };
          const pdfBuffer = await this.convertToPdf(template(context));
          certificatesArray.push({
            pdf: pdfBuffer,
            eventName: registeredEvents[i].name,
          });
        }
      } catch (err) {
        return failureReturn(err);
      }
      const payload = {
        ...user,
        registeredEvents,
        // paymentHistory,
        certificatesArray,
      };
      delete payload.password;
      // console.log(payload);

      return successfullReturn(payload, 'Profile fetched Successfully');
    } catch (error) {
      console.log(error);

      return failureReturn(error);
    }
  }
  async convertToPdf(hbsTemplateData: string): Promise<Buffer> {
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdf.create(hbsTemplateData, { format: 'A3' }).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
    return pdfBuffer;
  }

  async getCertificate(dto: CertificateDTO) {
    //   const mailOptions = {
    //     from: { address: this.service.get('MAIL_FROM'), name: 'Praxis' },
    //     to: 'yjaybhaye1707@gmail.com',
    //     subject: 'Certificates for Praxis',
    //     // text: '<p>Hello</p>',
    //     template: 'email',
    //     attachments: [
    //       {
    //         filename: 'Certificate',
    //         content: pdfBuffer,
    //         contentType: 'application/pdf',
    //       },
    //     ],
    //   };
    //   await this.mailService.transporter
    //     .sendMail(mailOptions)
    //     .then(() => console.log('mail sent'));
    //   // await this.mailService.sendCertificateEmail(mailOptions);
    //   // fs.writeFile(
    //   //   '/Users/yashjaybhaye/Programming/nestJs/praxis-server/src/user/file.pdf',
    //   //   pdfBuffer,
    //   //   (err) => {
    //   //     if (err) {
    //   //       console.error(err);
    //   //     } else {
    //   //       console.log('File saved successfully.');
    //   //     }
    //   //   },
    //   // );
    //   // return base64String;
    // } catch (error) {
    //   console.log('here');
    //   console.log(error);
    //   return failureReturn(error);
    // }
  }
  async getAllUsers() {
    const user = await this.prisma.user.findMany();
    const payload = { user };
    return successfullReturn(payload, 'Profile fetched Successfully');
  }
  catch(error) {
    return failureReturn(error);
  }
}
