import { Module, forwardRef } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule, forwardRef(() => UsersModule)],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
