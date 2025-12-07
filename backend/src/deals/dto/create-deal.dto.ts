import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  freelancerAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arbiter?: string;

  @ApiProperty()
  @IsNumberString()
  amount!: string;

  @ApiPropertyOptional({
    description: 'Platform fee (optional off-chain field)',
  })
  @IsOptional()
  @IsNumberString()
  fee?: string;

  @ApiPropertyOptional({ description: 'ISO date string deadline' })
  @IsOptional()
  @IsDateString()
  deadlineTs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chainId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onChainDealId?: string;
}
