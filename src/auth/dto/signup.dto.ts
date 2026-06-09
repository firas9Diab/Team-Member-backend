import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Match } from '../../common/validators/match.decorator';

export class SignupDto {
  @ApiProperty({ example: 'Nandhu Santhosh' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'nandhusanthosh@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @Match('password', { message: 'confirmPassword must match password' })
  confirmPassword: string;

  @ApiPropertyOptional({ example: '6238973581' })
  @IsOptional()
  @IsString()
  phone?: string;
}
