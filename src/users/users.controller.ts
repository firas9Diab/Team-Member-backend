import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser, GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';

const userExample = {
  id: 1,
  fullName: 'Nandhu Santhosh',
  email: 'nandhusanthosh@gmail.com',
  phone: '6238973581',
  dateOfBirth: '2002-09-18T00:00:00.000Z',
};

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my details' })
  @ApiResponse({
    status: 200,
    description: 'Current user details',
    schema: { example: { status: true, data: userExample } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@GetUser() user: AuthUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ResponseMessage('Details updated successfully')
  @ApiOperation({ summary: 'Update my details (email cannot be changed in v1)' })
  @ApiBody({
    type: UpdateMeDto,
    examples: {
      updateMe: {
        summary: 'Update details body',
        value: {
          fullName: 'Nandhu Santhosh',
          phone: '6238973581',
          dateOfBirth: '2002-09-18',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Details updated',
    schema: {
      example: {
        status: true,
        message: 'Details updated successfully',
        data: userExample,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateMe(@GetUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/password')
  @ResponseMessage('Password updated successfully')
  @ApiOperation({ summary: 'Update my password' })
  @ApiBody({
    type: UpdatePasswordDto,
    examples: {
      updatePassword: {
        summary: 'Update password body',
        value: {
          oldPassword: '12345678',
          newPassword: '87654321',
          confirmNewPassword: '87654321',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated',
    schema: {
      example: { status: true, message: 'Password updated successfully' },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized or wrong old password' })
  updatePassword(@GetUser() user: AuthUser, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(user.id, dto);
  }
}
