import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Match } from '../../common/validators/match.decorator';

export class UpdatePasswordDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: '87654321', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: '87654321', minLength: 8 })
  @IsString()
  @Match('newPassword', {
    message: 'confirmNewPassword must match newPassword',
  })
  confirmNewPassword: string;
}
