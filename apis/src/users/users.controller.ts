// src/users/users.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-user.dto';
import { query } from 'winston';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guards';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/common/decorators/user.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('admin')
  @Get()
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

//  @UseGuards(JwtAuthGuard)
  @Get('brokers')
  async getAllBrokers(@Query() query: QueryUsersDto) {
    return this.usersService.findAllBrokers(query);
  }

   // -------- Update Logged-in User Profile --------
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @User() user: any
  ) {
  
    return this.usersService.updateProfile(
      user.userId,
      updateProfileDto,
    );
  }
}
