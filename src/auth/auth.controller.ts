import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const authResponseExample = {
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
  user: {
    id: 1,
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    createdAt: '2026-05-18T10:00:00.000Z',
  },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new TeamFlow account' })
  @ApiBody({
    type: SignupDto,
    examples: {
      signup: {
        summary: 'Signup body',
        value: {
          fullName: 'Alex Johnson',
          email: 'alex@example.com',
          password: 'password123',
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
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    type: LoginDto,
    examples: {
      login: {
        summary: 'Login body',
        value: {
          email: 'alex@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token and user data',
    schema: { example: authResponseExample },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
