# Simple Interview

## Setup

```bash
docker compose up --build
```

## Account Setup

Register an admin account using the `/admin-signup` route.

## Emails

Emails are sent using Resend.

To send emails, you need to set the `RESEND_API_KEY` environment variable in the `.env` file.
If you don't have a Resend account, you can leave the `RESEND_API_KEY=re_123` and the emails will be logged to the console.
Removing the `RESEND_API_KEY` environment variable will throw an error.
