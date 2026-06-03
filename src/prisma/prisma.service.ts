import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

function createAdapter() {
  const url = process.env['DATABASE_URL'] ?? 'file:./prisma/database.sqlite';
  const filePath = url.replace(/^file:/, '');
  const absolutePath = path.resolve(filePath);
  return new PrismaBetterSqlite3({ url: absolutePath });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: createAdapter() } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
