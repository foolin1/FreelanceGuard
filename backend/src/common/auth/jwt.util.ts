import * as jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: string;
  address: string;
};

export function signJwt(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  return jwt.sign(
    payload,
    secret as jwt.Secret,
    { expiresIn } as jwt.SignOptions,
  );
}

export function verifyJwt(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  return jwt.verify(token, secret as jwt.Secret) as JwtPayload;
}
