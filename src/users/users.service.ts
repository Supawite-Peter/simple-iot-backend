import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { User } from './interfaces/users.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  /**
   * Finds a user by their username.
   * @param {string} username - The username to search for.
   * @returns {Promise<User|undefined>} The user if found, otherwise undefined.
   */
  async findUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  /**
   * Finds a user by their user ID.
   * @param {number} userId - The user ID to search for.
   * @returns {Promise<User|undefined>} The user if found, otherwise undefined.
   */
  async findUserId(userId: number): Promise<User | undefined> {
    return this.users.find((user) => user.userId === userId);
  }

  /**
   * Registers a user by their username and password.
   * @param {string} username - The username to register.
   * @param {string} password - The password to register.
   * @returns {Promise<any>} A promise that resolves if the registration was successful.
   * If the username already exists, the registration fails with a ConflictException.
   */
  async register(username: string, password: string): Promise<any> {
    // Check if username already exists
    if (await this.findUsername(username)) {
      return new ConflictException('Username already exists');
    }
    // Register user
    const userId = this.users.length + 1;
    this.users.push({
      userId: userId,
      username: username,
      hash: await bcrypt.hash(password, 10),
    });
    return;
  }

  /**
   * Unregisters a user by their username and password.
   * @param {string} username - The username to unregister.
   * @param {string} password - The password to unregister.
   * @returns {Promise<any>} A promise that resolves if the unregistration was successful.
   * If the username does not exist, the unregistration fails with a NotFoundException.
   * If the password does not match the hash, the unregistration fails with an UnauthorizedException.
   */
  async unregister(username: string, password: string): Promise<any> {
    const user = await this.findUsername(username);
    if (!user) {
      return new NotFoundException('User does not exist');
    }
    if (!(await this.checkHash(password, user.hash))) {
      return new UnauthorizedException('Incorrect password');
    }
    this.users.splice(this.users.indexOf(user), 1);
    return;
  }

  /**
   * Checks if a given password matches a hash.
   * @param {string} password - The password to check.
   * @param {string} hash - The hash to check against.
   * @returns {Promise<boolean>} Whether the password matches the hash.
   */
  async checkHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
