#!/bin/bash
set -e

echo "📧 Email (SMTP) Setup Guide"
echo "================================"
echo ""
echo "Choose a provider:"
echo "1. Resend (recommended, 100 emails/day free)"
echo "2. SendGrid"
echo "3. Mailgun"
echo "4. Custom SMTP"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "Resend Setup:"
    echo "1. Sign up at: https://resend.com"
    echo "2. Get your API key"
    echo "3. Verify your domain (or use onboarding domain for testing)"
    echo ""
    EMAIL_SERVER_HOST="smtp.resend.com"
    EMAIL_SERVER_PORT="587"
    EMAIL_SERVER_USER="resend"
    read -sp "Enter your Resend API key: " EMAIL_SERVER_PASSWORD
    echo ""
    read -p "Enter your FROM email [onboarding@resend.dev]: " EMAIL_FROM
    EMAIL_FROM=${EMAIL_FROM:-onboarding@resend.dev}
    ;;
  2)
    echo ""
    echo "SendGrid Setup:"
    echo "1. Sign up at: https://sendgrid.com"
    echo "2. Create an API key"
    echo "3. Verify sender identity"
    echo ""
    EMAIL_SERVER_HOST="smtp.sendgrid.net"
    EMAIL_SERVER_PORT="587"
    EMAIL_SERVER_USER="apikey"
    read -sp "Enter your SendGrid API key: " EMAIL_SERVER_PASSWORD
    echo ""
    read -p "Enter your FROM email: " EMAIL_FROM
    ;;
  3)
    echo ""
    echo "Mailgun Setup:"
    echo "1. Sign up at: https://mailgun.com"
    echo "2. Add and verify your domain"
    echo "3. Get SMTP credentials"
    echo ""
    read -p "Enter Mailgun SMTP host [smtp.mailgun.org]: " EMAIL_SERVER_HOST
    EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST:-smtp.mailgun.org}
    EMAIL_SERVER_PORT="587"
    read -p "Enter your Mailgun SMTP username: " EMAIL_SERVER_USER
    read -sp "Enter your Mailgun SMTP password: " EMAIL_SERVER_PASSWORD
    echo ""
    read -p "Enter your FROM email: " EMAIL_FROM
    ;;
  4)
    echo ""
    echo "Custom SMTP Setup:"
    read -p "Enter SMTP host: " EMAIL_SERVER_HOST
    read -p "Enter SMTP port [587]: " EMAIL_SERVER_PORT
    EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT:-587}
    read -p "Enter SMTP username: " EMAIL_SERVER_USER
    read -sp "Enter SMTP password: " EMAIL_SERVER_PASSWORD
    echo ""
    read -p "Enter your FROM email: " EMAIL_FROM
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

if [ -z "$EMAIL_SERVER_HOST" ] || [ -z "$EMAIL_SERVER_USER" ] || [ -z "$EMAIL_SERVER_PASSWORD" ] || [ -z "$EMAIL_FROM" ]; then
  echo "❌ All fields are required"
  exit 1
fi

# Add to .env.local
ENV_FILE="apps/web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  cp apps/web/.env.example "$ENV_FILE"
fi

sed -i.bak "s|^EMAIL_SERVER_HOST=.*|EMAIL_SERVER_HOST=$EMAIL_SERVER_HOST|" "$ENV_FILE"
sed -i.bak "s|^EMAIL_SERVER_PORT=.*|EMAIL_SERVER_PORT=$EMAIL_SERVER_PORT|" "$ENV_FILE"
sed -i.bak "s|^EMAIL_SERVER_USER=.*|EMAIL_SERVER_USER=$EMAIL_SERVER_USER|" "$ENV_FILE"
sed -i.bak "s|^EMAIL_SERVER_PASSWORD=.*|EMAIL_SERVER_PASSWORD=$EMAIL_SERVER_PASSWORD|" "$ENV_FILE"
sed -i.bak "s|^EMAIL_FROM=.*|EMAIL_FROM=$EMAIL_FROM|" "$ENV_FILE"

echo ""
echo "✅ Email configuration saved to $ENV_FILE"
