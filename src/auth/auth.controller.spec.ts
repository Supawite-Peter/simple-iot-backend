import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const result = { accessToken: 'jwttoken' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            signIn: jest.fn().mockResolvedValue(result),
          };
        }
      })
      .compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return assess token if sign in successfully', async () => {
      expect(
        await controller.signIn({
          username: 'exist',
          password: 'password',
        }),
      ).toEqual(result);
    });
  });
});
