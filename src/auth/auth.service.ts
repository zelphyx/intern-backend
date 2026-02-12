import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user and return JWT token
   */
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
    });

    const payload = { sub: user.id, username: user.username };
    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validate credentials and return JWT token
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Get current user profile from JWT payload
   */
  async getProfile(userId: number) {
    return this.usersService.findOne(userId);
  }
}
