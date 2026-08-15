require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Match = require('../src/models/Match');
const Session = require('../src/models/Session');
const Report = require('../src/models/Report');
const Review = require('../src/models/Review');
const Dispute = require('../src/models/Dispute');
const SkillCategory = require('../src/models/SkillCategory');
const Announcement = require('../src/models/Announcement');
const bcrypt = require('bcryptjs');

const seedDemoData = async () => {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync';
  try {
    console.log('Connecting to MongoDB for demo data seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const hashedPassword = await bcrypt.hash('user123456', 10);
    const adminPassword = await bcrypt.hash('admin123456', 10);

    // 1. Master Skill Categories
    await SkillCategory.deleteMany({});
    const categories = await SkillCategory.insertMany([
      { name: 'Web Development', description: 'React, Node.js, HTML, CSS, JavaScript', icon: 'Code' },
      { name: 'Data Science & AI', description: 'Python, Machine Learning, Data Analytics', icon: 'Database' },
      { name: 'Design & UI/UX', description: 'Figma, UI Design, Graphic Design', icon: 'Palette' },
      { name: 'Languages', description: 'Spanish, French, Mandarin, English', icon: 'Globe' },
      { name: 'Business & Marketing', description: 'SEO, Digital Marketing, Public Speaking', icon: 'Briefcase' },
    ]);
    console.log(`Seeded ${categories.length} skill categories.`);

    // 2. Users (Super Admin, Support Admin, 10 Active Users)
    await User.deleteMany({});
    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@skillsync.com',
        password: adminPassword,
        role: 'admin',
        adminRole: 'super_admin',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Web Development', experienceLevel: 'Expert', proofStatus: 'approved' }],
      },
      {
        name: 'Support Admin',
        email: 'support@skillsync.com',
        password: adminPassword,
        role: 'admin',
        adminRole: 'support_admin',
        isVerified: true,
      },
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'React.js', experienceLevel: 'Advanced', proofLink: 'https://github.com/alex-rivera', proofStatus: 'pending' }],
        skillsToLearn: [{ skillName: 'Python', desiredLevel: 'Intermediate' }],
      },
      {
        name: 'Sophia Chen',
        email: 'sophia@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Python', experienceLevel: 'Expert', proofLink: 'https://cert.dev/py-cert', proofStatus: 'approved' }],
        skillsToLearn: [{ skillName: 'React.js', desiredLevel: 'Beginner' }],
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Figma UI Design', experienceLevel: 'Advanced', proofLink: 'https://figma.com/@marcus', proofStatus: 'pending' }],
        skillsToLearn: [{ skillName: 'Machine Learning', desiredLevel: 'Beginner' }],
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: false,
        skillsToTeach: [{ skillName: 'Spanish Fluency', experienceLevel: 'Expert', proofLink: 'https://dele.es/cert/998', proofStatus: 'pending' }],
        skillsToLearn: [{ skillName: 'Public Speaking', desiredLevel: 'Intermediate' }],
      },
      {
        name: 'David Kim',
        email: 'david@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Node.js & Express', experienceLevel: 'Advanced', proofStatus: 'approved' }],
        skillsToLearn: [{ skillName: 'Spanish Fluency', desiredLevel: 'Beginner' }],
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Machine Learning', experienceLevel: 'Expert', proofStatus: 'approved' }],
        skillsToLearn: [{ skillName: 'Figma UI Design', desiredLevel: 'Intermediate' }],
      },
      {
        name: 'Liam O\'Connor',
        email: 'liam@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: false,
        skillsToTeach: [{ skillName: 'SEO & Marketing', experienceLevel: 'Intermediate', proofStatus: 'none' }],
        skillsToLearn: [{ skillName: 'React.js', desiredLevel: 'Beginner' }],
      },
      {
        name: 'Chloe Bennett',
        email: 'chloe@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        skillsToTeach: [{ skillName: 'Public Speaking', experienceLevel: 'Advanced', proofStatus: 'approved' }],
        skillsToLearn: [{ skillName: 'Node.js & Express', desiredLevel: 'Intermediate' }],
      },
    ];

    const users = await User.insertMany(usersData);
    console.log(`Seeded ${users.length} users (including Admins).`);

    const alex = users.find((u) => u.email === 'alex@example.com');
    const sophia = users.find((u) => u.email === 'sophia@example.com');
    const marcus = users.find((u) => u.email === 'marcus@example.com');
    const elena = users.find((u) => u.email === 'elena@example.com');
    const david = users.find((u) => u.email === 'david@example.com');
    const priya = users.find((u) => u.email === 'priya@example.com');

    // 3. Matches
    await Match.deleteMany({});
    const matches = await Match.insertMany([
      { sender: alex._id, receiver: sophia._id, skillOffered: 'React.js', skillRequested: 'Python', status: 'accepted' },
      { sender: marcus._id, receiver: priya._id, skillOffered: 'Figma UI Design', skillRequested: 'Machine Learning', status: 'accepted' },
      { sender: elena._id, receiver: david._id, skillOffered: 'Spanish Fluency', skillRequested: 'Node.js & Express', status: 'pending' },
      { sender: alex._id, receiver: david._id, skillOffered: 'React.js', skillRequested: 'Node.js & Express', status: 'accepted' },
    ]);
    console.log(`Seeded ${matches.length} skill matches.`);

    // 4. Sessions
    await Session.deleteMany({});
    const sessions = await Session.insertMany([
      {
        user1Id: alex._id,
        user2Id: sophia._id,
        proposedTime: new Date(Date.now() + 86400000),
        status: 'confirmed',
        zoomUrl: 'https://zoom.us/j/123456789',
        videoCallLink: 'https://zoom.us/j/123456789',
      },
      {
        user1Id: marcus._id,
        user2Id: priya._id,
        proposedTime: new Date(Date.now() - 172800000),
        status: 'completed',
      },
      {
        user1Id: elena._id,
        user2Id: david._id,
        proposedTime: new Date(Date.now() + 172800000),
        status: 'requested',
      },
      {
        user1Id: alex._id,
        user2Id: david._id,
        proposedTime: new Date(Date.now() - 86400000),
        status: 'disputed',
      },
    ]);
    console.log(`Seeded ${sessions.length} sessions.`);

    // 5. Abuse Reports
    await Report.deleteMany({});
    await Report.create({
      reporterId: sophia._id,
      reportedUserId: elena._id,
      reason: 'No-show for session',
      details: 'Participant did not join scheduled Zoom session and sent no notice.',
      status: 'pending',
    });
    console.log('Seeded abuse report.');

    // 6. Session Disputes
    await Dispute.deleteMany({});
    const disputedSession = sessions.find((s) => s.status === 'disputed');
    await Dispute.create({
      sessionId: disputedSession._id,
      initiatorId: alex._id,
      respondentId: david._id,
      reason: 'Participant did not fulfill agreed teaching duration',
      details: 'Only taught for 10 minutes instead of the agreed 45 minutes.',
      initiatorComment: 'I waited for 45 minutes, but David left after 10 minutes.',
      status: 'pending',
    });
    console.log('Seeded session dispute.');

    // 7. Reviews
    await Review.deleteMany({});
    await Review.insertMany([
      {
        reviewerId: sophia._id,
        revieweeId: alex._id,
        rating: 5,
        comment: 'Alex is a phenomenal React mentor! Explained hooks clearly.',
      },
      {
        reviewerId: priya._id,
        revieweeId: marcus._id,
        rating: 5,
        comment: 'Marcus gave incredible Figma design feedback.',
      },
      {
        reviewerId: alex._id,
        revieweeId: sophia._id,
        rating: 5,
        comment: 'Sophia is an expert Python teacher. Highly recommend!',
      },
    ]);
    console.log('Seeded reviews.');

    // 8. System Announcements
    await Announcement.deleteMany({});
    await Announcement.create({
      title: 'Platform Maintenance Notice',
      message: 'Scheduled server optimization on Sunday at 02:00 UTC.',
      type: 'warning',
      isActive: true,
      createdBy: users[0]._id,
    });
    console.log('Seeded announcement.');

    console.log('Successfully completed full demo data seeding!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDemoData();
