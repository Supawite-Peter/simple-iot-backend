import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            register: jest.fn().mockResolvedValue('Register Received'),
            unregister: jest.fn().mockResolvedValue('Unregister Received'),
          };
        }
      })
      .compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should pass username and password to UsersService.register', async () => {
      expect(
        await controller.register({
          username: 'user',
          password: 'pass',
        }),
      ).toEqual('Register Received');
    });
  });

  describe('unregister', () => {
    it('should pass username and password to UsersService.unregister', async () => {
      expect(
        await controller.unregister({
          username: 'user',
          password: 'pass',
        }),
      ).toEqual('Unregister Received');
    });
  });
});
