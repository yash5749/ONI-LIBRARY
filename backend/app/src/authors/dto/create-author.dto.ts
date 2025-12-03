import { IsString, IsOptional } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
