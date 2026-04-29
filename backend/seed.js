require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ParchiType = require('./models/ParchiType');
const MembershipType = require('./models/MembershipType');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await ParchiType.deleteMany();
  await MembershipType.deleteMany();

  await User.create([
    { name: 'Super Admin', email: 'admin@parchi.com', password: 'admin123', role: 'admin', shift: 'Morning' },
    { name: 'Operator One', email: 'op1@parchi.com', password: 'op123', role: 'operator', shift: 'Morning' },
    { name: 'Operator Two', email: 'op2@parchi.com', password: 'op123', role: 'operator', shift: 'Night' },
  ]);

  const parchiTypes = await ParchiType.create([
    { name: 'TWO WHEELER',              amount: 5,   prefix: 'T05', color: '#ffea05', description: '₹5 parking ticket'  },
    { name: 'THREE WHEELER',            amount: 10,  prefix: 'T10', color: '#0d9488', description: '₹10 parking ticket' },
    { name: 'FOUR WHEELER',             amount: 20,  prefix: 'T20', color: '#16a34a', description: '₹20 parking ticket' },
    { name: 'SIX WHEELER / BUS / TRUCK', amount: 100, prefix: 'T50', color: '#f00f9d', description: '₹50 parking ticket' },
  ]);
  await MembershipType.create([
    { name: 'Monthly - 2 Wheeler Day Parking Paas', amount: 120,  durationDays: 30, color: '#0891b2', description: 'Monthly membership for 2-wheelers'   },
    { name: 'Monthly - 4 Wheeler Day Parking Paas', amount: 500,  durationDays: 30, color: '#ed12c5', description: 'Monthly membership for 4-wheelers'   },
    { name: 'MONTHLY CAR PARKING PAAS 24 HOURS',    amount: 2000, durationDays: 30, color: '#0d9488', description: 'Quarterly membership for 2-wheelers' },
  ]);

  console.log('✅ Seeded successfully');
  console.log('Admin: admin@parchi.com / admin123');
  console.log('Operator: op1@parchi.com / op123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
