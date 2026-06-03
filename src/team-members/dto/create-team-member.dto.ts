import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Sarah Williams' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'UI/UX Designer' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({
    enum: MemberStatus,
    example: MemberStatus.ACTIVE,
    default: MemberStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({
    example: 'https://example.com/avatars/sarah-williams.jpg',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string;
}
