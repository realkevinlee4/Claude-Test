# Email Notifications Setup Guide

Get beautiful HTML email reports delivered automatically to your inbox!

## 📧 What You'll Receive

### Overnight Summary (Daily at 9:00 AM EST)
Beautiful HTML email with:
- 📊 Executive summary with article counts
- 📰 Top 5 articles per category
- 🎨 Color-coded categories
- 🔗 Direct links to sources
- 📱 Mobile-responsive design

### Hourly Updates (Optional - 8 AM - 6 PM EST)
Quick email notifications with:
- ⚡ New articles from past hour
- 📑 Grouped by category
- 🔗 One-click access to articles
- 🎯 Compact, scannable format

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get an App Password

**For Gmail:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google Account
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Type: "Daily News Aggregator"
6. Click "Generate"
7. Copy the 16-character password

**For Outlook:**
1. Go to: https://account.microsoft.com/security
2. Click "Advanced security options"
3. Click "App passwords"
4. Create new app password
5. Copy the password

**For Yahoo:**
1. Go to: https://login.yahoo.com/account/security
2. Click "Generate app password"
3. Select "Other App"
4. Name it "Daily News Aggregator"
5. Copy the password

### Step 2: Configure .env

Edit `.env` file:

```env
# Enable email
EMAIL_ENABLED=true

# Add your email (can add multiple, comma-separated)
EMAIL_RECIPIENTS=your.email@gmail.com

# Choose which emails to receive
SEND_HOURLY_EMAILS=false         # Set to true for hourly updates
SEND_OVERNIGHT_EMAIL=true        # Daily morning summary

# SMTP Settings (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-char app password
```

### Step 3: Test It

```bash
# Rebuild after config changes
npm run build

# Test email configuration
npm start test-email your.email@gmail.com
```

You should receive a test email within a few seconds!

### Step 4: Start the Scheduler

```bash
npm start
```

Or with web interface:
```bash
npm start web
```

That's it! You'll receive:
- ✅ Daily summary at 9:00 AM EST
- ✅ (Optional) Hourly updates from 8 AM - 6 PM EST

## 📱 Email Providers Setup

### Gmail

**Settings:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password
```

**Important:**
- Must use App Password (not your regular password)
- Get it at: https://myaccount.google.com/apppasswords
- 2-Factor Authentication must be enabled

### Outlook/Hotmail

**Settings:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@outlook.com
SMTP_PASSWORD=your_app_password
```

**Important:**
- Use App Password from account security settings
- Works with @outlook.com, @hotmail.com, @live.com

### Yahoo Mail

**Settings:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@yahoo.com
SMTP_PASSWORD=your_app_password
```

**Important:**
- Must enable "Less secure app access"
- Or use App-specific password

### Custom SMTP Server

**Settings:**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.username
SMTP_PASSWORD=your_password
```

For SSL/TLS (port 465):
```env
SMTP_PORT=465
SMTP_SECURE=true
```

## 🎨 Email Preview

### Overnight Summary Email

