import {
  Injectable,
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

  /**
   * Signs in a user by their username and password.
   * @param {string} username - The username to sign in.
   * @param {string} pass - The password to sign in.
   * @returns {Promise<any>} A promise that resolves with a JSON Web Token
   * if the sign in was successful. If the username does not exist, the
   * sign in fails with a NotFoundException. If the password does not match
   * the hash, the sign in fails with an UnauthorizedException.
   */
  async signIn(username: string, pass: string): Promise<any> {
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
