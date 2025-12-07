/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { verifyMessage } from 'ethers';
import { signJwt } from '../common/auth/jwt.util';

export type NonceResponse = {
  address: string;
  nonce: string;
  message: string;
};

export type VerifyResponse = {
  token: string;
  user: {
    id: string;
    address: string;
  };
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAddress(address: string): string {
    return address.toLowerCase();
  }

  private buildMessage(nonce: string): string {
    return `FreelanceGuard login nonce: ${nonce}`;
  }

  async getNonce(address: string): Promise<NonceResponse> {
    const norm = this.normalizeAddress(address);
    const nonce = randomBytes(16).toString('hex');

    const user = await this.prisma.user.upsert({
      where: { address: norm },
      create: { address: norm, nonce },
      update: { nonce },
    });

    const finalNonce = user.nonce ?? nonce;
    const message = this.buildMessage(finalNonce);

    return {
      address: user.address,
      nonce: finalNonce,
      message,
    };
  }

  async verify(address: string, signature: string): Promise<VerifyResponse> {
    const norm = this.normalizeAddress(address);

    const user = await this.prisma.user.findUnique({
      where: { address: norm },
    });

    if (!user || !user.nonce) {
      throw new UnauthorizedException(
        'Nonce not found. Call /auth/nonce first.',
      );
    }

    const message = this.buildMessage(user.nonce);

    let recoveredAddress: string;
    try {
      recoveredAddress = verifyMessage(message, signature);
    } catch {
      throw new UnauthorizedException('Invalid signature format');
    }

    if (this.normalizeAddress(recoveredAddress) !== norm) {
      throw new UnauthorizedException('Signature does not match address');
    }

    await this.prisma.user.update({
      where: { address: norm },
      data: { nonce: null },
    });

    const token = signJwt({ sub: user.id, address: user.address });

    return {
      token,
      user: {
        id: user.id,
        address: user.address,
      },
    };
  }
}
