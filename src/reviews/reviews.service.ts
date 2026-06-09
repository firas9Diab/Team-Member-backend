import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewsDto, ReviewSortBy } from './dto/query-reviews.dto';

const reviewSelect = {
  id: true,
  reviewerName: true,
  rating: true,
  title: true,
  comment: true,
  isVerified: true,
  createdAt: true,
} as const;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rating summary for a product: average, total and a 1..5 breakdown.
   * Reused by the product details endpoint and the reviews list endpoint.
   */
  async getSummary(productId: number) {
    const grouped = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    });

    const breakdown: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };
    let total = 0;
    let sum = 0;
    for (const row of grouped) {
      const count = row._count.rating;
      breakdown[String(row.rating)] = count;
      total += count;
      sum += row.rating * count;
    }

    const average = total === 0 ? 0 : Math.round((sum / total) * 10) / 10;
    return { average, total, breakdown };
  }

  async findByProduct(productId: number, query: QueryReviewsDto) {
    await this.ensureProductExists(productId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = { productId };
    if (query.rating) {
      where.rating = query.rating;
    }

    const [total, items, summary] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy: this.buildOrderBy(query.sortBy),
        skip,
        take: limit,
        select: reviewSelect,
      }),
      this.getSummary(productId),
    ]);

    return {
      items,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(productId: number, userId: number, dto: CreateReviewDto) {
    await this.ensureProductExists(productId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId,
          userId: user.id,
          reviewerName: user.fullName,
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          isVerified: false,
        },
        select: reviewSelect,
      });

      // Recalculate the product's cached rating aggregates.
      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await tx.product.update({
        where: { id: productId },
        data: {
          ratingAverage: agg._avg.rating
            ? Math.round(agg._avg.rating * 10) / 10
            : 0,
          ratingCount: agg._count.rating,
        },
      });

      return created;
    });

    return review;
  }

  private buildOrderBy(
    sortBy?: ReviewSortBy,
  ): Prisma.ReviewOrderByWithRelationInput {
    switch (sortBy) {
      case ReviewSortBy.OLDEST:
        return { createdAt: 'asc' };
      case ReviewSortBy.HIGHEST_RATING:
        return { rating: 'desc' };
      case ReviewSortBy.LOWEST_RATING:
        return { rating: 'asc' };
      case ReviewSortBy.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }

  private async ensureProductExists(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
  }
}
