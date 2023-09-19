import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailingService {
  private transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    name: string,
    token: string,
    password?: string | null,
    reset?: boolean,
  ) {
    try {
      let mailOptions;
      if (password && password != null && !reset) {
        mailOptions = {
          from: 'valensniyonsenga2003@gmail.com',
          to: to,
          subject: 'OreDigital Email Verification',
          html: `
          Hello ${name}, <br />
  
          We are pleased to welcome you to TechTours. 
          
          <br />

          To Login use your current password name make sure you change it after you login <br />

          Yor Current Password : ${password} <br />

          Take this time to verify your email by clicking the link below: <br />
          
 
          `,
        };
      } else if (reset) {
        mailOptions = {
          from: 'valensniyonsenga2003@gmail.com',
          to,
          subject: 'OreDigital Password Reset Email',
          html: `
          Hello <strong>${name}</strong>, <br />
          
          This email serves to allow you reset your password , If you did not ask for this email <br />
          you can just ignore it.

          `,
        };
      } else {
        mailOptions = {
          from: 'valensniyonsenga2003@gmail.com',
          to,
          subject: 'OreDigital Email Verification',
          html: `
          Hello ${name}, <br />
  
          We are pleased to welcome you to OreDigital. Take this time to verify your email by clicking the link below: <br />

          `,
        };
      }
      await this.transporter.sendMail(mailOptions);
      return 'Email sent successfully';
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
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
