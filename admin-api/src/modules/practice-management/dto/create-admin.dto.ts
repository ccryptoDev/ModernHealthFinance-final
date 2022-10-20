import { IsNotEmpty, IsString, IsNumber, IsEmail, IsBoolean, IsUUID, IsPhoneNumber } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  id?: string = '';

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  practiceid: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  role: number;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
