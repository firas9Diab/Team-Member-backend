import 'dotenv/config';
import { PrismaClient, MemberStatus } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

function createPrisma() {
  const url = process.env['DATABASE_URL'] ?? 'file:./prisma/database.sqlite';
  const filePath = url.replace(/^file:/, '');
  const absolutePath = path.resolve(filePath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter } as any);
}

const prisma = createPrisma();

const teamMembers = [
  {
    fullName: 'Alex Johnson',
    jobTitle: 'Frontend Developer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    fullName: 'Sarah Williams',
    jobTitle: 'UI/UX Designer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    fullName: 'Michael Brown',
    jobTitle: 'Backend Developer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    fullName: 'Emily Davis',
    jobTitle: 'Product Manager',
    status: MemberStatus.INACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    fullName: 'David Wilson',
    jobTitle: 'DevOps Engineer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    fullName: 'Lisa Anderson',
    jobTitle: 'QA Engineer',
    status: MemberStatus.INACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    fullName: 'James Taylor',
    jobTitle: 'Full Stack Developer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    fullName: 'Olivia Martinez',
    jobTitle: 'Marketing Specialist',
    status: MemberStatus.INACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
  {
    fullName: 'Daniel Lee',
    jobTitle: 'Mobile Developer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/54.jpg',
  },
  {
    fullName: 'Sophia Moore',
    jobTitle: 'Data Analyst',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/29.jpg',
  },
  {
    fullName: 'Chris Clark',
    jobTitle: 'Security Engineer',
    status: MemberStatus.ACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/men/81.jpg',
  },
  {
    fullName: 'Emma Lewis',
    jobTitle: 'Content Strategist',
    status: MemberStatus.INACTIVE,
    avatarUrl: 'https://randomuser.me/api/portraits/women/50.jpg',
  },
];

async function main() {
  console.log('Seeding TeamFlow database...');

  await prisma.favorite.deleteMany();
  await prisma.teamMember.deleteMany();

  const user = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      fullName: 'Alex Johnson',
      email: 'alex@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  const createdMembers = [];
  for (const member of teamMembers) {
    const created = await prisma.teamMember.create({ data: member });
    createdMembers.push(created);
  }

  const favoriteNames = new Set([
    'Alex Johnson',
    'Michael Brown',
    'Lisa Anderson',
  ]);

  for (const member of createdMembers) {
    if (favoriteNames.has(member.fullName)) {
      await prisma.favorite.create({
        data: { userId: user.id, teamMemberId: member.id },
      });
    }
  }

  console.log('Demo user created: alex@example.com / password123');
  console.log(`${createdMembers.length} team members seeded`);
  console.log('Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
