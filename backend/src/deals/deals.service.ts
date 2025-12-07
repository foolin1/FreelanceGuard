/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-return */

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { LinkOnchainDto } from './dto/link-onchain.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  private norm(address: string): string {
    return address.toLowerCase();
  }

  // страховка на случай, если где-то chainId всё ещё string
  private normalizeChainId(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * deadlineTs в схеме = BigInt?
   * В DTO лучше хранить как string (number string).
   * Эта функция безопасно конвертит.
   */
  private normalizeDeadlineTs(value: unknown): bigint | null {
    if (value === null || value === undefined) return null;

    // если уже bigint
    if (typeof value === 'bigint') return value;

    // если число
    if (typeof value === 'number' && Number.isFinite(value)) {
      return BigInt(Math.trunc(value));
    }

    // если строка числа
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;

      // допускаем только числовой формат
      const n = Number(trimmed);
      if (!Number.isFinite(n)) return null;

      return BigInt(Math.trunc(n));
    }

    return null;
  }

  private async getOrCreateUserByAddress(address: string) {
    const addr = this.norm(address);

    const user = await this.prisma.user.upsert({
      where: { address: addr },
      create: { address: addr },
      update: {},
    });

    return user;
  }

  private async assertAccessByAddress(address: string, dealId: string) {
    const user = await this.prisma.user.findUnique({
      where: { address: this.norm(address) },
    });

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const isClient = deal.clientId === user.id;
    const isFreelancer = deal.freelancerId === user.id;

    if (!isClient && !isFreelancer) {
      throw new ForbiddenException('Access denied');
    }

    return { user, deal, isClient, isFreelancer };
  }

  async create(clientAddress: string, dto: CreateDealDto) {
    const client = await this.getOrCreateUserByAddress(clientAddress);

    let freelancerId: string | null = null;

    if (dto.freelancerAddress) {
      const freelancer = await this.getOrCreateUserByAddress(
        dto.freelancerAddress,
      );
      freelancerId = freelancer.id;
    }

    const chainId = this.normalizeChainId(dto.chainId);

    // ВАЖНО: под твою схему
    const deadlineTs = this.normalizeDeadlineTs((dto as any).deadlineTs);

    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        description: dto.description,
        clientId: client.id,
        freelancerId,
        arbiter: dto.arbiter,
        amount: dto.amount,

        // поля из whitepaper в соответствии с твоей схемой
        fee: (dto as any).fee,
        deadlineTs,

        chainId,
        onChainDealId: dto.onChainDealId,
        status: 'DRAFT',
      },
    });

    return deal;
  }

  async mine(address: string) {
    const user = await this.prisma.user.findUnique({
      where: { address: this.norm(address) },
    });

    if (!user) {
      return [];
    }

    const deals = await this.prisma.deal.findMany({
      where: {
        OR: [{ clientId: user.id }, { freelancerId: user.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: { files: { include: { file: true } } },
    });

    return deals;
  }

  async getById(address: string, dealId: string) {
    const { deal } = await this.assertAccessByAddress(address, dealId);

    const fullDeal = await this.prisma.deal.findUnique({
      where: { id: deal.id },
      include: { files: { include: { file: true } } },
    });

    if (!fullDeal) {
      throw new NotFoundException('Deal not found');
    }

    return fullDeal;
  }

  async update(address: string, dealId: string, dto: UpdateDealDto) {
    const { isClient, deal } = await this.assertAccessByAddress(
      address,
      dealId,
    );

    if (!isClient) {
      throw new ForbiddenException('Only client can update deal metadata');
    }

    const chainId = this.normalizeChainId(dto.chainId);

    // под твою схему
    const deadlineTs = this.normalizeDeadlineTs((dto as any).deadlineTs);

    const updated = await this.prisma.deal.update({
      where: { id: deal.id },
      data: {
        title: dto.title,
        description: dto.description,
        arbiter: dto.arbiter,
        amount: dto.amount,

        fee: (dto as any).fee,

        // если deadlineTs не передан — не трогаем
        ...(deadlineTs !== null ? { deadlineTs } : {}),

        ...(chainId !== null ? { chainId } : {}),
        onChainDealId: dto.onChainDealId,
        status: dto.status,
      },
    });

    return updated;
  }

  async linkOnchain(address: string, dealId: string, dto: LinkOnchainDto) {
    const { isClient, deal } = await this.assertAccessByAddress(
      address,
      dealId,
    );

    if (!isClient) {
      throw new ForbiddenException('Only client can link on-chain data');
    }

    const chainId = this.normalizeChainId(dto.chainId);

    const updated = await this.prisma.deal.update({
      where: { id: deal.id },
      data: {
        chainId,
        onChainDealId: dto.onChainDealId,
      },
    });

    return updated;
  }

  async attachFile(address: string, dealId: string, fileId: string) {
    const { deal } = await this.assertAccessByAddress(address, dealId);

    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const link = await this.prisma.dealFile.create({
      data: {
        dealId: deal.id,
        fileId: file.id,
      },
    });

    return link;
  }
}
