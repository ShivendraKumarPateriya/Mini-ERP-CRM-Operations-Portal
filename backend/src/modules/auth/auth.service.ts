import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { signToken } from '../../utils/jwt.js';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
}
