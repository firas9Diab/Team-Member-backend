import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import {
  ProductSortBy,
  ProductType,
  QueryProductsDto,
} from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
  ) {}

  async findAll(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: this.buildOrderBy(query.sortBy),
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
    ]);

    return {
      items: products.map((p) => this.toListItem(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.detailsInclude(),
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.toDetails(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: this.detailsInclude(),
    });
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return this.toDetails(product);
  }

  /** Compact list-card cards used by /home and /products. */
  toListItem(product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    oldPrice: number | null;
    discountPercent: number | null;
    ratingAverage: number;
    ratingCount: number;
    images?: { url: string }[];
    category?: { id: number; name: string } | null;
  }) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice,
      discountPercent: product.discountPercent,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      image: product.images?.[0]?.url ?? null,
      ...(product.category ? { category: product.category } : {}),
    };
  }

  private detailsInclude() {
    return {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: 'asc' as const } },
      features: { orderBy: { sortOrder: 'asc' as const } },
    };
  }

  private async toDetails(product: any) {
    const reviewSummary = await this.reviewsService.getSummary(product.id);
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      discountPercent: product.discountPercent,
      stock: product.stock,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      category: product.category,
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
      features: product.features.map((f: any) => ({
        id: f.id,
        text: f.text,
      })),
      reviewSummary,
    };
  }

  private buildWhere(query: QueryProductsDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { brand: { contains: query.search } },
      ];
    }

    if (query.type === ProductType.TODAY_DEALS) {
      where.isTodayDeal = true;
    } else if (query.type === ProductType.RECOMMENDED) {
      where.isRecommended = true;
    }

    return where;
  }

  private buildOrderBy(
    sortBy?: ProductSortBy,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case ProductSortBy.PRICE_LOW:
        return { price: 'asc' };
      case ProductSortBy.PRICE_HIGH:
        return { price: 'desc' };
      case ProductSortBy.RATING:
        return { ratingAverage: 'desc' };
      case ProductSortBy.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }
}
