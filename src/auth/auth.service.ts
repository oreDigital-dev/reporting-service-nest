import { Injectable } from '@nestjs/common';
import *  as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; // You can adjust this value based on your security needs
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
      }
}
