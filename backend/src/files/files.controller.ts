/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';

import { FilesService } from './files.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';

function makeStorage() {
  return diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExt = extname(file.originalname);
      cb(null, `${unique}${fileExt}`);
    },
  });
}

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post()
  @ApiOperation({ summary: 'Upload file' })
  @UseInterceptors(FileInterceptor('file', { storage: makeStorage() }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.files.saveUploadedFile(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata' })
  getMeta(@Param('id') id: string) {
    return this.files.getById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file by id' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.files.getById(id);
    return res.download(`./uploads/${file.url}`, file.filename);
  }
}
