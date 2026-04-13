import { query, queryOne } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signJwt } from '../../utils/jwt';
import { AppError, UnauthorizedError } from '../../utils/errors';
import { RegisterDto, LoginDto } from './schema';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

interface SafeUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}

export const authService = {
  async register(data: RegisterDto) {
    const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing) throw new AppError(409, 'email already exists');

    const hashed = await hashPassword(data.password);
    const user = await queryOne<User>(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.email, hashed],
    );
    const token = signJwt({ userId: user!.id });
    return { token, user: toSafeUser(user!) };
  },

  async login(data: LoginDto) {
    const user = await queryOne<User>('SELECT * FROM users WHERE email = $1', [data.email]);
    if (!user) throw new UnauthorizedError('invalid credentials');

    const valid = await comparePassword(data.password, user.password);
    if (!valid) throw new UnauthorizedError('invalid credentials');

    const token = signJwt({ userId: user.id });
    return { token, user: toSafeUser(user) };
  },
};
