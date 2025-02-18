import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './products.service';
import { Request as RequestExp } from 'express';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post('register')
  @HttpCode(201)
  async registerProduct(@Request() req: RequestExp, @Body() dto: ProductDto) {
    return await this.productService.registerProduct(dto, 1);
  }

  @Get('all')
  async getAll(@Request() req: RequestExp) {
    const user = req.user;
    const filters = req.query;
    return await this.productService.getProducts(user, filters);
  }
}
