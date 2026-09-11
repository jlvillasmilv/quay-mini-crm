import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service';

/** Authenticated user injected by the JWT guard into `req.user` of protected handlers. */
export interface JwtUser {
  id: number;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '123456',
    });
  }

  /**
   * Runs after the token signature and expiration are validated.
   * The returned object is injected into `req.user` of protected handlers.
   */
  validate(payload: JwtPayload): JwtUser {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
