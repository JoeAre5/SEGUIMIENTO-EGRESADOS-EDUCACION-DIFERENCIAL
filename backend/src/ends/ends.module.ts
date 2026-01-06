import { Module } from '@nestjs/common';
import { EndsController } from './ends.controller';
import { EndsService } from './ends.service';

@Module({
  controllers: [EndsController],
  providers: [EndsService],
})
export class EndsModule {}
