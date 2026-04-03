import { Body, Controller, Delete, Get, Inject, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import type { ApiRequestContext } from '@trustshield/validation';

import { NestAuthService } from './nest-auth.service.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

class RegisterBodyDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;
}

class LoginBodyDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

class RefreshBodyDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

class UpdateCurrentUserBodyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(16)
  locale?: string;
}

class ChangePasswordBodyDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

class AvatarUploadIntentBodyDto {
  @IsString()
  @MinLength(1)
  contentType!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  filename?: string;
}

@ApiTags('Auth')
@Controller('api/v1/auth')
export class NestAuthController {
  constructor(@Inject(NestAuthService) private readonly authService: NestAuthService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 60_000)
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60_000)
  @ApiOperation({ summary: 'Login and issue bearer tokens' })
  login(@Body() body: LoginBodyDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @UseGuards(RateLimitGuard)
  @RateLimit(10, 60_000)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: RefreshBodyDto) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @UseGuards(RequestContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  logout(@Req() request: NestHttpRequestWithContext) {
    return this.authService.logout(request as never);
  }

  @Get('me')
  @UseGuards(RequestContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Req() request: NestHttpRequestWithContext) {
    return this.authService.getCurrentUser(request as never, requireContext(request));
  }
}

@ApiTags('Users')
@Controller('api/v1/users')
export class NestUsersController {
  constructor(@Inject(NestAuthService) private readonly authService: NestAuthService) {}

  @Get('me')
  @UseGuards(RequestContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@Req() request: NestHttpRequestWithContext) {
    return this.authService.getCurrentUser(request as never, requireContext(request));
  }

  @Patch('me')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  update(@Req() request: NestHttpRequestWithContext, @Body() body: UpdateCurrentUserBodyDto) {
    return this.authService.updateCurrentUser(request as never, requireContext(request), body);
  }

  @Delete('me')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  delete(@Req() request: NestHttpRequestWithContext) {
    return this.authService.deleteCurrentUser(request as never, requireContext(request));
  }

  @Post('me/change-password')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password and revoke active sessions' })
  changePassword(@Req() request: NestHttpRequestWithContext, @Body() body: ChangePasswordBodyDto) {
    return this.authService.changeCurrentUserPassword(request as never, requireContext(request), body);
  }

  @Get('me/export')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export current user data (GDPR)' })
  export(@Req() request: NestHttpRequestWithContext) {
    return this.authService.exportCurrentUserData(request as never, requireContext(request));
  }

  @Post('me/avatar/upload-intent')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(20, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create signed upload intent for current user avatar' })
  avatarUploadIntent(@Req() request: NestHttpRequestWithContext, @Body() body: AvatarUploadIntentBodyDto) {
    return this.authService.createCurrentUserAvatarUploadIntent(request as never, requireContext(request), body);
  }

  @Get('me/avatar')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(30, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signed read URL for current user avatar' })
  avatar(@Req() request: NestHttpRequestWithContext) {
    return this.authService.getCurrentUserAvatar(request as never, requireContext(request));
  }

  @Delete('me/avatar')
  @UseGuards(RequestContextGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit(10, 60_000)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user avatar metadata' })
  deleteAvatar(@Req() request: NestHttpRequestWithContext) {
    return this.authService.deleteCurrentUserAvatar(request as never, requireContext(request));
  }
}
