const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

const LOOKAHEAD_HOURS = parseInt(process.env.REMINDER_LOOKAHEAD_HOURS || '24', 10);

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
  return transporter;
}

async function checkAndSendSessionReminders() {
  const now = new Date();
  const lookaheadTime = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);

  try {
    const upcomingSessions = await Session.find({
      status: 'confirmed',
      $or: [
        { confirmedTime: { $gte: now, $lte: lookaheadTime } },
        { proposedTime: { $gte: now, $lte: lookaheadTime } },
      ],
    });

    const sentReminders = [];

    for (const session of upcomingSessions) {
      const sessionTime = session.confirmedTime || session.proposedTime;
      const participants = [session.user1Id, session.user2Id].filter(Boolean);

      for (const userId of participants) {
        const existingNotification = await Notification.findOne({
          userId,
          sessionId: session._id,
          type: 'session_reminder',
        });

        if (!existingNotification) {
          const messageText = `Reminder: You have an upcoming SkillSync session scheduled for ${new Date(sessionTime).toLocaleString()}. Video Call Link: ${session.videoCallLink || 'Pending'}`;

          const notification = new Notification({
            userId,
            sessionId: session._id,
            type: 'session_reminder',
            message: messageText,
            scheduledTime: sessionTime,
            sentAt: new Date(),
          });

          await notification.save();

          const mailer = await getTransporter();
          await mailer.sendMail({
            from: '"SkillSync Reminders" <no-reply@skillsync.app>',
            to: `user_${userId}@skillsync.app`,
            subject: '📅 Upcoming SkillSync Session Reminder',
            text: messageText,
            html: `<div style="font-family: sans-serif; padding: 20px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px;">
              <h2 style="color: #89b4fa;">SkillSync Session Reminder</h2>
              <p>${messageText}</p>
              ${session.videoCallLink ? `<a href="${session.videoCallLink}" style="padding: 10px 16px; background: #a6e3a1; color: #11111b; text-decoration: none; font-weight: bold; border-radius: 4px;">Join Video Call</a>` : ''}
            </div>`,
          });

          sentReminders.push(notification);
        }
      }
    }

    return { success: true, count: sentReminders.length, reminders: sentReminders };
  } catch (error) {
    console.error('Error executing reminder service:', error.message);
    return { success: false, error: error.message };
  }
}

let reminderCronTask;

function startReminderCron() {
  if (reminderCronTask) return;
  reminderCronTask = cron.schedule('0 * * * *', async () => {
    console.log('Running automated session reminder cron job...');
    await checkAndSendSessionReminders();
  });
  console.log(`Reminder service started with ${LOOKAHEAD_HOURS}h lookahead window.`);
}

function stopReminderCron() {
  if (reminderCronTask) {
    reminderCronTask.stop();
    reminderCronTask = null;
  }
}

module.exports = {
  checkAndSendSessionReminders,
  startReminderCron,
  stopReminderCron,
  LOOKAHEAD_HOURS,
};
