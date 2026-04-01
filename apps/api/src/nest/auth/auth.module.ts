import { Module } from '@nestjs/common';

import { AuthService } from '../../modules/auth/auth.service.js';
import { NestAuthController, NestUsersController } from './auth.controller.js';

@Module({
  controllers: [NestAuthController, NestUsersController],
  providers: [AuthService],
})
export class NestAuthModule {}
