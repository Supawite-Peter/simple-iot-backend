import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  const test_user = 'test',
    test_pass = 'password',
    test_id = 1,
    test_correct_hash =
      '$2b$10$Inn9wpTrqat5FsaLrARlsetYMzsYVRrTi7QGRmL/iQKi5RXlbW7rS',
    test_wrong_hash = 'wrongpassword';
  /**
   * Mocks the UsersService register method to add a new user
   * to the service's internal state.
   * @function
   */
  const mockRegister = function (): void {
    jest
      .spyOn(service, 'register')
      .mockImplementation((mock_user, mock_pass) => {
        service['usersIdCounter'] = 1;
        service['users'].push({
          userId: 1,
          username: mock_user,
          hash: mock_pass,
        });
        return Promise.resolve();
      });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUsername', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockRegister();
    });

    it('should return user by username', async () => {
      await service.register(test_user, test_pass);
      expect(await service.findUsername(test_user)).toEqual({
        userId: test_id,
        username: test_user,
        hash: test_pass,
      });
    });

    it('should return undefined if user does not exist', async () => {
      expect(await service.findUsername('notexist')).toBeUndefined();
    });

    it('should return undefined if input username is undefined', async () => {
      expect(await service.findUsername(undefined)).toBeUndefined();
    });
  });

  describe('findUserId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockRegister();
    });

    it('should return user by userId', async () => {
      await service.register(test_user, test_pass);
      expect(await service.findUserId(test_id)).toEqual({
        userId: test_id,
        username: test_user,
        hash: test_pass,
      });
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
      await service.register(test_user, test_pass);
      expect(service['usersIdCounter']).toBe(1);
      expect(service['users']).toEqual([
        {
          userId: 1,
          username: test_user,
          hash: test_correct_hash,
        },
      ]);
    });

    it('should throw conflict exception if username already exists', async () => {
      await service.register(test_user, test_pass);
      await expect(service.register(test_user, test_pass)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw internal exception if input username is undefined', async () => {
      await expect(service.register(undefined, test_pass)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if input password is undefined', async () => {
      await expect(service.register(test_user, undefined)).rejects.toThrow(
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
    beforeEach(() => {
      jest.clearAllMocks();
      mockRegister();
    });

    it('should remove a user from the service', async () => {
      await service.register(test_user, test_correct_hash);
      await service.unregister(test_user, test_pass);
      expect(service['users']).toEqual([]);
    });

    it('should throw an not found exception if user does not exist', async () => {
      await expect(service.unregister(test_user, test_pass)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an unauthorized exception if password is incorrect', async () => {
      await service.register(test_user, test_wrong_hash);
      await expect(service.unregister(test_user, test_pass)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw internal exception if input username is undefined', async () => {
      await expect(service.unregister(undefined, test_pass)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input password is undefined', async () => {
      await expect(service.unregister(test_user, undefined)).rejects.toThrow(
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
