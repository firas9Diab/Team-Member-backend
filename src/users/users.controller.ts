import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser, GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

const favoriteTeamMemberExample = {
  id: 1,
  fullName: 'Alex Johnson',
  jobTitle: 'Frontend Developer',
  status: 'ACTIVE',
  avatarUrl: 'https://example.com/avatars/alex-johnson.jpg',
  createdAt: '2026-05-18T10:00:00.000Z',
  isFavorite: true,
};

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user data and favorites from token' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile with favorite team members',
    schema: {
      example: {
        id: 1,
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        createdAt: '2026-05-18T10:00:00.000Z',
        favorites: [favoriteTeamMemberExample],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@GetUser() user: AuthUser) {
    return this.usersService.getMe(user.id);
  }

  @Post('me/favorites/:teamMemberId')
  @ApiOperation({ summary: 'Add a team member to current user favorites' })
  @ApiResponse({
    status: 201,
    description: 'Team member added to favorites',
    schema: {
      example: {
        message: 'Team member added to favorites',
        teamMember: favoriteTeamMemberExample,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  addFavorite(
    @GetUser() user: AuthUser,
    @Param('teamMemberId', ParseIntPipe) teamMemberId: number,
  ) {
    return this.usersService.addFavorite(user.id, teamMemberId);
  }

  @Delete('me/favorites/:teamMemberId')
  @ApiOperation({ summary: 'Remove a team member from current user favorites' })
  @ApiResponse({
    status: 200,
    description: 'Team member removed from favorites',
    schema: {
      example: { message: 'Team member removed from favorites' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team member or favorite not found' })
  removeFavorite(
    @GetUser() user: AuthUser,
    @Param('teamMemberId', ParseIntPipe) teamMemberId: number,
  ) {
    return this.usersService.removeFavorite(user.id, teamMemberId);
  }
}
