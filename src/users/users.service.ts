import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamMembersService } from '../team-members/team-members.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private teamMembersService: TeamMembersService,
  ) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        favorites: {
          include: { teamMember: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const favorites = user.favorites.map((favorite) => ({
      ...favorite.teamMember,
      isFavorite: true,
    }));

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      favorites,
    };
  }

  async addFavorite(userId: number, teamMemberId: number) {
    const teamMember = await this.teamMembersService.ensureExists(teamMemberId);

    await this.prisma.favorite.upsert({
      where: { userId_teamMemberId: { userId, teamMemberId } },
      update: {},
      create: { userId, teamMemberId },
    });

    return {
      message: 'Team member added to favorites',
      teamMember: {
        ...teamMember,
        isFavorite: true,
      },
    };
  }

  async removeFavorite(userId: number, teamMemberId: number) {
    await this.teamMembersService.ensureExists(teamMemberId);

    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_teamMemberId: { userId, teamMemberId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { userId_teamMemberId: { userId, teamMemberId } },
    });

    return { message: 'Team member removed from favorites' };
  }
}
