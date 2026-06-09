import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class HomeService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
  ) {}

  async getHome() {
    const cardInclude = {
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
    };

    const [categories, todayDeals, moreItems] = await Promise.all([
      this.categoriesService.findAll(),
      this.prisma.product.findMany({
        where: { isActive: true, isTodayDeal: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: cardInclude,
      }),
      this.prisma.product.findMany({
        where: { isActive: true, isRecommended: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: cardInclude,
      }),
    ]);

    return {
      categories,
      todayDeals: todayDeals.map((p) => this.productsService.toListItem(p)),
      moreItemsToConsider: moreItems.map((p) =>
        this.productsService.toListItem(p),
      ),
    };
  }
}
