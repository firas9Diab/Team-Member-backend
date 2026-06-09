import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';

const cardExample = {
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

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Get()
  @ApiOperation({ summary: 'Landing page data (categories + deals + picks)' })
  @ApiResponse({
    status: 200,
    description: 'Aggregated landing page payload',
    schema: {
      example: {
        status: true,
        data: {
          categories: [{ id: 1, name: 'Headphones', slug: 'headphones' }],
          todayDeals: [cardExample],
          moreItemsToConsider: [cardExample],
        },
      },
    },
  })
  getHome() {
    return this.homeService.getHome();
  }
}
