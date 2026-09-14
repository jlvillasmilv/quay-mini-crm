import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from '../auth.service';

/** Authenticated user injected by the JWT guard into `req.user` of protected handlers. */
export interface JwtUser {
  id: number;
  email: string;
  name: string;
  /** Role names held by the user, used by RolesGuard. */
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '123456',
    });
  }

  /**
   * Runs after the token signature and expiration are validated.
   * Reloads the user so the latest roles are available in `req.user`
   * (roles can change after the token was issued).
   */
  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await this.usersService.findOne(payload.sub).catch(() => null);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: (user.roles ?? []).map((role) => role.name),
    };
  }
}
