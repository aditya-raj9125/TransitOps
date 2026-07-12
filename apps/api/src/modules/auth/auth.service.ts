import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role.name,
    );

    // Persist refresh token hash
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await argon2.hash(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        description: `User ${user.email} logged in`,
        ipAddress,
        userAgent,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        orgId: user.orgId,
        themePreference: user.themePreference,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      let validToken: any = null;
      for (const stored of storedTokens) {
        if (await argon2.verify(stored.tokenHash, refreshToken)) {
          validToken = stored;
          break;
        }
      }

      if (!validToken) {
        throw new ForbiddenException('Invalid refresh token');
      }

      // Revoke old token (rotation)
      await this.prisma.refreshToken.update({
        where: { id: validToken.id },
        data: { revokedAt: new Date() },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) throw new ForbiddenException('User not found');

      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.role.name,
      );

      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: await argon2.hash(tokens.refreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
      });

      return tokens;
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const stored = await this.prisma.refreshToken.findMany({
        where: { userId, revokedAt: null },
      });
      for (const t of stored) {
        if (await argon2.verify(t.tokenHash, refreshToken)) {
          await this.prisma.refreshToken.update({
            where: { id: t.id },
            data: { revokedAt: new Date() },
          });
          break;
        }
      }
    } else {
      // Revoke ALL tokens for this user (logout everywhere)
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.prisma.auditLog.create({
        data: {
          orgId: user.orgId,
          userId,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: userId,
          description: `User ${user.email} logged out`,
        },
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, org: true },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET') || 'secret',
        expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ||
          '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
