import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

// Bölümleri sırala: ids dizisindeki sıra = yeni sıra
export class ReorderSectionsDto {
  // Boş = ana sayfa bölümleri
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids!: string[];
}

// Bir bölümün kartlarını sırala
export class ReorderItemsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids!: string[];
}
