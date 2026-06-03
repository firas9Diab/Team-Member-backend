import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser, GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { TeamMembersService } from './team-members.service';

const teamMemberExample = {
  id: 1,
  fullName: 'Alex Johnson',
  jobTitle: 'Frontend Developer',
  status: 'ACTIVE',
  avatarUrl: 'https://example.com/avatars/alex-johnson.jpg',
  createdAt: '2026-05-18T10:00:00.000Z',
  isFavorite: true,
};

@ApiTags('Team Members')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('team-members')
export class TeamMembersController {
  constructor(private teamMembersService: TeamMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get team members with filters and favorite state' })
  @ApiResponse({
    status: 200,
    description: 'Paginated team members for the current user',
    schema: {
      example: {
        data: [teamMemberExample],
        meta: {
          total: 12,
          page: 1,
          limit: 8,
          totalPages: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: AuthUser, @Query() query: QueryTeamMembersDto) {
    return this.teamMembersService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a team member' })
  @ApiBody({
    type: CreateTeamMemberDto,
    examples: {
      teamMember: {
        summary: 'Create team member body',
        value: {
          fullName: 'Sarah Williams',
          jobTitle: 'UI/UX Designer',
          status: 'ACTIVE',
          avatarUrl: 'https://example.com/avatars/sarah-williams.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Team member created',
    schema: {
      example: {
        ...teamMemberExample,
        id: 2,
        fullName: 'Sarah Williams',
        jobTitle: 'UI/UX Designer',
        isFavorite: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateTeamMemberDto) {
    return this.teamMembersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team member' })
  @ApiParam({ name: 'id', description: 'Team member ID', example: 1 })
  @ApiBody({
    type: UpdateTeamMemberDto,
    examples: {
      updateMember: {
        summary: 'Update team member body',
        value: {
          fullName: 'Alex Johnson',
          jobTitle: 'Senior Frontend Developer',
          status: 'INACTIVE',
          avatarUrl: 'https://example.com/avatars/alex-johnson.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Team member updated',
    schema: {
      example: {
        ...teamMemberExample,
        jobTitle: 'Senior Frontend Developer',
        status: 'INACTIVE',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamMembersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team member' })
  @ApiParam({ name: 'id', description: 'Team member ID', example: 1 })
  @ApiResponse({ status: 204, description: 'Team member deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamMembersService.remove(id);
  }
}
