import { Injectable } from '@nestjs/common';
import { Product, ProductStrategy } from './dto';

@Injectable()
export class ProductContext {
  private strategy: ProductStrategy;

  setStrategy(strategy: ProductStrategy) {
    this.strategy = strategy;
  }

  async getProducts(filters: any): Promise<Product[]> {
    if (!this.strategy) {
      throw new Error('Strategy not set');
    }
    return this.strategy.getProducts(filters);
  }
}