```
┌─────────────────────────────────────────┐
│  📰 Daily News Summary                  │
│  Wednesday, January 22, 2026            │
├─────────────────────────────────────────┤
│                                         │
│  📊 Executive Summary                   │
│  Total Articles: 156                    │
│  Categories: 8                          │
│                                         │
├─────────────────────────────────────────┤
│  🤖 AI Projects and News (23)           │
│  ┌─────────────────────────────────┐  │
│  │ 1. Article Title Here           │  │
│  │ Description of article...       │  │
│  │ Source | Time | Author          │  │
│  └─────────────────────────────────┘  │
│                                         │
│  🏛️ US Congress Laws and Bills (18)    │
│  ┌─────────────────────────────────┐  │
│  │ 2. Another Article Title        │  │
│  │ Description...                  │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Hourly Update Email

```
┌─────────────────────────────────────────┐
│  ⚡ Hourly News Update                  │
│  2:00 PM EST • January 22, 2026         │
├─────────────────────────────────────────┤
│  15 new articles in the past hour       │
├─────────────────────────────────────────┤
│  🤖 AI Projects (3)                     │
│  • Article 1 [Source • 13:45]          │
│  • Article 2 [Source • 14:00]          │
│                                         │
│  🇺🇸 Trump Actions (2)                  │
│  • Article 3 [Source • 13:30]          │
└─────────────────────────────────────────┘
```

## ⚙️ Configuration Options

### Multiple Recipients

Add multiple emails:
```env
EMAIL_RECIPIENTS=email1@example.com,email2@example.com,email3@example.com
```

### Hourly vs Daily Only

**Option 1: Only Overnight Summaries (Recommended)**
```env
SEND_HOURLY_EMAILS=false
SEND_OVERNIGHT_EMAIL=true
```
- Less inbox clutter
- Comprehensive daily summary
- Best for most users

**Option 2: Hourly + Overnight**
```env
SEND_HOURLY_EMAILS=true
SEND_OVERNIGHT_EMAIL=true
```
- Stay updated throughout the day
- 11 hourly emails (8 AM - 6 PM)
- 1 overnight summary (9 AM)
- Total: 12 emails/day

**Option 3: Hourly Only**
```env
SEND_HOURLY_EMAILS=true
SEND_OVERNIGHT_EMAIL=false
```
- Real-time updates only
- No comprehensive summary

### Disable Emails

Temporarily disable without removing config:
```env
EMAIL_ENABLED=false
```

## 🧪 Testing

### Test Email Connection

```bash
npm start test-email your.email@example.com
```

Expected output:
```
✅ Email service initialized
✅ Test email sent to your.email@example.com
```

### Test Overnight Summary

Generate and send a test overnight summary:
```bash
npm start overnight
```

If EMAIL_ENABLED=true, you'll receive the actual overnight email.

### Test Hourly Update

```bash
npm start hourly
```

## 🐛 Troubleshooting

### "Email not configured"

**Cause**: Missing SMTP credentials

**Fix**:
```env
EMAIL_ENABLED=true
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password
```

### "Authentication failed"

**Causes**:
1. Using regular password instead of App Password
2. Incorrect username/password
3. 2FA not enabled (Gmail)

**Fix**:
1. Generate new App Password
2. Verify username is correct email address
3. Enable 2-Factor Authentication (Gmail)

### "Connection timeout"

**Causes**:
1. Firewall blocking SMTP port
2. Wrong SMTP host/port
3. Network issues

**Fix**:
1. Check firewall allows port 587
2. Verify SMTP_HOST is correct for your provider
3. Try alternative port (465 with SMTP_SECURE=true)

### "Self-signed certificate"

**Cause**: SSL certificate issue

**Fix**:
```env
# Add this if you trust the server
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Warning**: Only use for trusted servers!

### No emails received

**Checklist**:
1. ✅ Check spam/junk folder
2. ✅ Verify EMAIL_ENABLED=true
3. ✅ Verify email address is correct
4. ✅ Run test: `npm start test-email`
5. ✅ Check console logs for errors

### Emails go to spam

**Solutions**:
1. Add sender to contacts
2. Mark as "Not Spam"
3. Create inbox filter/rule
4. Use same email for sending and receiving

## 📊 Email Statistics

**Overnight Summary:**
- Average size: ~50-100 KB
- Load time: < 1 second
- Mobile-friendly: Yes
- Dark mode: Supported by email client

**Hourly Update:**
- Average size: ~10-20 KB
- Load time: < 0.5 seconds
- Compact format
- Quick to scan

## 🔐 Security Best Practices

### Do's ✅
- ✅ Use App Passwords (never regular passwords)
- ✅ Enable 2-Factor Authentication
- ✅ Keep .env file private (in .gitignore)
- ✅ Rotate passwords periodically
- ✅ Use strong, unique passwords

