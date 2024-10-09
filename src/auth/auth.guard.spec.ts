import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    reflector = new Reflector();
    jwtService = new JwtService();
    guard = new AuthGuard(jwtService, reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if metadata IS_PUBLIC_KEY is exist', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    const context = createMock<ExecutionContext>();
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw unauthorized exception if token is not exist in header', async () => {
    const context = createMock<ExecutionContext>();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw unauthorized exception if token is invalid', async () => {
    const context = createMock<ExecutionContext>();
    jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error());
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true and update user context if token is valid', async () => {
    const result = {
      user: { sub: 1, username: 'test' },
    };
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: undefined,
          headers: { authorization: 'Bearer jwttoken' },
        }),
      }),
    });
    jwtService.verifyAsync = jest.fn().mockResolvedValue(result);
    expect(await guard.canActivate(context)).toBe(true);
  });
});
