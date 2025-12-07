import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService, NonceResponse, VerifyResponse } from './auth.service';
import { VerifyDto } from './dto/verify.dto';
import { NonceQueryDto } from './dto/nonce-query.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('nonce')
  @ApiOperation({ summary: 'Get nonce for wallet login' })
  getNonce(@Query() query: NonceQueryDto): Promise<NonceResponse> {
    return this.auth.getNonce(query.address);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify signature and return JWT' })
  verify(@Body() dto: VerifyDto): Promise<VerifyResponse> {
    return this.auth.verify(dto.address, dto.signature);
  }
}
