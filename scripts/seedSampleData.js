/**
 * Seed Sample Data Script
 * Populates Firestore with sample teachers, students, and bookings for testing
 * 
 * Usage:
 * 1. Make sure you have .env.local file with FIREBASE_SERVICE_ACCOUNT
 * 2. cd scripts
 * 3. npm install
 * 4. npm run seed-data
 */

require('dotenv').config({ path: '../.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountPath) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT not found in .env.local');
      process.exit(1);
    }
    
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }
}

// Sample data
const sampleTeachers = [
  {
    email: 'ahmet.yilmaz@example.com',
    displayName: 'Ahmet Yılmaz',
    role: 'teacher',
    subjects: ['Matematik', 'Fizik'],
    hourlyRate: 150,
    bio: '10 yıllık deneyime sahip matematik ve fizik öğretmeni. Üniversite sınavlarına hazırlık konusunda uzmanım.',
    phone: '+90 555 111 2233',
    imageUrl: '',
    isActive: true,
    rating: 4.8,
    totalReviews: 24,
    availability: {
      monday: ['09:00-12:00', '14:00-17:00'],
      tuesday: ['09:00-12:00', '14:00-17:00'],
      wednesday: ['09:00-12:00'],
      thursday: ['14:00-17:00'],
      friday: ['09:00-12:00', '14:00-17:00'],
    }
  },
  {
    email: 'elif.kaya@example.com',
    displayName: 'Elif Kaya',
    role: 'teacher',
    subjects: ['İngilizce', 'Edebiyat'],
    hourlyRate: 120,
    bio: 'Cambridge sertifikalı İngilizce öğretmeni. Konuşma ve yazma becerilerinizi geliştirmenize yardımcı oluyorum.',
    phone: '+90 555 222 3344',
    imageUrl: '',
    isActive: true,
    rating: 4.9,
    totalReviews: 31,
    availability: {
      monday: ['10:00-13:00', '15:00-18:00'],
      tuesday: ['10:00-13:00', '15:00-18:00'],
      wednesday: ['10:00-13:00', '15:00-18:00'],
      thursday: ['10:00-13:00'],
      friday: ['15:00-18:00'],
    }
  },
  {
    email: 'mehmet.demir@example.com',
    displayName: 'Mehmet Demir',
    role: 'teacher',
    subjects: ['Kimya', 'Biyoloji'],
    hourlyRate: 140,
    bio: 'Fen bilimleri alanında uzman öğretmen. TYT ve AYT sınavlarına hazırlık.',
    phone: '+90 555 333 4455',
    imageUrl: '',
    isActive: true,
    rating: 4.7,
    totalReviews: 18,
    availability: {
      monday: ['08:00-11:00', '13:00-16:00'],
      tuesday: ['08:00-11:00', '13:00-16:00'],
      wednesday: ['08:00-11:00', '13:00-16:00'],
      thursday: ['08:00-11:00', '13:00-16:00'],
      friday: ['08:00-11:00'],
    }
  }
];

const sampleStudents = [
  {
    email: 'student1@example.com',
    displayName: 'Ayşe Öztürk',
    role: 'student',
    phone: '+90 555 444 5566',
    isActive: true,
  },
  {
    email: 'student2@example.com',
    displayName: 'Can Yıldız',
    role: 'student',
    phone: '+90 555 555 6677',
    isActive: true,
  }
];

// Seed data
async function seedData() {
  const db = initializeFirebase();
  
  try {
    console.log('\n🌱 Starting data seeding...\n');
    
    // Check if data already exists
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (!usersSnapshot.empty) {
      console.log('⚠️  Data already exists. Delete existing data first or skip seeding.');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Continue and add more data? (y/n): ', resolve);
      });
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Seeding cancelled.');
        process.exit(0);
      }
    }
    
    // Add sample teachers
    console.log('📚 Adding teachers...');
    const teacherIds = [];
    for (const teacher of sampleTeachers) {
      const docRef = await db.collection('users').add({
        ...teacher,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      teacherIds.push(docRef.id);
      console.log(`  ✅ Created teacher: ${teacher.displayName} (${docRef.id})`);
    }
    
    // Add sample students
    console.log('\n👨‍🎓 Adding students...');
    const studentIds = [];
    for (const student of sampleStudents) {
      const docRef = await db.collection('users').add({
        ...student,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      studentIds.push(docRef.id);
      console.log(`  ✅ Created student: ${student.displayName} (${docRef.id})`);
    }
    
    // Add sample bookings (upcoming and past)
    console.log('\n📅 Adding sample bookings...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const sampleBookings = [
      {
        studentId: studentIds[0],
        teacherId: teacherIds[0],
        studentName: sampleStudents[0].displayName,
        teacherName: sampleTeachers[0].displayName,
        subject: 'Matematik',
        startTime: admin.firestore.Timestamp.fromDate(tomorrow),
        endTime: admin.firestore.Timestamp.fromDate(new Date(tomorrow.getTime() + 60 * 60 * 1000)),
        duration: 60,
        status: 'confirmed',
        price: sampleTeachers[0].hourlyRate,
        meetingLink: 'https://zoom.us/j/123456789',
        notes: 'Integral konusu',
      },
      {
        studentId: studentIds[1],
        teacherId: teacherIds[1],
        studentName: sampleStudents[1].displayName,
        teacherName: sampleTeachers[1].displayName,
        subject: 'İngilizce',
        startTime: admin.firestore.Timestamp.fromDate(new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000)),
        endTime: admin.firestore.Timestamp.fromDate(new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)),
        duration: 60,
        status: 'confirmed',
        price: sampleTeachers[1].hourlyRate,
        notes: 'Grammer practice',
      }
    ];
    
    for (const booking of sampleBookings) {
      const docRef = await db.collection('bookings').add({
        ...booking,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ Created booking: ${booking.studentName} -> ${booking.teacherName} (${docRef.id})`);
    }
    
    // Add sample notification
    console.log('\n🔔 Adding sample notifications...');
    const notification = {
      userId: studentIds[0],
      type: 'booking',
      title: 'Randevu Onaylandı',
      message: `${sampleTeachers[0].displayName} ile randevunuz onaylandı.`,
      isRead: false,
      link: '/bookings/detail.html',
      metadata: {},
    };
    
    const notifRef = await db.collection('notifications').add({
      ...notification,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Created notification (${notifRef.id})`);
    
    console.log('\n✅ Data seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${teacherIds.length} teachers`);
    console.log(`   - ${studentIds.length} students`);
    console.log(`   - ${sampleBookings.length} bookings`);
    console.log(`   - 1 notification`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Main execution
seedData().then(() => {
  console.log('\n🎉 All done!');
  process.exit(0);
});
