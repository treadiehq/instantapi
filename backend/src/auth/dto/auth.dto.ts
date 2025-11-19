import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  organizationName: string;
}

export class LoginDto {
  @IsEmail()
  email: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class AuthResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    organizationId: string;
    organizationName: string;
  };
}

