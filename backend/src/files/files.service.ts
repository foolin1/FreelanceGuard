/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Express } from 'express';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveUploadedFile(file: Express.Multer.File) {
    // В MVP используем поле url как относительный путь
    const record = await this.prisma.file.create({
      data: {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: file.filename, // имя файла на диске
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return record;
  }

  async getById(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return file;
  }
}
