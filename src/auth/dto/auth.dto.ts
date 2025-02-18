import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

const accountTypes = ['salesman', 'buyer', 'admin'] as const;

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto extends AuthDto {
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsIn(accountTypes)
  @IsString()
  @IsNotEmpty()
  type: 'salesman' | 'buyer' | 'admin';
}
