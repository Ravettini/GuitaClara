import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2] || 'test@example.com';
  const newPassword = process.argv[3] || 'password123';

  console.log(`Reseteando contraseña para: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`Usuario ${email} no encontrado`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log(`✅ Contraseña reseteada para ${email}`);
  console.log(`Nueva contraseña: ${newPassword}`);
}

resetPassword()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


