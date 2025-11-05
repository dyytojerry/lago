import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

// 小程序端微信登录
export class WechatLoginDto {
  @IsString()
  @IsNotEmpty()
  code!: string; // 微信登录code
}

// 小程序端手机号登录
export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

// 小程序端手机号注册
export class PhoneRegisterDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  verifyCode?: string; // 验证码
}

// 运营系统登录
export class OperationLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string; // 用户名或邮箱

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  verifyCode?: string; // 验证码（可选）
}

