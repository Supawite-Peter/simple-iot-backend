import {
  Controller,
  Get,
  Post,
  Request,
  Delete,
  Body,
  UsePipes,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Request() reg, @Body() registerDto: RegisterDto) {
    return this.devicesService.register(
      reg.user.username,
      reg.user.sub,
      registerDto.device_name,
      registerDto.device_topics,
    );
  }

  @Delete('unregister')
  unregister(
    @Request() req,
    @Body('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.unregister(req.user.sub, device_id);
  }

  @Get('list')
  list(@Request() req) {
    return this.devicesService.getDevicesList(req.user.sub);
  }

  @Post('addtopic')
  addTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Body('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.addDeviceTopics(req.user.sub, device_id, topics);
  }

  @Delete('removetopic')
  removeTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Body('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.removeDeviceTopics(
      req.user.sub,
      device_id,
      topics,
    );
  }
}
