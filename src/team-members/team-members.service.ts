import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, query: QueryTeamMembersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 8;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(userId, query);

    const [total, members] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take: limit,
        include: {
          favoritedBy: {
            where: { userId },
            select: { userId: true },
          },
        },
      }),
    ]);

    return {
      data: members.map(({ favoritedBy, ...member }) => ({
        ...member,
        isFavorite: favoritedBy.length > 0,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateTeamMemberDto) {
    const member = await this.prisma.teamMember.create({
      data: {
        fullName: dto.fullName,
        jobTitle: dto.jobTitle,
        status: dto.status,
        avatarUrl: dto.avatarUrl,
      },
    });

    return {
      ...member,
      isFavorite: false,
    };
  }

  async update(id: number, dto: UpdateTeamMemberDto) {
    await this.ensureExists(id);

    const member = await this.prisma.teamMember.update({
      where: { id },
      data: dto,
    });

    return { ...member, isFavorite: false };
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.teamMember.delete({ where: { id } });
  }

  async ensureExists(teamMemberId: number) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: teamMemberId },
    });

    if (!member) {
      throw new NotFoundException(
        `Team member with id ${teamMemberId} not found`,
      );
    }

    return member;
  }

  private buildWhere(userId: number, query: QueryTeamMembersDto) {
    const where: Prisma.TeamMemberWhereInput = {};

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { jobTitle: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.favoritesOnly) {
      where.favoritedBy = { some: { userId } };
    }

    return where;
  }
}
