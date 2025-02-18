import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { JwtService } from '@nestjs/jwt';
import { ProductService } from './products.service';
import {
  AdminProductStrategy,
  BuyerProductStrategy,
  SalesmanProductStrategy,
} from './strategy/product.strategy';
import { ProductContext } from './products.context';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductService,
    JwtService,
    BuyerProductStrategy,
    SalesmanProductStrategy,
    AdminProductStrategy,
    ProductContext,
  ],
})
export class ProductsModule {}
