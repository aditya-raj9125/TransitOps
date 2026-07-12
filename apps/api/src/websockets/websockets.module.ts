import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FleetEventGateway } from './fleet-events.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [FleetEventGateway],
  exports: [FleetEventGateway],
})
export class WebsocketsModule {}
