import { Body, Controller, Delete, Get, Inject, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { ApiRequestContext } from '@trustshield/validation';

import { AuthService } from '../../modules/auth/auth.service.js';
import { RateLimit } from '../platform/rate-limit.decorator.js';
import { RateLimitGuard } from '../platform/rate-limit.guard.js';
import { RequestContextGuard, type NestHttpRequestWithContext } from '../platform/request-context.guard.js';

function requireContext(request: NestHttpRequestWithContext) {
  return request.trustshieldContext as ApiRequestContext;
}

@ApiTags('Auth')
@Controller('api/v1/auth')
export class NestAuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 60_000)
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 60_000)
  @ApiOperation({ summary: 'Login and issue bearer tokens' })
  login(@Body() body: unknown) {
    return this.authService.login(body);
  }

  @Post('refresh')
  @UseGuards(RateLimitGuard)
  @RateLimit(10, 60_000)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: unknown) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  @UseGuards(RequestContextGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  logout() {
    return this.authService.logout();
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
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

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
  update(@Req() request: NestHttpRequestWithContext, @Body() body: unknown) {
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
}
