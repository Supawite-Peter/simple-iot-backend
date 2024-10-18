import { Post, Delete, Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { Public } from '../auth/auth.public';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Post('register')
  register(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
  ) {
    return this.usersService.register(
      registerDto.username,
      registerDto.password,
    );
  }

  @Delete('unregister')
  unregister(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
  ) {
    return this.usersService.unregister(
      registerDto.username,
      registerDto.password,
    );
  }
}
