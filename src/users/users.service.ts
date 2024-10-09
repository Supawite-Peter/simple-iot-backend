import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './interfaces/users.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private usersIdCounter = 0;

  async findUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findUserId(userId: number): Promise<User | undefined> {
    return this.users.find((user) => user.userId === userId);
  }

  async register(username: string, password: string): Promise<any> {
    if (username === undefined || password === undefined) {
      throw new InternalServerErrorException('Undefined username or password');
    }
    // Check if username already exists
    if (await this.findUsername(username)) {
      throw new ConflictException('Username already exists');
    }
    // Register user
    this.usersIdCounter += 1;
    const userId = this.usersIdCounter;
    this.users.push({
      userId: userId,
      username: username,
      hash: await bcrypt.hash(password, 10),
    });
    return;
  }

  async unregister(username: string, password: string): Promise<any> {
    if (username === undefined || password === undefined) {
      throw new InternalServerErrorException('Undefined username or password');
    }
    const user = await this.findUsername(username);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    if (!(await this.checkHash(password, user.hash))) {
      throw new UnauthorizedException('Incorrect password');
    }
    this.users.splice(this.users.indexOf(user), 1);
    return;
  }

  async checkHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
