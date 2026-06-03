import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamMembersModule } from '../team-members/team-members.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, TeamMembersModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
