// packages/auth/src/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';

export type PlatformRole = 'USER' | 'ADMIN';

export interface JwtPayload {
    sub: string;
    email: string;
    platformRole: PlatformRole;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

function assertSecrets() {
    if (!ACCESS_SECRET || !REFRESH_SECRET) {
        throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
    }
}

export function signAccessToken(payload: JwtPayload): string {
    assertSecrets();
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
    assertSecrets();
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
    assertSecrets();
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    assertSecrets();
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}