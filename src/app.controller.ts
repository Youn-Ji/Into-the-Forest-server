import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService
    ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('user')
  async getProfile() {
    return this.authService.validateUser();
  }

}
