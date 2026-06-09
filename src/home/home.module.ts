import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [PrismaModule, CategoriesModule, ProductsModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
