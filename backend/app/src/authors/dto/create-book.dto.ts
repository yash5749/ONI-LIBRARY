import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsInt()
  authorId: number;
}
