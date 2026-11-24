import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';

async function main() {
  console.log('[DB-UPDATE] Updating departments and user accounts...');

  // 1. Clean up & ensure S&H department
  let shDept = await prisma.department.findFirst({
    where: {
      OR: [
        { code: 'S&H' },
        { code: 'S&H ' },
        { name: { contains: 'Humanities' } },
      ],
    },
  });

  if (shDept) {
    shDept = await prisma.department.update({
      where: { id: shDept.id },
      data: {
        name: 'Science & Humanities',
        code: 'S&H',
        description: 'Department of Science & Humanities (First Year)',
        status: 'ACTIVE',
      },
    });
  } else {
    shDept = await prisma.department.create({
      data: {
        name: 'Science & Humanities',
        code: 'S&H',
        description: 'Department of Science & Humanities (First Year)',
        status: 'ACTIVE',
      },
    });
  }
  console.log('S&H Department synced:', shDept.id, shDept.name, `[${shDept.code}]`);

  // CSE Department
  let cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });
  if (!cseDept) {
    cseDept = await prisma.department.create({
      data: {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science & Engineering',
        status: 'ACTIVE',
      },
    });
  }
  console.log('CSE Department synced:', cseDept.id, cseDept.name, `[${cseDept.code}]`);

  // Admin Department
  let adminDept = await prisma.department.findUnique({ where: { code: 'ADMIN' } });
  if (!adminDept) {
    adminDept = await prisma.department.create({
      data: {
        name: 'Central Transport & Administration',
        code: 'ADMIN',
        description: 'Central Fleet & Campus Logistics Division',
        status: 'ACTIVE',
      },
    });
  }

  // Generate Hashes
  const salt = await bcrypt.genSalt(10);
  const faculty123Hash = await bcrypt.hash('faculty123', salt);
  const hari123Hash = await bcrypt.hash('Hari@123', salt);
  const admin123Hash = await bcrypt.hash('password123', salt);

  // 1. CSE HOD: Dr. Smitha J A
  const cseHod = await prisma.user.upsert({
    where: { email: 'hod.cse@sairamce.edu.in' },
    update: {
      name: 'Dr. Smitha J A',
      phone: '9626212446',
      passwordHash: faculty123Hash,
      departmentId: cseDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    create: {
      name: 'Dr. Smitha J A',
      email: 'hod.cse@sairamce.edu.in',
      phone: '9626212446',
      passwordHash: faculty123Hash,
      departmentId: cseDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
  });
  console.log('Synced CSE HOD:', cseHod.name, '|', cseHod.email, '|', cseHod.phone);

  // 2. S&H HOD: Dr. HARI KRISHNA S
  const shHod = await prisma.user.upsert({
    where: { email: 'hod.hs@sairamce.edu.in' },
    update: {
      name: 'Dr. HARI KRISHNA S',
      phone: '9845373762',
      passwordHash: hari123Hash,
      departmentId: shDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    create: {
      name: 'Dr. HARI KRISHNA S',
      email: 'hod.hs@sairamce.edu.in',
      phone: '9845373762',
      passwordHash: hari123Hash,
      departmentId: shDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
  });
  console.log('Synced S&H HOD:', shHod.name, '|', shHod.email, '|', shHod.phone);

  // 3. CSE Faculty: Prof. Amsa Lakshmi M
  const cseFaculty = await prisma.user.upsert({
    where: { email: 'amsalakshmim.cse@sairamce.edu.in' },
    update: {
      name: 'Prof. Amsa Lakshmi M',
      phone: '8545848866',
      passwordHash: faculty123Hash,
      departmentId: cseDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
    create: {
      name: 'Prof. Amsa Lakshmi M',
      email: 'amsalakshmim.cse@sairamce.edu.in',
      phone: '8545848866',
      passwordHash: faculty123Hash,
      departmentId: cseDept.id,
      role: 'FACULTY',
      status: 'ACTIVE',
    },
  });
  console.log('Synced CSE Faculty:', cseFaculty.name, '|', cseFaculty.email, '|', cseFaculty.phone);

  // 4. Ensure Estate Admin exists (SUPER_ADMIN)
  const estateAdmin = await prisma.user.upsert({
    where: { email: 'estate.admin@sairamce.edu.in' },
    update: {
      name: 'Campus Transport Manager',
      phone: '9840112233',
      passwordHash: admin123Hash,
      departmentId: adminDept.id,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Campus Transport Manager',
      email: 'estate.admin@sairamce.edu.in',
      phone: '9840112233',
      passwordHash: admin123Hash,
      departmentId: adminDept.id,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Synced Estate Admin (SUPER_ADMIN):', estateAdmin.name, '|', estateAdmin.email);

  // 5. Ensure COO Admin (ADMIN)
  const cooAdmin = await prisma.user.upsert({
    where: { email: 'coo@sairamce.edu.in' },
    update: {
      name: 'Arun Kumar R',
      phone: '9840998877',
      passwordHash: admin123Hash,
      departmentId: adminDept.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Arun Kumar R',
      email: 'coo@sairamce.edu.in',
      phone: '9840998877',
      passwordHash: admin123Hash,
      departmentId: adminDept.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Synced COO Admin (ADMIN):', cooAdmin.name, '|', cooAdmin.email);

  console.log('\n=== CURRENT DATABASE USER LIST ===');
  const allUsers = await prisma.user.findMany({
    include: { department: true },
    orderBy: { email: 'asc' },
  });
  allUsers.forEach((u) => {
    console.log(`- ${u.name.padEnd(30)} | ${u.email.padEnd(35)} | ${u.role.padEnd(12)} | ${u.phone} | Dept: ${u.department?.name}`);
  });
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
