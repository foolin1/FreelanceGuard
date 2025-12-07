import { IsEthereumAddress } from 'class-validator';

export class NonceQueryDto {
  @IsEthereumAddress()
  address: string;
}
