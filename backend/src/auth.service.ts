import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { randomBytes, randomInt, scryptSync, timingSafeEqual, createHash } from 'crypto';
import { dirname, join } from 'path';
import * as nodemailer from 'nodemailer';

type SignupInput = {
  email: string;
  password: string;
  name: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type VerifyInput = {
  email: string;
  code: string;
};

type StoredUser = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type VerificationRecord = {
  email: string;
  codeHash: string;
  expiresAt: string;
  consumed: boolean;
  createdAt: string;
};

type AuthStore = {
  nextUserId: number;
  users: StoredUser[];
  verificationCodes: VerificationRecord[];
};

const OTP_TTL_MINUTES = 10;
const STORE_PATH = join(process.cwd(), 'data', 'auth-store.json');

@Injectable()
export class AuthService {
  async signup(input: SignupInput) {
    const email = this.normalizeEmail(input.email);
    const name = input.name.trim();
    const password = input.password;

    if (!name) {
      throw new BadRequestException('Name is required.');
    }

    this.validatePassword(password);

    const store = await this.readStore();
    const now = new Date().toISOString();
    const existingUser = store.users.find((user) => user.email === email);
    const { hash, salt } = this.hashSecret(password);
    const otp = this.generateOtp();

    if (existingUser?.emailVerified) {
      throw new BadRequestException('An account with this email already exists.');
    }

    if (existingUser) {
      existingUser.name = name;
      existingUser.passwordHash = hash;
      existingUser.passwordSalt = salt;
      existingUser.updatedAt = now;
    } else {
      store.users.push({
        id: store.nextUserId++,
        email,
        name,
        passwordHash: hash,
        passwordSalt: salt,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    store.verificationCodes = store.verificationCodes.filter(
      (record) => record.email !== email || record.consumed,
    );
    store.verificationCodes.push({
      email,
      codeHash: this.hashCode(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString(),
      consumed: false,
      createdAt: now,
    });

    await this.writeStore(store);
    await this.deliverOtp(email, name, otp);

    return {
      status: 'pending_verification',
      message: 'Verification code sent to your email.',
      expiresInMinutes: OTP_TTL_MINUTES,
    };
  }

  async resendVerification(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const store = await this.readStore();
    const user = store.users.find((entry) => entry.email === email);

    if (!user) {
      throw new BadRequestException('No account found for this email.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('This email is already verified.');
    }

    const otp = this.generateOtp();
    const now = new Date().toISOString();

    store.verificationCodes = store.verificationCodes.filter(
      (record) => record.email !== email || record.consumed,
    );
    store.verificationCodes.push({
      email,
      codeHash: this.hashCode(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString(),
      consumed: false,
      createdAt: now,
    });

    await this.writeStore(store);
    await this.deliverOtp(email, user.name, otp);

    return {
      status: 'pending_verification',
      message: 'A new verification code has been sent.',
      expiresInMinutes: OTP_TTL_MINUTES,
    };
  }

  async verifyEmail(input: VerifyInput) {
    const email = this.normalizeEmail(input.email);
    const code = input.code.trim();
    const store = await this.readStore();
    const user = store.users.find((entry) => entry.email === email);

    if (!user) {
      throw new BadRequestException('No account found for this email.');
    }

    const record = [...store.verificationCodes]
      .reverse()
      .find((entry) => entry.email === email && !entry.consumed);

    if (!record) {
      throw new BadRequestException('No active verification code found. Please request a new one.');
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('This verification code has expired. Please request a new one.');
    }

    if (this.hashCode(code) !== record.codeHash) {
      throw new BadRequestException('The verification code is incorrect.');
    }

    record.consumed = true;
    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();

    await this.writeStore(store);

    return {
      status: 'verified',
      message: 'Email verified successfully.',
    };
  }

  async login(input: LoginInput) {
    const email = this.normalizeEmail(input.email);
    const password = input.password;
    const store = await this.readStore();
    const user = store.users.find((entry) => entry.email === email);

    if (!user || !this.verifySecret(password, user.passwordSalt, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    return {
      accessToken: `dev-token-${randomBytes(24).toString('hex')}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private async readStore(): Promise<AuthStore> {
    try {
      const raw = await fs.readFile(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<AuthStore>;
      return {
        nextUserId: parsed.nextUserId ?? 1,
        users: parsed.users ?? [],
        verificationCodes: parsed.verificationCodes ?? [],
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        return {
          nextUserId: 1,
          users: [],
          verificationCodes: [],
        };
      }
      throw error;
    }
  }

  private async writeStore(store: AuthStore) {
    await fs.mkdir(dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  }

  private normalizeEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Email is required.');
    }
    return normalized;
  }

  private validatePassword(password: string) {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }
  }

  private generateOtp() {
    return String(randomInt(100000, 1000000));
  }

  private hashCode(code: string) {
    return createHash('sha256').update(code).digest('hex');
  }

  private hashSecret(secret: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(secret, salt, 64).toString('hex');
    return { salt, hash };
  }

  private verifySecret(secret: string, salt: string, storedHash: string) {
    const derivedHash = scryptSync(secret, salt, 64);
    const storedBuffer = Buffer.from(storedHash, 'hex');
    return timingSafeEqual(storedBuffer, derivedHash);
  }

  private async deliverOtp(email: string, name: string, otp: string) {
    const mode = process.env.OTP_DELIVERY_MODE?.trim().toLowerCase() || 'smtp';
    if (mode === 'console') {
      console.log(`OTP for ${email}: ${otp}`);
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;
    const secure =
      process.env.SMTP_SECURE === 'true' || (!Number.isNaN(port) && port === 465);

    if (!host || !user || !pass || !from) {
      throw new ServiceUnavailableException(
        'Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your BuildSpace verification code',
      text: [
        `Hi ${name},`,
        '',
        `Your BuildSpace verification code is ${otp}.`,
        `It expires in ${OTP_TTL_MINUTES} minutes.`,
        '',
        'If you did not request this, you can ignore this email.',
      ].join('\n'),
    });
  }
}
