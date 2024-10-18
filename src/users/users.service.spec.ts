import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;
  const test_pass = 'password',
    test_correct_hash =
      '$2b$10$Inn9wpTrqat5FsaLrARlsetYMzsYVRrTi7QGRmL/iQKi5RXlbW7rS',
    test_wrong_hash = 'wrongpassword';
  let user_delete_one_stub = null;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User', 'users'),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(null),
            deleteOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(user_delete_one_stub),
            })),
          },
        },
        {
          provide: getModelToken('UserCounter', 'users'),
          useValue: {
            findOneAndUpdate: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            findOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            create: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken('User', 'users'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUsername', () => {
    it('should return user by username', async () => {
      const stubbed_user = {
        user_id: 1,
        username: 'test_user',
        hash: test_correct_hash,
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(stubbed_user as any);
      expect(await service.findUsername(stubbed_user.username)).toEqual(
        stubbed_user,
      );
    });

    it('should return undefined if user does not exist', async () => {
      expect(await service.findUsername('notexist')).toBeUndefined();
    });

    it('should return undefined if input username is undefined', async () => {
      expect(await service.findUsername(undefined)).toBeUndefined();
    });
  });

  describe('findUserId', () => {
    it('should return user by userId', async () => {
      const stubbed_user = {
        user_id: 1,
        username: 'test_user',
        hash: test_correct_hash,
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(stubbed_user as any);
      expect(await service.findUserId(1)).toEqual(stubbed_user);
    });

    it('should return undefined if user id does not exist', async () => {
      expect(await service.findUserId(2)).toBeUndefined();
    });

    it('should return undefined if input userId is undefined', async () => {
      expect(await service.findUserId(undefined)).toBeUndefined();
    });
  });

  describe('register', () => {
    beforeEach(() => {
      // Mock bcrypt hashing
      jest.clearAllMocks();
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => test_correct_hash);
    });

    it('should add a new user to the service', async () => {
      expect(await service.register('test_user', test_pass)).toEqual({
        user_id: 1,
        username: 'test_user',
      });
    });

    it('should throw conflict exception if username already exists', async () => {
      const stubbed_user = {
        user_id: 1,
        username: 'test_user',
        hash: test_correct_hash,
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(stubbed_user as any);
      await expect(
        service.register(stubbed_user.username, test_pass),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw internal exception if input username is undefined', async () => {
      await expect(service.register(undefined, test_pass)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if input password is undefined', async () => {
      await expect(service.register('test_user', undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input username and password are undefined', async () => {
      await expect(service.register(undefined, undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('unregister', () => {
    it('should remove a user from the service', async () => {
      const stubbed_user = {
        user_id: 1,
        username: 'test_user',
        hash: test_correct_hash,
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(stubbed_user as any);
      user_delete_one_stub = {
        deletedCount: 1,
      };
      expect(
        await service.unregister(stubbed_user.username, test_pass),
      ).toEqual(user_delete_one_stub);
    });

    it('should throw an not found exception if user does not exist', async () => {
      await expect(service.unregister('test_user', test_pass)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an unauthorized exception if password is incorrect', async () => {
      const stubbed_user = {
        user_id: 1,
        username: 'test_user',
        hash: test_wrong_hash,
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(stubbed_user as any);
      await expect(
        service.unregister(stubbed_user.username, test_pass),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw internal exception if input username is undefined', async () => {
      await expect(service.unregister(undefined, test_pass)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input password is undefined', async () => {
      await expect(service.unregister('test_user', undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input username and password are undefined', async () => {
      await expect(service.unregister(undefined, undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
