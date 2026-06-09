import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { AuthUser, GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const authResponseExample = {
  status: true,
  message: 'Account created successfully',
  data: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
    user: {
      id: 1,
      fullName: 'Nandhu Santhosh',
      email: 'nandhusanthosh@gmail.com',
      phone: '6238973581',
    },
  },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ResponseMessage('Account created successfully')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({
    type: SignupDto,
    examples: {
      signup: {
        summary: 'Signup body',
        value: {
          fullName: 'Nandhu Santhosh',
          email: 'nandhusanthosh@gmail.com',
          password: '12345678',
          confirmPassword: '12345678',
          phone: '6238973581',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Account created, returns JWT token and user data',
    schema: { example: authResponseExample },
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged in successfully')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    type: LoginDto,
    examples: {
      login: {
        summary: 'Login body',
        value: {
          email: 'nandhusanthosh@gmail.com',
          password: '12345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token and user data',
    schema: {
      example: {
        ...authResponseExample,
        message: 'Logged in successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user from token' })
  @ApiResponse({
    status: 200,
    description: 'Current authenticated user',
    schema: {
      example: {
        status: true,
        data: {
          id: 1,
          fullName: 'Nandhu Santhosh',
          email: 'nandhusanthosh@gmail.com',
          phone: '6238973581',
          dateOfBirth: '2002-09-18T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@GetUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }
}
