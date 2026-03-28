const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recoverai';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await User.deleteMany({});
    
    // Insert dummy patient
    const patient1 = new User({
      name: 'John Doe',
      role: 'PATIENT',
      status: 'STABLE'
    });
    const patient2 = new User({
      name: 'Jane Smith',
      role: 'PATIENT',
      status: 'STABLE'
    });

    await patient1.save();
    await patient2.save();

    console.log('Seed successful. Patients created:');
    console.log(patient1.name, '-> ID:', patient1._id.toString());
    console.log(patient2.name, '-> ID:', patient2._id.toString());

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
