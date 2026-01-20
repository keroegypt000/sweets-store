import nodemailer from 'nodemailer';

// Email configuration - using environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && emailConfig.auth.user && emailConfig.auth.pass) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  totalAmount: string,
  items: Array<{ name: string; quantity: number; price: string }>
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email] Email service not configured');
    return false;
  }

  try {
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price} KWD</td>
      </tr>`
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FFC107; padding: 20px; text-align: center; border-radius: 5px; }
          .header h1 { margin: 0; color: #333; }
          .content { padding: 20px 0; }
          .order-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-details p { margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; color: #FFC107; text-align: right; padding: 15px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ تم استلام طلبك</h1>
            <p>Order Confirmed</p>
          </div>

          <div class="content">
            <p>مرحباً ${customerName},</p>
            <p>Hello ${customerName},</p>

            <div class="order-details">
              <p><strong>رقم الطلب / Order Number:</strong> ${orderNumber}</p>
              <p><strong>البريد الإلكتروني / Email:</strong> ${customerEmail}</p>
            </div>

            <h3>تفاصيل الطلب / Order Details:</h3>
            <table>
              <thead>
                <tr style="background-color: #FFC107;">
                  <th style="padding: 10px; text-align: left;">المنتج / Product</th>
                  <th style="padding: 10px; text-align: center;">الكمية / Qty</th>
                  <th style="padding: 10px; text-align: right;">السعر / Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              الإجمالي / Total: ${totalAmount} KWD
            </div>

            <p>سيتم معالجة طلبك قريباً وسنرسل لك تحديثات عن حالة الشحن.</p>
            <p>Your order will be processed shortly and we will send you shipping updates.</p>

            <p>شكراً لك على تسوقك معنا!</p>
            <p>Thank you for shopping with us!</p>
          </div>

          <div class="footer">
            <p>© 2026 متجر الحلويات - Sweets Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: emailConfig.auth.user,
      to: customerEmail,
      subject: `تأكيد الطلب / Order Confirmation - ${orderNumber}`,
      html: htmlContent,
    });

    console.log(`[Email] Order confirmation sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send order confirmation:', error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  statusAr: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email] Email service not configured');
    return false;
  }

  try {
    const statusMessages: Record<string, { ar: string; en: string }> = {
      confirmed: { ar: 'تم تأكيد طلبك', en: 'Your order has been confirmed' },
      shipped: { ar: 'تم شحن طلبك', en: 'Your order has been shipped' },
      delivered: { ar: 'تم تسليم طلبك', en: 'Your order has been delivered' },
      cancelled: { ar: 'تم إلغاء طلبك', en: 'Your order has been cancelled' },
    };

    const message = statusMessages[status] || { ar: 'تحديث الطلب', en: 'Order Update' };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FFC107; padding: 20px; text-align: center; border-radius: 5px; }
          .header h1 { margin: 0; color: #333; }
          .content { padding: 20px 0; }
          .status-box { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #FFC107; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 تحديث الطلب</h1>
            <p>Order Update</p>
          </div>

          <div class="content">
            <p>مرحباً ${customerName},</p>
            <p>Hello ${customerName},</p>

            <div class="status-box">
              <p><strong>${message.ar}</strong></p>
              <p><strong>${message.en}</strong></p>
              <p style="margin-top: 10px; color: #666;">رقم الطلب / Order Number: <strong>${orderNumber}</strong></p>
            </div>

            <p>سنواصل إرسال التحديثات لك حول حالة طلبك.</p>
            <p>We will continue to send you updates about your order status.</p>
          </div>

          <div class="footer">
            <p>© 2026 متجر الحلويات - Sweets Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: emailConfig.auth.user,
      to: customerEmail,
      subject: `${message.ar} / ${message.en} - ${orderNumber}`,
      html: htmlContent,
    });

    console.log(`[Email] Status update sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send status update:', error);
    return false;
  }
}
