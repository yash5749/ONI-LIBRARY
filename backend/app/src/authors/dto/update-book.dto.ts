import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsInt()
  authorId?: number;
}
