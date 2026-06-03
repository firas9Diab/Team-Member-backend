import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ example: 'Alex Johnson' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Senior Frontend Developer' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ enum: MemberStatus, example: MemberStatus.INACTIVE })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({
    example: 'https://example.com/avatars/alex-johnson.jpg',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string;
}
