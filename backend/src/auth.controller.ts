import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class SignupDto {
  email: string;
  password: string;
  name: string;
}

class VerifyEmailDto {
  email: string;
  code: string;
}

class LoginDto {
  email: string;
  password: string;
}

class ResendOtpDto {
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('resend-verification')
  resendVerification(@Body() body: ResendOtpDto) {
    return this.authService.resendVerification(body.email);
  }

  @Post('verify-email')
  verify(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
