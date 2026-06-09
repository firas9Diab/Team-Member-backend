import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    schema: {
      example: {
        status: true,
        data: [
          { id: 1, name: 'Headphones', slug: 'headphones' },
          { id: 2, name: 'Watches', slug: 'watches' },
        ],
      },
    },
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}
