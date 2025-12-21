import nodemailer from "nodemailer";

// Configure email service
let transporter;

// Initialize transporter with environment variables
export const initializeEmailService = () => {
  // Using Resend or SendGrid if configured, otherwise use a generic SMTP
  const emailService = process.env.EMAIL_SERVICE || "gmail";
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;

  if (emailUser && emailPassword) {
    transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } else if (emailHost && emailPort) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort),
      secure: emailPort === "465",
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } else {
    // Fallback to test mailer (development only)
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
};

// Send email to admin when ad is posted
export const sendAdPostedNotificationToAdmin = async (adData, userData) => {
  if (!transporter) initializeEmailService();

  const adminEmails = (process.env.ADMIN_EMAILS || "admin@zizi.com").split(",");
  const appUrl = process.env.APP_URL || "http://localhost:5000";
  const adUrl = `${appUrl}/admin/ads/${adData.id}`;

  const subject = `New Ad Posted: ${adData.title}`;
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #16a34a; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Ad Posted</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">A new ad has been posted and needs your review:</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #16a34a; font-size: 18px;">${adData.title}</h2>
              <p style="margin: 10px 0; color: #666;"><strong>Posted by:</strong> ${userData.name} (${userData.email})</p>
              <p style="margin: 10px 0; color: #666;"><strong>Category:</strong> ${adData.category_id}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Price:</strong> $${adData.price}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Location:</strong> ${adData.location || "N/A"}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Description:</strong></p>
              <p style="margin: 10px 0; color: #555; font-style: italic;">${adData.description}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${adUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px;">Review Ad</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              Status: <strong>Pending Review</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    for (const adminEmail of adminEmails) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@zizi.com",
        to: adminEmail.trim(),
        subject: subject,
        html: htmlContent,
        text: `New Ad Posted: ${adData.title}\n\nPosted by: ${userData.name} (${userData.email})\nCategory: ${adData.category_id}\nPrice: $${adData.price}\nLocation: ${adData.location}\n\nDescription: ${adData.description}\n\nReview: ${adUrl}`,
      });
    }
    console.log("Admin notification sent for ad:", adData.id);
    return { success: true, message: "Admin notified of new ad" };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return { success: false, message: "Failed to send admin notification" };
  }
};

// Send email when admin approves ad
export const sendAdApprovedNotificationToUser = async (
  adData,
  userData,
  approverName = "Admin"
) => {
  if (!transporter) initializeEmailService();

  const appUrl = process.env.APP_URL || "http://localhost:5000";
  const adUrl = `${appUrl}/ads/${adData.id}`;

  const subject = `Your Ad "${adData.title}" Has Been Approved!`;
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #16a34a; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Ad Approved</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Great news! Your ad has been reviewed and approved by ${approverName}.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #16a34a;">
              <h2 style="margin-top: 0; color: #16a34a; font-size: 18px;">${adData.title}</h2>
              <p style="margin: 10px 0; color: #666;"><strong>Price:</strong> $${adData.price}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Location:</strong> ${adData.location || "N/A"}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Active</span></p>
            </div>
            
            <p style="font-size: 14px; color: #555; margin-bottom: 20px;">Your ad is now live and visible to all users on the platform. You can view it and manage it from your dashboard.</p>
            
            <div style="text-align: center;">
              <a href="${adUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px;">View Your Ad</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              Thank you for using Zizi!
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@zizi.com",
      to: userData.email,
      subject: subject,
      html: htmlContent,
      text: `Good news! Your ad "${adData.title}" has been approved by ${approverName}.\n\nPrice: $${adData.price}\nLocation: ${adData.location}\nStatus: Active\n\nView your ad: ${adUrl}`,
    });
    console.log("Approval notification sent to user:", userData.id);
    return { success: true, message: "User notified of approval" };
  } catch (error) {
    console.error("Error sending approval notification:", error);
    return { success: false, message: "Failed to send approval notification" };
  }
};

// Send email when admin rejects ad
export const sendAdRejectedNotificationToUser = async (
  adData,
  userData,
  rejectionReason = "The ad does not meet our platform standards.",
  rejectedByName = "Admin"
) => {
  if (!transporter) initializeEmailService();

  const appUrl = process.env.APP_URL || "http://localhost:5000";

  const subject = `Your Ad "${adData.title}" Was Not Approved`;
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #dc2626; padding: 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Ad Not Approved</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">We regret to inform you that your ad has been reviewed and was not approved.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
              <h2 style="margin-top: 0; color: #dc2626; font-size: 18px;">${adData.title}</h2>
              <p style="margin: 10px 0; color: #666;"><strong>Reviewed by:</strong> ${rejectedByName}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Rejected</span></p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin-top: 0; color: #555;"><strong>Reason for rejection:</strong></p>
              <p style="margin: 10px 0; color: #666; font-style: italic;">${rejectionReason}</p>
            </div>
            
            <p style="font-size: 14px; color: #555; margin-bottom: 20px;">You can revise your ad and resubmit it for review. Please ensure it complies with our community guidelines.</p>
            
            <div style="text-align: center;">
              <a href="${appUrl}/my-ads" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px;">View My Ads</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              If you believe this is a mistake, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@zizi.com",
      to: userData.email,
      subject: subject,
      html: htmlContent,
      text: `Your ad "${adData.title}" was not approved.\n\nReason: ${rejectionReason}\n\nReviewed by: ${rejectedByName}\n\nYou can revise your ad and resubmit it for review.\n\nView your ads: ${appUrl}/my-ads`,
    });
    console.log("Rejection notification sent to user:", userData.id);
    return { success: true, message: "User notified of rejection" };
  } catch (error) {
    console.error("Error sending rejection notification:", error);
    return { success: false, message: "Failed to send rejection notification" };
  }
};

export default {
  initializeEmailService,
  sendAdPostedNotificationToAdmin,
  sendAdApprovedNotificationToUser,
  sendAdRejectedNotificationToUser,
};
