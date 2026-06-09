import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser, GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ReviewsService } from './reviews.service';

const reviewExample = {
  id: 1,
  reviewerName: 'Vijaya',
  rating: 4,
  title: 'Very comfortable but...',
  comment: 'The headphones are very comfortable and the sound quality is very good.',
  isVerified: true,
  createdAt: '2026-06-08T10:00:00.000Z',
};

const summaryExample = {
  average: 4.5,
  total: 8416,
  breakdown: { '5': 7350, '4': 750, '3': 250, '2': 50, '1': 16 },
};

@ApiTags('Reviews')
@Controller('products/:id/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reviews for a product (paginated + summary)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Paginated product reviews with rating summary',
    schema: {
      example: {
        status: true,
        data: {
          items: [reviewExample],
          summary: summaryExample,
          pagination: { page: 1, limit: 10, total: 100, totalPages: 10 },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.findByProduct(id, query);
  }

  @Post()
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Review added successfully')
  @ApiOperation({ summary: 'Add a review for a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiBody({
    type: CreateReviewDto,
    examples: {
      review: {
        summary: 'Add review body',
        value: {
          rating: 5,
          title: 'Amazing product',
          comment: 'The noise cancellation is very good.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Review added',
    schema: {
      example: {
        status: true,
        message: 'Review added successfully',
        data: {
          id: 10,
          reviewerName: 'Nandhu Santhosh',
          rating: 5,
          title: 'Amazing product',
          comment: 'The noise cancellation is very good.',
          isVerified: false,
          createdAt: '2026-06-08T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  create(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(id, user.id, dto);
  }
}
