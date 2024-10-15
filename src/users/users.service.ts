import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserCounter } from './schemas/user-counter.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name, 'users') private usersModel: Model<User>,
    @InjectModel(UserCounter.name, 'users')
    private usersCounterModel: Model<UserCounter>,
  ) {}

  /**
   * Find a user by username.
   * @param target_name The target username
   * @returns The user if found, undefined otherwise
   */
  async findUsername(target_name: string): Promise<User | undefined> {
    return this.usersModel.findOne({ username: target_name }).then((user) => {
      if (user) {
        return user;
      }
      return undefined;
    });
  }

  /**
   * Find a user by id.
   * @param target_id The target id of the user
   * @returns The user if found, undefined otherwise
   */
  async findUserId(target_id: number): Promise<User | undefined> {
    return this.usersModel.findOne({ user_id: target_id }).then((user) => {
      if (user) {
        return user;
      }
      return undefined;
    });
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
    const current_counter = await this.getAndIncreaseCounter();
    await this.usersModel.create({
      user_id: current_counter,
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
    // Check if username and password are defined
    if (username === undefined || password === undefined) {
      throw new InternalServerErrorException('Undefined username or password');
    }
    // Check if user exists
    const user = await this.findUsername(username);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    // Check password
    if (!(await this.checkHash(password, user.hash))) {
      throw new UnauthorizedException('Incorrect password');
    }
    // Delete user
    return this.usersModel.deleteOne({ user_id: user.user_id }).exec();
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

  private async getAndIncreaseCounter(): Promise<number> {
    const counter_doc = await this.getCounter();
    if (counter_doc === null) {
      await this.initCounter(1);
      return 1;
    }
    await this.usersCounterModel
      .findOneAndUpdate({}, { counter: counter_doc.counter + 1 })
      .exec();
    return counter_doc.counter + 1;
  }

  private async getCounter(): Promise<UserCounter> {
    return this.usersCounterModel.findOne().exec();
  }

  private async initCounter(val: number): Promise<UserCounter> {
    return this.usersCounterModel.create({ counter: val });
  }
}
