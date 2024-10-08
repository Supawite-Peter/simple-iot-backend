import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    if (!username || !pass) {
      throw new InternalServerErrorException('Undefined username or password');
    }
    // Check if user exists
    const user = await this.usersService.findUsername(username);
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    // Check user hash
    if (!(await this.usersService.checkHash(pass, user.hash))) {
      throw new UnauthorizedException('Incorrect password');
    }
    // Generate JWT
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
