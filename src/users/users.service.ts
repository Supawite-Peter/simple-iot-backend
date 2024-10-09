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

  /**
   * Find a user by username.
   * @param username The username
   * @returns The user if found, undefined otherwise
   */
  async findUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  /**
   * Find a user by id.
   * @param userId The id of the user
   * @returns The user if found, undefined otherwise
   */
  async findUserId(userId: number): Promise<User | undefined> {
    return this.users.find((user) => user.userId === userId);
  }

  /**
   * Registers a user.
   * @param username The username
   * @param password The password
   * @returns Nothing
   * @throws InternalServerErrorException if username or password is undefined
   * @throws ConflictException if the username already exists
   */
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

  /**
   * Unregisters a user.
   * @param username The username
   * @param password The password
   * @returns Nothing
   * @throws InternalServerErrorException if username or password is undefined
   * @throws NotFoundException if the user does not exist
   * @throws UnauthorizedException if the password is incorrect
   */
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

  /**
   * Check if a password matches a hash.
   * @param password The password to check
   * @param hash The hash to compare with
   * @returns True if the password matches the hash, false otherwise
   */
  async checkHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
