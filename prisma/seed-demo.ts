/**
 * Run once to seed demo user:
 * npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-demo.ts
 * OR add to package.json scripts and run: npm run seed:demo
 */
import * as dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const DEMO_USER_ID = "demo_mahendra_bahubali_static";

async function main() {
  console.log("🌱 Seeding demo user...");

  // Upsert demo user
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      name: "Mahendra Bahubali",
      email: "demo@vyaya.app",
      image: null,
      phone: "+49 151 2345 6789",
      paymentHandle: "mahendra.bahubali@paypal.me",
      city: "Berlin",
    },
  });

  console.log("✅ Demo user created:", user.id);

  // Clean existing demo data
  await prisma.budget.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.recurringTransaction.deleteMany({
    where: { userId: DEMO_USER_ID },
  });
  await prisma.transaction.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.friend.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.group.deleteMany({ where: { userId: DEMO_USER_ID } });

  // ── Friends ──────────────────────────────────────────
  const friends = await Promise.all([
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Müller",
        prefix: "Klaus",
        phone: "+49 170 1234567",
        location: "Berlin",
        group: "Flatmates",
        isFavourite: true,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Schmidt",
        prefix: "Lena",
        phone: "+49 172 2345678",
        location: "Berlin",
        group: "Flatmates",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Sharma",
        prefix: "Rohan",
        phone: "+49 151 3456789",
        location: "Berlin",
        group: "Uni",
        isFavourite: true,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Patel",
        prefix: "Priya",
        phone: "+49 152 4567890",
        location: "Berlin",
        group: "Uni",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Singh",
        prefix: "Arjun",
        phone: "+49 157 5678901",
        location: "Berlin",
        group: "Uni",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Becker",
        prefix: "Tim",
        phone: "+49 162 6789012",
        location: "Berlin",
        group: "Work",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Wagner",
        prefix: "Anna",
        phone: "+49 163 7890123",
        location: "Berlin",
        group: "Work",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Fischer",
        prefix: "Max",
        phone: "+49 174 8901234",
        location: "Berlin",
        group: "Work",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Kumar",
        prefix: "Vikram",
        phone: "+49 176 9012345",
        location: "Berlin",
        group: "Uni",
        isFavourite: true,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Gupta",
        prefix: "Neha",
        phone: "+49 177 0123456",
        location: "Berlin",
        group: "Uni",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Hoffmann",
        prefix: "Jonas",
        phone: "+49 178 1234567",
        location: "Berlin",
        group: "Flatmates",
        isFavourite: false,
      },
    }),
    prisma.friend.create({
      data: {
        userId: DEMO_USER_ID,
        name: "Weber",
        prefix: "Sophie",
        phone: "+49 179 2345678",
        location: "Berlin",
        group: "Work",
        isFavourite: false,
      },
    }),
  ]);

  const [
    Klaus,
    Lena,
    Rohan,
    Priya,
    Arjun,
    Tim,
    Anna,
    Max,
    Vikram,
    Neha,
    Jonas,
    Sophie,
  ] = friends;
  console.log("✅ 12 friends created");

  // ── Groups ───────────────────────────────────────────
  const now = new Date();
  const [flatWG, uniGroup, workGroup, projectGroup, italyTrip] =
    await Promise.all([
      prisma.group.create({
        data: {
          userId: DEMO_USER_ID,
          name: "Flat WG",
          description: "Shared apartment in Prenzlauer Berg",
          category: "Household",
        },
      }),
      prisma.group.create({
        data: {
          userId: DEMO_USER_ID,
          name: "Uni Group",
          description: "TU Berlin study group",
          category: "Education",
        },
      }),
      prisma.group.create({
        data: {
          userId: DEMO_USER_ID,
          name: "Work Group",
          description: "Part-time job colleagues",
          category: "Food",
        },
      }),
      prisma.group.create({
        data: {
          userId: DEMO_USER_ID,
          name: "Project Group",
          description: "Semester project team",
          category: "Education",
        },
      }),
      prisma.group.create({
        data: {
          userId: DEMO_USER_ID,
          name: "Italy Trip",
          description: "Spring break Rome & Florence",
          category: "Trip",
        },
      }),
    ]);
  console.log("✅ 5 groups created");

  // ── Helper ───────────────────────────────────────────
  function daysAgo(n: number) {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  }

  // ── Transactions (55 total) ──────────────────────────
  const txData = [
    // Month 1 (60-90 days ago) — EXPENSES
    {
      title: "Rent – February",
      description: "Monthly rent Prenzlauer Berg",
      category: "Home",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 620,
      paymentDate: daysAgo(88),
      groupId: flatWG.id,
    },
    {
      title: "Kaufland Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 47.6,
      paymentDate: daysAgo(86),
    },
    {
      title: "BVG Monthly Ticket",
      description: "Berlin public transport",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 86,
      paymentDate: daysAgo(85),
    },
    {
      title: "Netflix",
      description: "Streaming subscription",
      category: "Movie",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 15.99,
      paymentDate: daysAgo(84),
    },
    {
      title: "Health Insurance",
      description: "TK Krankenkasse",
      category: "Medical",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 110.5,
      paymentDate: daysAgo(83),
    },
    {
      title: "GEZ Radio Tax",
      description: "Rundfunkbeitrag",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 18.36,
      paymentDate: daysAgo(82),
    },
    {
      title: "Mensa Lunch",
      description: "TU Berlin Mensa",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 3.2,
      paymentDate: daysAgo(81),
    },
    {
      title: "Lidl Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 38.45,
      paymentDate: daysAgo(79),
    },
    {
      title: "Part-time Job – February",
      description: "Werkstudent salary",
      category: "Miscellaneous",
      paymentMethod: "Credit",
      paymentType: "Bank Transfer",
      amount: 450,
      paymentDate: daysAgo(78),
    },
    {
      title: "Döner Kebab",
      description: "Dinner with Rohan",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 8.5,
      paymentDate: daysAgo(77),
    },
    {
      title: "Steam Game",
      description: "Elden Ring DLC",
      category: "Gaming",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 24.99,
      paymentDate: daysAgo(76),
    },
    {
      title: "Pharmacy",
      description: "Cold medicine",
      category: "Medical",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 12.8,
      paymentDate: daysAgo(74),
    },
    {
      title: "Netto Groceries",
      description: "Weekend shopping",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 29.9,
      paymentDate: daysAgo(72),
    },
    {
      title: "Mensa Lunch",
      description: "TU Berlin Mensa",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 3.2,
      paymentDate: daysAgo(70),
    },
    {
      title: "Club Night",
      description: "Berghain with Klaus and Lena",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 22,
      paymentDate: daysAgo(68),
      groupId: flatWG.id,
    },
    {
      title: "Phone Bill",
      description: "Telekom monthly plan",
      category: "Technology",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 19.99,
      paymentDate: daysAgo(67),
    },
    {
      title: "Kaufland Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 52.3,
      paymentDate: daysAgo(65),
    },
    {
      title: "Printing – Uni",
      description: "Semester project prints",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 6.4,
      paymentDate: daysAgo(63),
      groupId: projectGroup.id,
    },

    // Month 2 (30-60 days ago)
    {
      title: "Rent – March",
      description: "Monthly rent Prenzlauer Berg",
      category: "Home",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 620,
      paymentDate: daysAgo(58),
      groupId: flatWG.id,
    },
    {
      title: "BVG Monthly Ticket",
      description: "Berlin public transport",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 86,
      paymentDate: daysAgo(57),
    },
    {
      title: "Netflix",
      description: "Streaming subscription",
      category: "Movie",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 15.99,
      paymentDate: daysAgo(56),
    },
    {
      title: "Health Insurance",
      description: "TK Krankenkasse",
      category: "Medical",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 110.5,
      paymentDate: daysAgo(55),
    },
    {
      title: "GEZ Radio Tax",
      description: "Rundfunkbeitrag",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 18.36,
      paymentDate: daysAgo(54),
    },
    {
      title: "Part-time Job – March",
      description: "Werkstudent salary",
      category: "Miscellaneous",
      paymentMethod: "Credit",
      paymentType: "Bank Transfer",
      amount: 450,
      paymentDate: daysAgo(52),
    },
    {
      title: "Lidl Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 41.2,
      paymentDate: daysAgo(51),
    },
    {
      title: "Italy Trip – Train",
      description: "Berlin to Rome ICE + Trenitalia",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 189,
      paymentDate: daysAgo(50),
      groupId: italyTrip.id,
    },
    {
      title: "Italy Trip – Airbnb",
      description: "Rome accommodation 3 nights",
      category: "Home",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 210,
      paymentDate: daysAgo(49),
      groupId: italyTrip.id,
    },
    {
      title: "Colosseum Tickets",
      description: "Entrance fee Rome",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 18,
      paymentDate: daysAgo(46),
      groupId: italyTrip.id,
    },
    {
      title: "Pizza & Wine – Rome",
      description: "Dinner Trastevere",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 32.5,
      paymentDate: daysAgo(45),
      groupId: italyTrip.id,
    },
    {
      title: "Florence – Museum",
      description: "Uffizi Gallery tickets",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 25,
      paymentDate: daysAgo(43),
      groupId: italyTrip.id,
    },
    {
      title: "Mensa Lunch",
      description: "TU Berlin Mensa",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 3.2,
      paymentDate: daysAgo(40),
    },
    {
      title: "Phone Bill",
      description: "Telekom monthly plan",
      category: "Technology",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 19.99,
      paymentDate: daysAgo(39),
    },
    {
      title: "DM Drugstore",
      description: "Toiletries and shampoo",
      category: "Shopping",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 23.6,
      paymentDate: daysAgo(38),
    },
    {
      title: "Kaufland Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 55.8,
      paymentDate: daysAgo(36),
    },
    {
      title: "Work Lunch",
      description: "Team lunch at office",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 14.5,
      paymentDate: daysAgo(34),
      groupId: workGroup.id,
    },
    {
      title: "Spotify",
      description: "Student plan",
      category: "Movie",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 5.99,
      paymentDate: daysAgo(33),
    },

    // Month 3 (0-30 days ago)
    {
      title: "Rent – April",
      description: "Monthly rent Prenzlauer Berg",
      category: "Home",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 620,
      paymentDate: daysAgo(28),
      groupId: flatWG.id,
    },
    {
      title: "BVG Monthly Ticket",
      description: "Berlin public transport",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 86,
      paymentDate: daysAgo(27),
    },
    {
      title: "Netflix",
      description: "Streaming subscription",
      category: "Movie",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 15.99,
      paymentDate: daysAgo(26),
    },
    {
      title: "Health Insurance",
      description: "TK Krankenkasse",
      category: "Medical",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 110.5,
      paymentDate: daysAgo(25),
    },
    {
      title: "GEZ Radio Tax",
      description: "Rundfunkbeitrag",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 18.36,
      paymentDate: daysAgo(24),
    },
    {
      title: "Part-time Job – April",
      description: "Werkstudent salary",
      category: "Miscellaneous",
      paymentMethod: "Credit",
      paymentType: "Bank Transfer",
      amount: 450,
      paymentDate: daysAgo(22),
    },
    {
      title: "Netto Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 33.4,
      paymentDate: daysAgo(21),
    },
    {
      title: "Mensa Lunch",
      description: "TU Berlin Mensa",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 3.2,
      paymentDate: daysAgo(20),
    },
    {
      title: "Phone Bill",
      description: "Telekom monthly plan",
      category: "Technology",
      paymentMethod: "Debit",
      paymentType: "Bank Transfer",
      amount: 19.99,
      paymentDate: daysAgo(18),
    },
    {
      title: "Ikea – Desk Lamp",
      description: "Study room lamp",
      category: "Home",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 29.99,
      paymentDate: daysAgo(16),
    },
    {
      title: "Kaufland Groceries",
      description: "Weekly groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 49.7,
      paymentDate: daysAgo(14),
    },
    {
      title: "Uni Project – Printing",
      description: "Final report printing",
      category: "Miscellaneous",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 8.2,
      paymentDate: daysAgo(12),
      groupId: projectGroup.id,
    },
    {
      title: "Work Team Dinner",
      description: "End of sprint celebration",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 28.5,
      paymentDate: daysAgo(10),
      groupId: workGroup.id,
    },
    {
      title: "Action Store",
      description: "Cleaning supplies",
      category: "Shopping",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 11.8,
      paymentDate: daysAgo(8),
    },
    {
      title: "Lidl Groceries",
      description: "Weekend groceries",
      category: "Groceries",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 36.9,
      paymentDate: daysAgo(6),
    },
    {
      title: "Mensa Lunch",
      description: "TU Berlin Mensa",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 3.2,
      paymentDate: daysAgo(5),
    },
    {
      title: "DM Drugstore",
      description: "Face wash and vitamins",
      category: "Shopping",
      paymentMethod: "Debit",
      paymentType: "Card",
      amount: 18.4,
      paymentDate: daysAgo(3),
    },
    {
      title: "Kebab & Beer",
      description: "Friday night with Rohan & Vikram",
      category: "Food",
      paymentMethod: "Debit",
      paymentType: "Cash",
      amount: 19.5,
      paymentDate: daysAgo(1),
    },
  ];

  // Create transactions and track IDs for contributor assignment
  const createdTx = await Promise.all(
    txData.map((t) =>
      prisma.transaction.create({
        data: {
          userId: DEMO_USER_ID,
          title: t.title,
          description: t.description,
          category: t.category,
          paymentMethod: t.paymentMethod,
          paymentType: t.paymentType,
          amount: t.amount,
          remark: "",
          paymentDate: t.paymentDate,
          groupId: t.groupId ?? null,
        },
      }),
    ),
  );
  console.log(`✅ ${createdTx.length} transactions created`);

  // ── Contributors (split transactions) ────────────────
  // Flat WG: Klaus and Lena share rent/club night
  const flatWGTxs = createdTx.filter(
    (t) => txData[createdTx.indexOf(t)]?.groupId === flatWG.id,
  );

  // Rent splits — Klaus and Lena each owe 206.67
  const rentTxs = flatWGTxs.filter((t) => t.title.startsWith("Rent"));
  for (const rentTx of rentTxs) {
    await prisma.transactionContributor.createMany({
      data: [
        {
          transactionId: rentTx.id,
          friendId: Klaus.id,
          amount: 206.67,
          settled: rentTx.paymentDate < daysAgo(30),
        },
        {
          transactionId: rentTx.id,
          friendId: Lena.id,
          amount: 206.67,
          settled: rentTx.paymentDate < daysAgo(30),
        },
      ],
    });
  }

  // Club night split — Klaus and Jonas each owe 7.33
  const clubTx = createdTx.find((t) => t.title === "Club Night");
  if (clubTx) {
    await prisma.transactionContributor.createMany({
      data: [
        {
          transactionId: clubTx.id,
          friendId: Klaus.id,
          amount: 7.33,
          settled: true,
        },
        {
          transactionId: clubTx.id,
          friendId: Jonas.id,
          amount: 7.33,
          settled: false,
        },
      ],
    });
  }

  // Italy trip — Rohan and Priya share costs
  const italyTxs = createdTx.filter(
    (t) => txData[createdTx.indexOf(t)]?.groupId === italyTrip.id,
  );
  for (const tx of italyTxs) {
    await prisma.transactionContributor.createMany({
      data: [
        {
          transactionId: tx.id,
          friendId: Rohan.id,
          amount: Number(tx.amount) * 0.33,
          settled: false,
        },
        {
          transactionId: tx.id,
          friendId: Priya.id,
          amount: Number(tx.amount) * 0.33,
          settled: false,
        },
      ],
    });
  }

  // Work lunch — Tim paid for Mahendra
  const workLunchTx = createdTx.find((t) => t.title === "Work Lunch");
  if (workLunchTx) {
    await prisma.transaction.update({
      where: { id: workLunchTx.id },
      data: { paidByFriendId: Tim.id },
    });
    await prisma.transactionContributor.create({
      data: {
        transactionId: workLunchTx.id,
        friendId: Tim.id,
        amount: 14.5,
        settled: false,
      },
    });
  }

  // Kebab night — Rohan paid for Mahendra
  const kebabTx = createdTx.find((t) => t.title === "Kebab & Beer");
  if (kebabTx) {
    await prisma.transaction.update({
      where: { id: kebabTx.id },
      data: { paidByFriendId: Rohan.id },
    });
    await prisma.transactionContributor.create({
      data: {
        transactionId: kebabTx.id,
        friendId: Rohan.id,
        amount: 6.5,
        settled: false,
      },
    });
  }

  // Project group — Arjun and Neha share printing costs
  const printTxs = createdTx.filter(
    (t) => t.title.includes("Printing") || t.title.includes("Uni Project"),
  );
  for (const tx of printTxs) {
    await prisma.transactionContributor.createMany({
      data: [
        {
          transactionId: tx.id,
          friendId: Arjun.id,
          amount: Number(tx.amount) * 0.33,
          settled: false,
        },
        {
          transactionId: tx.id,
          friendId: Neha.id,
          amount: Number(tx.amount) * 0.33,
          settled: false,
        },
      ],
    });
  }

  console.log("✅ Contributors seeded");

  // ── Recurring Transactions ───────────────────────────
  await prisma.recurringTransaction.createMany({
    data: [
      {
        userId: DEMO_USER_ID,
        title: "Rent",
        description: "Monthly rent Prenzlauer Berg WG",
        category: "Home",
        paymentMethod: "Debit",
        paymentType: "Bank Transfer",
        amount: 620,
        frequency: "monthly",
        nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        isActive: true,
        groupId: flatWG.id,
      },
      {
        userId: DEMO_USER_ID,
        title: "Netflix",
        description: "Streaming subscription",
        category: "Movie",
        paymentMethod: "Debit",
        paymentType: "Card",
        amount: 15.99,
        frequency: "monthly",
        nextDueDate: daysAgo(-3), // due in 3 days
        isActive: true,
      },
      {
        userId: DEMO_USER_ID,
        title: "Phone Bill",
        description: "Telekom monthly plan",
        category: "Technology",
        paymentMethod: "Debit",
        paymentType: "Bank Transfer",
        amount: 19.99,
        frequency: "monthly",
        nextDueDate: daysAgo(-5),
        isActive: true,
      },
      {
        userId: DEMO_USER_ID,
        title: "Health Insurance",
        description: "TK Krankenkasse",
        category: "Medical",
        paymentMethod: "Debit",
        paymentType: "Bank Transfer",
        amount: 110.5,
        frequency: "monthly",
        nextDueDate: daysAgo(-2),
        isActive: true,
      },
      {
        userId: DEMO_USER_ID,
        title: "GEZ Radio Tax",
        description: "Rundfunkbeitrag – quarterly",
        category: "Miscellaneous",
        paymentMethod: "Debit",
        paymentType: "Bank Transfer",
        amount: 18.36,
        frequency: "monthly",
        nextDueDate: daysAgo(-10),
        isActive: false, // paused to show that state
      },
    ],
  });
  console.log("✅ Recurring transactions seeded");

  // ── Budgets ──────────────────────────────────────────
  await prisma.budget.createMany({
    data: [
      { userId: DEMO_USER_ID, category: "Food", amount: 150 },
      { userId: DEMO_USER_ID, category: "Groceries", amount: 200 },
      { userId: DEMO_USER_ID, category: "Home", amount: 700 },
      { userId: DEMO_USER_ID, category: "Medical", amount: 130 },
      { userId: DEMO_USER_ID, category: "Movie", amount: 30 },
      { userId: DEMO_USER_ID, category: "Shopping", amount: 80 },
      { userId: DEMO_USER_ID, category: "Technology", amount: 50 },
    ],
  });
  console.log("✅ Budgets seeded");

  console.log("\n🎉 Demo seed complete!");
  console.log(`   User ID: ${DEMO_USER_ID}`);
  console.log(`   Email:   demo@vyaya.app`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
