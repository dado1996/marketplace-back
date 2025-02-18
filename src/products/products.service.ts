import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  AdminProductStrategy,
  BuyerProductStrategy,
  SalesmanProductStrategy,
} from './strategy/product.strategy';
import { Product, ProductDto } from './dto/products.dto';
import { ProductContext } from './products.context';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProductService {
  constructor(
    private readonly buyerStrategy: BuyerProductStrategy,
    private readonly salesmanStrategy: SalesmanProductStrategy,
    private readonly adminStrategy: AdminProductStrategy,
    private readonly productContext: ProductContext,
    private prismaService: PrismaService,
  ) {}

  async getProducts(
    user: any,
    filters: any,
  ): Promise<{ status: number; message: string; data: Product[] }> {
    const { userId, role } = user as { userId: number; role: string };
    switch (role) {
      case 'buyer':
        this.productContext.setStrategy(this.buyerStrategy);
        break;

      case 'salesman':
        this.productContext.setStrategy(this.salesmanStrategy);
        break;

      case 'admin':
        this.productContext.setStrategy(this.adminStrategy);
        break;

      default:
        throw new ForbiddenException('Invalid role');
    }

    try {
      const products = await this.productContext.getProducts({
        ...filters,
        userId,
      });
      return {
        status: 200,
        message: 'Products retrieved succesfully',
        data: products,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('Invalid parameters', HttpStatus.BAD_GATEWAY);
        }
      }
      throw error;
    }
  }

  async registerProduct(dto: ProductDto, userId: number) {
    // Checks if the SKU is already registered
    const productExists = await this.prismaService.product.findFirst({
      where: {
        sku: dto.sku,
      },
    });
    if (productExists) {
      throw new ForbiddenException('SKU already registered');
    }

    // Creates the product
    const newProduct = await this.prismaService.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        amount: dto.amount,
        userId,
      },
      select: {
        name: true,
        sku: true,
        price: true,
      },
    });

    return {
      status: 200,
      message: 'Product created succesfully',
      data: newProduct,
    };
  }
}
