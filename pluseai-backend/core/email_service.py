import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "PulseAI")
OWNER_EMAIL = os.getenv("OWNER_EMAIL", MAIL_USERNAME)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))


def _send_email(to_email: str, subject: str, html_body: str, reply_to: str = None):
    """Core SMTP email sender. Raises on failure."""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print("[EmailService] MAIL_USERNAME / MAIL_PASSWORD not configured — skipping email.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to_email, msg.as_string())

    print(f"[EmailService] Email sent to {to_email}: {subject}")


# ──────────────────────────────────────────────────
# 1. Welcome email after registration
# ──────────────────────────────────────────────────
def send_welcome_email(to_email: str, username: str):
    subject = "Welcome to PulseAI 🎉"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0d0d0f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                 style="background:linear-gradient(135deg,#16161a,#1a1a22);border-radius:16px;
                        border:1px solid #2a2a3f;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:-0.5px;">
                  ● PulseAI
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                  Intelligence Platform
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#fff;margin:0 0 16px;font-size:22px;">
                  Welcome aboard, {username}! 👋
                </h2>
                <p style="color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
                  Your account has been created successfully. You now have access to
                  AI-powered social media sentiment analysis across Twitter, Reddit,
                  YouTube, NewsAPI, and more.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                  <tr>
                    <td style="background:#1e1e2e;border-radius:10px;padding:16px 20px;border-left:4px solid #3b82f6;">
                      <p style="margin:0;color:#a1a1aa;font-size:13px;">Registered as</p>
                      <p style="margin:4px 0 0;color:#fff;font-weight:600;font-size:15px;">{username}</p>
                    </td>
                  </tr>
                </table>
                <p style="color:#a1a1aa;line-height:1.7;margin:0 0 32px;">
                  Start exploring by searching for any brand, product, or topic to get
                  real-time sentiment insights powered by BERT.
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;padding:0;">
                      <a href="{FRONTEND_URL}/analyze"
                         style="display:inline-block;padding:14px 32px;color:#fff;
                                text-decoration:none;font-weight:600;font-size:15px;
                                border-radius:8px;">
                        Start Analyzing →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:24px 40px;border-top:1px solid #2a2a3f;text-align:center;">
                <p style="color:#52525b;font-size:12px;margin:0;">
                  © 2025 PulseAI · You received this because you registered an account.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    try:
        _send_email(to_email, subject, html)
    except Exception as e:
        print(f"[EmailService] Failed to send welcome email: {e}")


# ──────────────────────────────────────────────────
# 2. Password reset email
# ──────────────────────────────────────────────────
def send_password_reset_email(to_email: str, token: str, username: str):
    reset_link = f"{FRONTEND_URL}/auth?action=reset&token={token}"
    subject = "Reset Your PulseAI Password"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0d0d0f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                 style="background:linear-gradient(135deg,#16161a,#1a1a22);border-radius:16px;
                        border:1px solid #2a2a3f;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:-0.5px;">
                  ● PulseAI
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                  Password Reset Request
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#fff;margin:0 0 16px;font-size:22px;">
                  Reset your password, {username}
                </h2>
                <p style="color:#a1a1aa;line-height:1.7;margin:0 0 24px;">
                  We received a request to reset the password for your PulseAI account.
                  Click the button below to set a new password. This link will expire in
                  <strong style="color:#fff;">1 hour</strong>.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;padding:0;">
                      <a href="{reset_link}"
                         style="display:inline-block;padding:14px 32px;color:#fff;
                                text-decoration:none;font-weight:600;font-size:15px;
                                border-radius:8px;">
                        Reset Password →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="color:#a1a1aa;line-height:1.7;margin:0 0 8px;font-size:13px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="background:#1e1e2e;border-radius:8px;padding:12px 16px;
                          color:#3b82f6;font-size:12px;word-break:break-all;margin:0 0 24px;">
                  {reset_link}
                </p>
                <p style="color:#52525b;font-size:13px;margin:0;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email.
                  Your password will not be changed.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:24px 40px;border-top:1px solid #2a2a3f;text-align:center;">
                <p style="color:#52525b;font-size:12px;margin:0;">
                  © 2025 PulseAI · This link expires in 1 hour.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    try:
        _send_email(to_email, subject, html)
    except Exception as e:
        print(f"[EmailService] Failed to send reset email: {e}")


# ──────────────────────────────────────────────────
# 3. Contact form notification to site owner
# ──────────────────────────────────────────────────
def send_contact_notification(name: str, email: str, phone_no: str, subject: str, message: str):
    email_subject = f"[PulseAI Contact] {subject}"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0d0d0f;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                 style="background:linear-gradient(135deg,#16161a,#1a1a22);border-radius:16px;
                        border:1px solid #2a2a3f;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:36px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:-0.5px;">
                  ● PulseAI
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                  New Contact Form Submission
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#fff;margin:0 0 24px;font-size:20px;">
                  📬 You have a new message
                </h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background:#1e1e2e;border-radius:10px;padding:20px;border-left:4px solid #10b981;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:6px 0;">
                            <span style="color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Name</span><br>
                            <span style="color:#fff;font-size:15px;font-weight:600;">{name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;">
                            <span style="color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br>
                            <a href="mailto:{email}" style="color:#3b82f6;font-size:15px;text-decoration:none;">{email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;">
                            <span style="color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Phone</span><br>
                            <span style="color:#fff;font-size:15px;">{phone_no}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;">
                            <span style="color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Subject</span><br>
                            <span style="color:#fff;font-size:15px;font-weight:600;">{subject}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <h3 style="color:#a1a1aa;font-size:13px;text-transform:uppercase;
                            letter-spacing:0.5px;margin:0 0 12px;">Message</h3>
                <div style="background:#1e1e2e;border-radius:10px;padding:20px;
                            color:#e4e4e7;line-height:1.7;font-size:15px;
                            border-left:4px solid #3b82f6;white-space:pre-wrap;">
{message}
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:24px 40px;border-top:1px solid #2a2a3f;text-align:center;">
                <p style="color:#52525b;font-size:12px;margin:0;">
                  © 2025 PulseAI · Sent from the Contact Form
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    try:
        _send_email(OWNER_EMAIL, email_subject, html, reply_to=email)
    except Exception as e:
        print(f"[EmailService] Failed to send contact notification: {e}")
