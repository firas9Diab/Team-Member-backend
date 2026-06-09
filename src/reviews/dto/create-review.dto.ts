import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Amazing product' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'The noise cancellation is very good.' })
  @IsString()
  comment: string;
}
