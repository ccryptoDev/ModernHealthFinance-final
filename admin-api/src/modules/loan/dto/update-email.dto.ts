import { IsNotEmpty, IsString } from 'class-validator';

export class EditEmailDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  newEmail: string;
}
