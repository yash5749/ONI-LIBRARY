import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting large database seeding...");

  // -----------------------------------
  // 1. USERS (100 users)
  // -----------------------------------

  const usersCount = 100;
const usersData: Prisma.UserCreateManyInput[] = [];


  const adminPassword = await bcrypt.hash("admin123", 10);
  const defaultUserPassword = await bcrypt.hash("user123", 10);

  // Add ADMIN first
  usersData.push({
    email: "admin@example.com",
    name: "Admin User",
    password: adminPassword,
    role: "admin",
  });

  // Generate 99 normal users
  for (let i = 0; i < usersCount - 1; i++) {
    usersData.push({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      password: defaultUserPassword,
      role: "user",
    });
  }

  await prisma.user.createMany({ data: usersData });
  console.log(`👤 Created ${usersCount} users`);

  const users = await prisma.user.findMany();

  // -----------------------------------
  // 2. AUTHORS (20 authors)
  // -----------------------------------
  const authorsCount = 20;

  const authorsData = Array.from({ length: authorsCount }).map(() => ({
    name: faker.person.fullName(),
    bio: faker.lorem.sentence(),
  }));

  await prisma.author.createMany({ data: authorsData });
  console.log(`✍️  Created ${authorsCount} authors`);

  const authors = await prisma.author.findMany();

  // -----------------------------------
  // 3. BOOKS (150 books)
  // -----------------------------------
  const booksCount = 150;

const booksData: Prisma.BookCreateManyInput[] = [];


  for (let i = 0; i < booksCount; i++) {
    const randomAuthor =
      authors[Math.floor(Math.random() * authors.length)];

    booksData.push({
      title: faker.lorem.words({ min: 2, max: 5 }),
      isbn: faker.string.uuid(),
      authorId: randomAuthor.id,
      isBorrowed: false,
      borrowedByUserId: null,
    });
  }

  await prisma.book.createMany({ data: booksData });
  console.log(`📚 Created ${booksCount} books`);

  const books = await prisma.book.findMany();

  // -----------------------------------
  // 4. BORROWING LOGIC
  //    20–40% of books will be borrowed
  // -----------------------------------
  const borrowedBooksCount = Math.floor(
    faker.number.int({ min: booksCount * 0.2, max: booksCount * 0.4 })
  );

  const borrowedBooks = faker.helpers.arrayElements(
    books,
    borrowedBooksCount
  );

  for (const book of borrowedBooks) {
    const randomUser =
      users[Math.floor(Math.random() * users.length)];

    await prisma.book.update({
      where: { id: book.id },
      data: {
        isBorrowed: true,
        borrowedByUserId: randomUser.id,
      },
    });
  }

  console.log(
    `📕 Borrowed ${borrowedBooksCount} books (random users assigned)`
  );

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
