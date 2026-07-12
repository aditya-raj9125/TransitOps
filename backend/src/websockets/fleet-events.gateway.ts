import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class FleetEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Basic auth check for WS connection
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Join room for their specific organization
      // In a real app we'd fetch the user's orgId from DB or payload
      // Assuming payload contains orgId or we fetch it. We'll simplify and use a room.
      const orgRoom = `org_${payload.orgId || 'default'}`;
      const userRoom = `user_${payload.sub}`;
      const roleRoom = `role_${payload.orgId || 'default'}_${payload.role}`;

      client.join([orgRoom, userRoom, roleRoom]);
      console.log(`Client connected: ${client.id} (User: ${payload.sub}, Role: ${payload.role})`);
    } catch (error) {
      console.log(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // --- Broadcasters for other services to use ---

  broadcastTripUpdate(orgId: string, data: any) {
    this.server.to(`org_${orgId}`).emit('trip_updated', data);
  }

  broadcastKpiUpdate(orgId: string) {
    // Tell clients to refetch KPIs
    this.server.to(`org_${orgId}`).emit('kpi_updated', { timestamp: Date.now() });
  }

  notifyUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  notifyRole(orgId: string, role: string, notification: any) {
    this.server.to(`role_${orgId}_${role}`).emit('notification', notification);
  }
}
