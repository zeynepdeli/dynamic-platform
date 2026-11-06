import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const email = process.env.TEST_USER_EMAIL?.trim().toLowerCase();
const password = process.env.TEST_USER_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!email || !password || !databaseUrl) {
  throw new Error(
    'TEST_USER_EMAIL, TEST_USER_PASSWORD ve DATABASE_URL zorunludur.',
  );
}

if (password.length < 12) {
  throw new Error('ADMIN_PASSWORD en az 12 karakter olmalıdır.');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

try {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error('Bu e-posta adresiyle kullanıcı zaten mevcut.');
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log('Test kullanıcısı oluşturuldu:', user.email);
} finally {
  await prisma.$disconnect();
}
