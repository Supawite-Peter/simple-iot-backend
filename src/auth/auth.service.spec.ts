import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findUsername: jest.fn().mockImplementation((username) => {
              if (username === 'exist') {
                return {
                  userId: 1,
                  username: 'exist',
                  hash: 'hashpassword',
                };
              }
              return undefined;
            }),
            checkHash: jest.fn().mockImplementation((password, hash) => {
              if (password === 'password' && hash === 'hashpassword') {
                return true;
              }
              return false;
            }),
          };
        }

        if (token === JwtService) {
          return {
            signAsync: jest.fn().mockReturnValue('jwttoken'),
          };
        }
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token if user exists', async () => {
      const result = await service.signIn('exist', 'password');
      expect(result.access_token).toBe('jwttoken');
    });

    it('should throw not found exception if user does not exist', async () => {
      await expect(service.signIn('notexist', 'password')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw unauthorized exception if password is incorrect', async () => {
      await expect(service.signIn('exist', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw internal exception if input username is undefined', async () => {
      await expect(service.signIn('', 'password')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw exception if input password is undefined', async () => {
      await expect(service.signIn('exist', '')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw exception if both username and password are undefined', async () => {
      await expect(service.signIn('', '')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
