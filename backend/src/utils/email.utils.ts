import nodemailer from "nodemailer";

export interface OrderEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  total: number;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

export async function sendOrderConfirmationEmail(
  params: OrderEmailParams,
): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "📧 Order confirmation email not sent — SMTP_HOST, SMTP_USER, SMTP_PASS are not configured.",
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? "587", 10),
    secure: SMTP_PORT === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const itemRows = params.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #2a2a2a;">${i.productName}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #2a2a2a;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #2a2a2a;text-align:right;">&#8377;${i.totalPrice.toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0f0d;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0d;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1710;border-radius:14px;overflow:hidden;border:1px solid rgba(212,175,55,0.22);">

          <!-- Header -->
          <tr>
            <td style="background:#0b0f0d;padding:28px 32px;border-bottom:1px solid rgba(212,175,55,0.12);">
              <span style="font-size:1.5rem;font-weight:800;color:#d4af37;">🌿 Aurea</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#d4af37;margin:0 0 8px;">Order Confirmed!</h2>
              <p style="color:#f0edd8;margin:0 0 24px;">
                Hi ${params.customerName}, thank you for shopping with Aurea.
                Your order has been placed successfully.
              </p>

              <p style="color:#9e9470;font-size:0.85rem;margin:0 0 4px;">ORDER NUMBER</p>
              <p style="color:#e6c76a;font-size:1.1rem;font-weight:700;margin:0 0 24px;">#${params.orderNumber}</p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:2px solid #d4af37;">
                    <th style="padding:8px 4px;text-align:left;color:#9e9470;font-weight:600;font-size:0.85rem;">Product</th>
                    <th style="padding:8px 4px;text-align:center;color:#9e9470;font-weight:600;font-size:0.85rem;">Qty</th>
                    <th style="padding:8px 4px;text-align:right;color:#9e9470;font-weight:600;font-size:0.85rem;">Price</th>
                  </tr>
                </thead>
                <tbody style="color:#f0edd8;">
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:12px 4px;font-weight:700;color:#d4af37;border-top:2px solid #d4af37;">Total</td>
                    <td style="padding:12px 4px;text-align:right;font-weight:700;color:#d4af37;border-top:2px solid #d4af37;">
                      &#8377;${params.total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping -->
              <h3 style="color:#d4af37;margin:28px 0 8px;">Shipping to</h3>
              <p style="color:#f0edd8;margin:0 0 4px;">${params.shippingAddress.line1}</p>
              <p style="color:#f0edd8;margin:0 0 4px;">${params.shippingAddress.city}, ${params.shippingAddress.state} &mdash; ${params.shippingAddress.pinCode}</p>

              <p style="color:#9e9470;font-size:0.85rem;margin:28px 0 0;">
                If you have any questions about your order, reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0b0f0d;padding:20px 32px;text-align:center;border-top:1px solid rgba(212,175,55,0.12);">
              <p style="color:#9e9470;font-size:0.8rem;margin:0;">
                &copy; ${new Date().getFullYear()} Aurea &mdash; Herbal Products. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: SMTP_FROM ?? SMTP_USER,
    to: params.to,
    subject: `Order Confirmed — #${params.orderNumber} | Aurea`,
    html,
  });

  console.log(`📧 Order confirmation email sent to ${params.to}`);
}
