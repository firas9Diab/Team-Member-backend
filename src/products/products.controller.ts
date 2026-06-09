import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';

const listItemExample = {
  id: 1,
  title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
  slug: 'sony-wh-1000xm5',
  price: 28990,
  oldPrice: 34990,
  discountPercent: 17,
  ratingAverage: 4.5,
  ratingCount: 8416,
  image: 'https://example.com/images/sony-xm5-black.png',
  category: { id: 1, name: 'Headphones' },
};

const detailsExample = {
  id: 1,
  title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
  slug: 'sony-wh-1000xm5',
  brand: 'Sony',
  description:
    'Industry-leading noise cancelling headphones with high-resolution audio and long battery life.',
  price: 28990,
  oldPrice: 34990,
  discountPercent: 17,
  stock: 20,
  ratingAverage: 4.5,
  ratingCount: 8416,
  category: { id: 1, name: 'Headphones' },
  images: [
    {
      id: 1,
      url: 'https://example.com/images/sony-xm5-black-main.png',
      alt: 'Sony WH-1000XM5 Black',
      sortOrder: 1,
    },
  ],
  features: [{ id: 1, text: 'Industry leading noise cancellation.' }],
  reviewSummary: {
    average: 4.5,
    total: 8416,
    breakdown: { '5': 7350, '4': 750, '3': 250, '2': 50, '1': 16 },
  },
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products (filter by category/search/type, sort, paginate)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated product list',
    schema: {
      example: {
        status: true,
        data: {
          items: [listItemExample],
          pagination: { page: 1, limit: 10, total: 40, totalPages: 4 },
        },
      },
    },
  })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // Declared before `:id` so the static "slug" segment is matched first.
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  @ApiParam({ name: 'slug', example: 'sony-wh-1000xm5' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: { example: { status: true, data: detailsExample } },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: { example: { status: true, data: detailsExample } },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
