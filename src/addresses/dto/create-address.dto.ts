import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nandhu Santhosh' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Munjanattu House' })
  @IsString()
  flatHouseBuilding: string;

  @ApiProperty({ example: '6238973581' })
  @IsString()
  mobileNumber: string;

  @ApiPropertyOptional({ example: '8078785794' })
  @IsOptional()
  @IsString()
  alternativeMobileNumber?: string;

  @ApiProperty({ example: '689667' })
  @IsString()
  pincode: string;

  @ApiProperty({ example: 'Seethathodu' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Kerala' })
  @IsString()
  state: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
