import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {}

  private async setTransport() {}

  public async sendEmailToUser(
    receiver: String,
    template: string,
    subject: string,
  ) {
    await this.setTransport();
    this.mailService
      .sendMail({
        transporterName: 'gmail',
        to: receiver.toString(),
        from: this.configService.get('EMAIL'),
        subject: subject,
        template: template,
        context: {
          code: '38320',
        },
      })
      .then((result) => {
        console.log('mail sent successfully');
      })
      .catch((error) => {
        console.log('error while sending an email', error);
      });
  }

  async sendPhoneSMSTOUser(number: string, message: string) {
    const accountSid = 'ACf1110530263a48c3268469db2aeb9663';
    const authToken = 'c4e2e1555e731d7464c440b0fab7c3ba';
    const client = require('twilio')(
      this.configService.get('SID'),
      this.configService.get('AUTH_TOKEN'),
    );
    await client.messages
      .create({
        body: message,
        from: this.configService.get('PHONE_NUMBER'),
        to: number.toString(),
      })
      .then((message) =>
        console.log(message.sid, ' Message sent successfully'),
      );
  }
}
