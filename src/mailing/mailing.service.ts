import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { error } from 'console';
import { Options } from 'nodemailer/lib/smtp-transport';
import { MainUser } from 'src/entities/MainUser.entity';

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {}

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const OAuth2Client = new OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    OAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken: any = await new Promise((resolve, reject) => {
      OAuth2Client.getAccessToken((error, token) => {
        // if (error) {
        //   reject('Failed to create the access_token for gmt');
        // }
        resolve(token);
      });
    });

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId: this.configService.get('CLIENT_ID'),
        clientSecret: this.configService.get('CLIENT_SECRET'),
        accessToken,
      },
    };

    this.mailService.addTransporter('gmail', config);
  }

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

  async sendUserWelcome(user: string, token: string) {
    const confirmation_url = `example.com/auth/confirm?token=${token}`;

    await this.mailService
      .sendMail({
        to: user,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './welcome.ejs', // `.ejs` extension is appended automatically
        context: {
          // name: 'VALENS',
          // confirmation_url,
        },
      })
      .then((res) => console.log('mail sent'))
      .catch((error) => console.log(error));
  }
}
