import {
  Controller,
  Get,
  Post,
  Request,
  Delete,
  Body,
  Param,
  UsePipes,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesDataService } from './data/data.service';
import { RegisterDto, registerSchema } from './dto/register.dto';
import { DevicesDataDto, devicesDataSchema } from './dto/data.dto';
import {
  DevicesDataPeriodicDto,
  devicesDataPeriodicSchema,
} from './dto/data-periodic.dto';
import { ZodValidationPipe } from '../zod.validation.pipe';

@Controller('devices')
export class DevicesController {
  constructor(
    private devicesService: DevicesService,
    private devicesDataService: DevicesDataService,
  ) {}

  @Post('')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Request() reg, @Body() registerDto: RegisterDto) {
    return this.devicesService.register(
      reg.user.sub,
      registerDto.device_name,
      registerDto.device_topics,
    );
  }

  @Delete('')
  unregister(
    @Request() req,
    @Body('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.unregister(req.user.sub, device_id);
  }

  @Get('')
  list(@Request() req) {
    return this.devicesService.getDevicesList(req.user.sub);
  }

  @Post(':device_id/topics')
  addTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Param('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.addDeviceTopics(req.user.sub, device_id, topics);
  }

  @Delete(':device_id/topics')
  removeTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Param('device_id', ParseIntPipe) device_id: number,
  ) {
    return this.devicesService.removeDeviceTopics(
      req.user.sub,
      device_id,
      topics,
    );
  }

  @Post(':device_id/:topic')
  updateValue(
    @Request() req,
    @Body(new ZodValidationPipe(devicesDataSchema))
    devicesDataDto: DevicesDataDto,
    @Param('device_id', ParseIntPipe) device_id: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, device_id, topic)
      .then(() => {
        return this.devicesDataService.updateData(
          device_id,
          topic,
          devicesDataDto.payload,
        );
      });
  }

  @Get(':device_id/:topic/latest')
  getLatestData(
    @Request() req,
    @Param('device_id', ParseIntPipe) device_id: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, device_id, topic)
      .then(() => {
        return this.devicesDataService.getLatestData(device_id, topic);
      });
  }

  @Get(':device_id/:topic/periodic')
  getPeriodicData(
    @Request() req,
    @Body(new ZodValidationPipe(devicesDataPeriodicSchema))
    devicesDataPeriodicDto: DevicesDataPeriodicDto,
    @Param('device_id', ParseIntPipe)
    device_id: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, device_id, topic)
      .then(() => {
        return this.devicesDataService.getPeriodicData(
          device_id,
          topic,
          devicesDataPeriodicDto.from,
          devicesDataPeriodicDto.to,
        );
      });
  }
}
