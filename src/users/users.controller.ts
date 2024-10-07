import { Post, Delete, Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(
      registerDto.username,
      registerDto.password,
    );
  }

  @Delete('unregister')
  delete(@Body() registerDto: RegisterDto) {
    return this.usersService.unregister(
      registerDto.username,
      registerDto.password,
    );
  }
}
