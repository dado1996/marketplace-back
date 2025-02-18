import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class ProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  @Max(999)
  amount: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.05)
  price: number;
}

export interface Product {
  name: string;
  sku: string;
  amount: number;
  price: number;
}

type Filters = {
  name?: string;
  sku?: string;
  minPrice: number;
  maxPrice: number;
  userId?: number;
};

export interface ProductStrategy {
  getProducts(filters: Filters): Promise<Product[]>;
}
