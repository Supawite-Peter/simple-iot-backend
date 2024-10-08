import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            signIn: jest.fn(),
          };
        }
      })
      .compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return assess token if sign in successfully', async () => {
      const result = { access_token: 'jwttoken' };
      jest.spyOn(service, 'signIn').mockResolvedValue(result);
      expect(
        await controller.signIn({
          username: 'exist',
          password: 'password',
        }),
      ).toEqual(result);
    });
  });
});
