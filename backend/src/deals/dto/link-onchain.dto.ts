import { IsInt, IsString } from 'class-validator';

export class LinkOnchainDto {
  @IsInt()
  chainId: number;

  @IsString()
  onChainDealId: string;
}
