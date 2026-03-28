/**
 * seed.js — Populates the DB with demo users for the RecoverAI prototype.
 * Run once: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const SEED_USERS = [
  {
    name: 'Dr. Sarah Kapoor',
    email: 'sarah.kapoor@recoverai.com',
    role: 'CAREGIVER',
    status: 'STABLE',
  },
  {
    name: 'Rahul Mehta',
    email: 'rahul.mehta@recoverai.com',
    role: 'PATIENT',
    status: 'STABLE',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@recoverai.com',
    role: 'PATIENT',
    status: 'STABLE',
  },
  {
    name: 'Arjun Nair',
    email: 'arjun.nair@recoverai.com',
    role: 'PATIENT',
    status: 'STABLE',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users to avoid duplicates on re-seed
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Find caregiver first so we can set assignedCaregiverId on patients
    const caregiver = await User.create(SEED_USERS[0]);
    console.log(`👩‍⚕️  Created caregiver: ${caregiver.name}`);

    const patients = await User.insertMany(
      SEED_USERS.slice(1).map((p) => ({
        ...p,
        assignedCaregiverId: caregiver._id,
      }))
    );
    patients.forEach((p) => console.log(`🧑‍🤒 Created patient: ${p.name} (${p.email})`));

    console.log('\n🎉 Seed complete! Use these emails on the login page:');
    SEED_USERS.forEach((u) => console.log(`   ${u.role.padEnd(9)} → ${u.email}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
