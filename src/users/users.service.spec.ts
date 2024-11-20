import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  // test constants
  const TEST_PASS = 'password',
    TEST_CORRECT_HASH =
      '$2b$10$Inn9wpTrqat5FsaLrARlsetYMzsYVRrTi7QGRmL/iQKi5RXlbW7rS',
    TEST_WRONG_HASH = 'wrongpassword';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneByOrFail: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(null),
            save: jest.fn().mockResolvedValue(null),
            remove: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('findUsername', () => {
    it('should return user by username', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        passwordHash: TEST_CORRECT_HASH,
      };
      jest
        .spyOn(userRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(stubbed_user as User);

      // Act & Assert
      expect(await service.findUsername(stubbed_user.username)).toEqual(
        stubbed_user,
      );
    });

    it('should return undefined if user does not exist', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOneByOrFail').mockRejectedValueOnce(null);

      // Act & Assert
      expect(await service.findUsername('notexist')).toBeUndefined();
    });

    it('should return undefined if input username is undefined', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOneByOrFail').mockRejectedValueOnce(null);

      // Act & Assert
      expect(await service.findUsername(undefined)).toBeUndefined();
    });
  });

  describe('findUserId', () => {
    it('should return user by userId', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        passwordHash: TEST_CORRECT_HASH,
      };
      jest
        .spyOn(userRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(stubbed_user as any);

      // Act & Assert
      expect(await service.findUserId(1)).toEqual(stubbed_user);
    });

    it('should return undefined if user id does not exist', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOneByOrFail').mockRejectedValueOnce(null);

      // Act & Assert
      expect(await service.findUserId(2)).toBeUndefined();
    });

    it('should return undefined if input userId is undefined', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOneByOrFail').mockRejectedValueOnce(null);

      // Act & Assert
      expect(await service.findUserId(undefined)).toBeUndefined();
    });
  });

  describe('register', () => {
    beforeEach(() => {
      // Mock bcrypt hashing
      jest.clearAllMocks();
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => TEST_CORRECT_HASH);
    });

    it('should add a new user to the service', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        firstName: 'test',
        lastName: 'test',
        passwordHash: TEST_CORRECT_HASH,
      };
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValueOnce(stubbed_user as User);

      // Act & Assert
      expect(await service.register(stubbed_user.username, TEST_PASS)).toEqual({
        id: stubbed_user.id,
        username: stubbed_user.username,
        first_name: stubbed_user.firstName,
        last_name: stubbed_user.lastName,
      });
    });

    it('should throw conflict exception if username already exists', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        firstName: 'test',
        lastName: 'test',
        passwordHash: TEST_CORRECT_HASH,
      };
      jest
        .spyOn(userRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(stubbed_user as any);

      // Act & Assert
      await expect(
        service.register(stubbed_user.username, TEST_PASS),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw internal exception if input username is undefined', async () => {
      // Act & Assert
      await expect(service.register(undefined, TEST_PASS)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if input password is undefined', async () => {
      // Act & Assert
      await expect(service.register('test_user', undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input username and password are undefined', async () => {
      // Act & Assert
      await expect(service.register(undefined, undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('unregister', () => {
    it('should remove a user from the service', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        firstName: 'test',
        lastName: 'test',
        passwordHash: TEST_CORRECT_HASH,
      };
      jest
        .spyOn(userRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(stubbed_user as User);

      // Act & Assert
      expect(await service.unregister(stubbed_user.id, TEST_PASS)).toEqual({
        id: stubbed_user.id,
        username: stubbed_user.username,
        first_name: stubbed_user.firstName,
        last_name: stubbed_user.lastName,
      });
    });

    it('should throw an not found exception if user does not exist', async () => {
      // Act & Assert
      await expect(service.unregister(99, TEST_PASS)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an unauthorized exception if password is incorrect', async () => {
      // Arrange
      const stubbed_user = {
        id: 1,
        username: 'test_user',
        firstName: 'test',
        lastName: 'test',
        passwordHash: TEST_WRONG_HASH,
      };
      jest
        .spyOn(userRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(stubbed_user as User);

      // Act & Assert
      await expect(
        service.unregister(stubbed_user.id, TEST_PASS),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw internal exception if input username is undefined', async () => {
      // Act & Assert
      await expect(service.unregister(undefined, TEST_PASS)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input password is undefined', async () => {
      // Act & Assert
      await expect(service.unregister(1, undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw internal exception if both input username and password are undefined', async () => {
      // Act & Assert
      await expect(service.unregister(undefined, undefined)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
