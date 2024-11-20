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
      registerDto.name,
      registerDto.topics,
    );
  }

  @Delete('')
  unregister(@Request() req, @Body('id', ParseIntPipe) deviceId: number) {
    return this.devicesService.unregister(req.user.sub, deviceId);
  }

  @Get('')
  list(@Request() req) {
    return this.devicesService.getDevicesList(req.user.sub);
  }

  @Post(':deviceId/topics')
  addTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.devicesService.addDeviceTopics(req.user.sub, deviceId, topics);
  }

  @Delete(':deviceId/topics')
  removeTopic(
    @Request() req,
    @Body('topics', ParseArrayPipe) topics: string[],
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.devicesService.removeDeviceTopics(
      req.user.sub,
      deviceId,
      topics,
    );
  }

  @Post(':deviceId/:topic')
  updateValue(
    @Request() req,
    @Body(new ZodValidationPipe(devicesDataSchema))
    devicesDataDto: DevicesDataDto,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, deviceId, topic)
      .then(() => {
        return this.devicesDataService.updateData(
          deviceId,
          topic,
          devicesDataDto.payload,
        );
      });
  }

  @Get(':deviceId/:topic/latest')
  getLatestData(
    @Request() req,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, deviceId, topic)
      .then(() => {
        return this.devicesDataService.getLatestData(deviceId, topic);
      });
  }

  @Get(':deviceId/:topic/periodic')
  getPeriodicData(
    @Request() req,
    @Body(new ZodValidationPipe(devicesDataPeriodicSchema))
    devicesDataPeriodicDto: DevicesDataPeriodicDto,
    @Param('deviceId', ParseIntPipe)
    deviceId: number,
    @Param('topic') topic: string,
  ) {
    return this.devicesService
      .checkDeviceTopic(req.user.sub, deviceId, topic)
      .then(() => {
        return this.devicesDataService.getPeriodicData(
          deviceId,
          topic,
          devicesDataPeriodicDto.from,
          devicesDataPeriodicDto.to,
        );
      });
  }
}
