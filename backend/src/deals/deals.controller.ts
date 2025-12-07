import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { LinkOnchainDto } from './dto/link-onchain.dto';

import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { AuthUser } from '../common/auth/auth-user.decorator';
import type { JwtPayload } from '../common/auth/jwt.util';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create off-chain deal metadata' })
  create(@AuthUser() user: JwtPayload, @Body() dto: CreateDealDto) {
    return this.deals.create(user.address, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my deals (client or freelancer)' })
  mine(@AuthUser() user: JwtPayload) {
    return this.deals.mine(user.address);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by id (only participants)' })
  getById(@AuthUser() user: JwtPayload, @Param('id') id: string) {
    return this.deals.getById(user.address, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal metadata (client only)' })
  update(
    @AuthUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.deals.update(user.address, id, dto);
  }

  @Patch(':id/link-onchain')
  @ApiOperation({ summary: 'Link on-chain deal id and chainId (client only)' })
  linkOnchain(
    @AuthUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: LinkOnchainDto,
  ) {
    return this.deals.linkOnchain(user.address, id, dto);
  }

  @Post(':id/files/:fileId')
  @ApiOperation({ summary: 'Attach uploaded file to deal (participants)' })
  attachFile(
    @AuthUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    return this.deals.attachFile(user.address, id, fileId);
  }
}