### Don'ts ❌
- ❌ Never commit passwords to Git
- ❌ Don't share .env file
- ❌ Don't use same password for multiple services
- ❌ Don't disable security features

## 🌐 Production Deployment

### Environment Variables

For production servers, use environment variables instead of .env:

```bash
export EMAIL_ENABLED=true
export EMAIL_RECIPIENTS=team@company.com
export SMTP_USER=noreply@company.com
export SMTP_PASSWORD=secret_password
export SMTP_HOST=smtp.company.com
```

### Docker

```dockerfile
ENV EMAIL_ENABLED=true
ENV EMAIL_RECIPIENTS=team@company.com
ENV SMTP_USER=${SMTP_USER}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
```

### Docker Compose

```yaml
services:
  news-aggregator:
    environment:
      - EMAIL_ENABLED=true
      - EMAIL_RECIPIENTS=team@company.com
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
```

### GitHub Actions

Add secrets in repository settings:

1. Go to Settings → Secrets → Actions
2. Add:
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `EMAIL_RECIPIENTS`

Update workflow:
```yaml
env:
  EMAIL_ENABLED: true
  SMTP_USER: ${{ secrets.SMTP_USER }}
  SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
  EMAIL_RECIPIENTS: ${{ secrets.EMAIL_RECIPIENTS }}
```

## 📧 Email Features

### Overnight Summary Features:
- ✨ Gradient header
- 📊 Executive summary card
- 🎨 Color-coded categories
- 🔗 Clickable article links
- 📱 Mobile-responsive
- 🎯 Top 5 articles per category
- 📈 Article counts
- 👤 Author attribution
- ⏰ Timestamp in EST
- 🔗 Link to web dashboard

### Hourly Update Features:
- ⚡ Quick, scannable format
- 🏷️ Category grouping
- 🔗 Direct article links
- 📰 Source attribution
- 🕐 Precise timestamps
- 🎨 Color coding
- 📱 Mobile-friendly
- 💨 Ultra-fast loading

## 🎯 Use Cases

### Personal Use
```env
EMAIL_RECIPIENTS=me@example.com
SEND_HOURLY_EMAILS=false
SEND_OVERNIGHT_EMAIL=true
```
Daily morning briefing in inbox

### Team Distribution
```env
EMAIL_RECIPIENTS=team@company.com,manager@company.com
SEND_HOURLY_EMAILS=false
SEND_OVERNIGHT_EMAIL=true
```
Share daily news with team

### High-Frequency Monitoring
```env
EMAIL_RECIPIENTS=analyst@company.com
SEND_HOURLY_EMAILS=true
SEND_OVERNIGHT_EMAIL=true
```
Stay updated throughout the day

### Newsletter Style
```env
EMAIL_RECIPIENTS=subscribers@company.com
SEND_HOURLY_EMAILS=false
SEND_OVERNIGHT_EMAIL=true
```
Send daily newsletter to subscribers

## 🔄 Integration with Other Services

### Zapier
Forward emails to Zapier for automation:
- Post to Slack
- Save to Google Sheets
- Create calendar events
- Trigger workflows

### IFTTT
Create applets triggered by emails:
- Send to iOS/Android app
- Post to social media
- Archive to cloud storage

### Email Filters
Create rules to:
- Auto-label emails
- Forward to team channels
- Archive after reading
- Star important updates

## ✨ Future Enhancements

Possible additions:
- 📊 Weekly digest emails
- 🎯 Custom email templates
- 📈 Trend analysis in emails
- 🔔 Breaking news alerts
- 📱 SMS notifications
- 💬 Slack integration
- 📞 Webhook support

## 🎉 Summary

You now have:
- ✅ Beautiful HTML email reports
- ✅ Automatic daily summaries
- ✅ Optional hourly updates
- ✅ Mobile-responsive design
- ✅ Color-coded categories
- ✅ Secure SMTP delivery

Enjoy your automated news inbox! 📰✉️

---

**Questions?**
- Check main README.md
- Review .env.example
- Test with: `npm start test-email`
