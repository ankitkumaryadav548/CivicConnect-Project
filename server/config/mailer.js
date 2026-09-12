const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account for local development if no SMTP config is present
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Created Ethereal Mailer Test Account:', testAccount.user);
    } catch (err) {
      console.log('⚠️ Mailer using fallback console transporter');
      transporter = {
        sendMail: async (opts) => {
          console.log(`[MOCK EMAIL DISPATCH] To: ${opts.to} | Subject: ${opts.subject}`);
          return { messageId: 'mock-mail-id' };
        },
      };
    }
  }

  return transporter;
};

const sendStatusUpdateEmail = async ({ recipientEmail, recipientName, issueTitle, issueId, newStatus, comment }) => {
  try {
    const mailer = await getTransporter();
    const formattedStatus = newStatus.replace('_', ' ').toUpperCase();

    const info = await mailer.sendMail({
      from: `"CivicConnect" <${process.env.SMTP_FROM || 'notifications@civicconnect.gov'}>`,
      to: recipientEmail,
      subject: `[CivicConnect Update] Issue Status Changed to ${formattedStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">🏙️ CivicConnect Municipal Update</h2>
          <p>Hello <strong>${recipientName || 'Citizen'}</strong>,</p>
          <p>The status of your reported issue <strong>"${issueTitle}"</strong> has been updated to:</p>
          
          <div style="background-color: #f1f5f9; padding: 12px 18px; border-left: 4px solid #6366f1; margin: 15px 0; border-radius: 4px;">
            <span style="font-size: 16px; font-weight: bold; color: #334155;">STATUS: ${formattedStatus}</span>
            ${comment ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;"><em>"${comment}"</em></p>` : ''}
          </div>

          <p style="font-size: 14px; color: #64748b;">You can view the full details and progress timeline by logging into your CivicConnect dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">CivicConnect Automated Municipal Dispatch Service</p>
        </div>
      `,
    });

    console.log(`✉️ Email notification sent to ${recipientEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send status email:', error.message);
  }
};

module.exports = {
  sendStatusUpdateEmail,
};
