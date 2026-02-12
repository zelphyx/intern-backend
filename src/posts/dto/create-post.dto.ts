import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog Post', description: 'Post title' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'This is the content of my blog post...',
    description: 'Post content',
  })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the post is published',
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
