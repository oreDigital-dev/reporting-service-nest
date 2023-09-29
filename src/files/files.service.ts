import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private generateUniqueFileName(file: Express.Multer.File): string {
    const fileExtenstion = extname(file.originalname);
    return `${uuidv4()}${fileExtenstion}`;
  }

  private ensureUploadsDirectoryExists() {
    // const direct
  }
}
