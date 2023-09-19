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
    verificationCode: string,
    link: string,
    reset?: boolean,
  ) {
    try {
      let mailOptions;
      if (!reset) {
        mailOptions = {
          from: 'valensniyonsenga2003@gmail.com',
          to: to,
          subject: 'OreDigital Email Verification',
          html: `
          <html lang='en'>
          <head>
            <meta charset='UTF-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            <title>Email Verification</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif;
              background-color: #f4f4f4; } .container { max-width: 600px; margin: 0
              auto; padding: 20px; background-color: #ffffff; border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } .header { text-align: center;
              margin-bottom: 20px; } .content { margin-bottom: 20px; padding: 10px;
              border: 1px solid #ccc; border-radius: 5px; } .button { display:
              inline-block; padding: 10px 20px; background-color: #007bff; color:
              #ffffff; text-decoration: none; border-radius: 5px; } .footer {
              text-align: center; font-size: 12px; color: #777777; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class='container'>
              <div class='header'>
                <h1 style='text-align: center;'>OreDigital software soltions</h1>
                <h1>Email Verification</h1>
              </div>
              <div class='content'>
                <p>Hello ${name} Thank you for signing up! Please click the button below to verify
                  your email address:</p>
                  <p>Please use this code to verify your account ${verificationCode} or just click the below button
                <a class='button' href='[${link}]'>Verify Email</a>
              </div>
              <div class='footer'>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
          `,
        };
      } else if (reset) {
        mailOptions = {
          from: 'valensniyonsenga2003@gmail.com',
          to,
          subject: 'OreDigital Password Reset Email',
          html: `
          <html lang='en'>
          <head>
            <meta charset='UTF-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            <title>Email Verification</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif;
              background-color: #f4f4f4; } .container { max-width: 600px; margin: 0
              auto; padding: 20px; background-color: #ffffff; border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } .header { text-align: center;
              margin-bottom: 20px; } .content { margin-bottom: 20px; padding: 10px;
              border: 1px solid #ccc; border-radius: 5px; } .button { display:
              inline-block; padding: 10px 20px; background-color: #007bff; color:
              #ffffff; text-decoration: none; border-radius: 5px; } .footer {
              text-align: center; font-size: 12px; color: #777777; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class='container'>
              <div class='header'>
                <h1 style='text-align: center;'>OreDigital software soltions</h1>
                <h1>Email Verification</h1>
              </div>
              <div class='content'>
                <p>Hello ${name} Thank you for have an interest into oreDigital! </p>
                  <p>Please use this code to reset  your password ${verificationCode} or just click the below button
                <a class='button' href='${link}'>Verify Email</a>
              </div>
              <div class='footer'>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
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
