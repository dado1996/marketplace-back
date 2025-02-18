import { Injectable } from '@nestjs/common';
import { Product, ProductStrategy } from '../dto';
import { PrismaService } from 'src/prisma/prisma.service';

type Filters = {
  name?: string;
  sku?: string;
  minPrice: number;
  maxPrice: number;
  userId?: number;
};

@Injectable()
export class BuyerProductStrategy implements ProductStrategy {
  constructor(private prismaService: PrismaService) {}
  async getProducts(filters: Filters): Promise<Product[]> {
    const { name, sku, minPrice, maxPrice } = filters;
    const query = {
      OR: [
        name
          ? {
              name: {
                startsWith: name,
              },
            }
          : undefined,
        sku
          ? {
              sku: {
                startsWith: sku,
              },
            }
          : undefined,
        minPrice && maxPrice
          ? {
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
            }
          : undefined,
      ].filter((condition) => condition !== undefined),
    };
    const products = await this.prismaService.product.findMany({
      where: query,
      select: {
        name: true,
        sku: true,
        amount: true,
        price: true,
      },
      take: 100,
    });
    return products;
  }
}

@Injectable()
export class SalesmanProductStrategy implements ProductStrategy {
  constructor(private prismaService: PrismaService) {}
  async getProducts(filters: Filters): Promise<Product[]> {
    console.log(filters);
    const { userId } = filters;
    const products = await this.prismaService.product.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
        sku: true,
        amount: true,
        price: true,
      },
      take: 100,
    });

    return products;
  }
}

@Injectable()
export class AdminProductStrategy implements ProductStrategy {
  constructor(private prismaService: PrismaService) {}
  async getProducts(filters: Filters): Promise<Product[]> {
    const { userId } = filters;
    const products = await this.prismaService.product.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
        sku: true,
        amount: true,
        price: true,
      },
      take: 100,
    });

    return products;
  }
}
