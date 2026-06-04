# CampusFind Lost & Found Portal

A full-stack lost and found portal for campus users. Students can report lost items, report found items, request returns, and complete handovers only after owner approval.

## Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO real-time notifications
- Nodemailer email verification

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Start MongoDB locally, or set `MONGO_URI` in `.env` to MongoDB Atlas.

Default local URI:

```text
mongodb://127.0.0.1:27017/campusfind
```

4. Start the full app:

```bash
npm run dev:full
```

Frontend:

```text
http://127.0.0.1:5173
```

Backend:

```text
http://127.0.0.1:5000
```

## Email Verification

Allowed email domains are configured in `.env`:

```text
ALLOWED_EMAIL_DOMAINS=gla.ac.in,glau.ac.in,student.gla.ac.in
```

If SMTP variables are blank, the backend prints the verification code in the terminal for local development. For real use, configure:

```text
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Core Rules Implemented

- Only verified college email users can log in.
- A lost item owner cannot mark their own item as found.
- A finder cannot claim their own found post.
- A finder can only request a return.
- The item is returned only when the owner/claimant approves.
- Rejected requests reopen the case.
- Expired posts and expired return requests are handled by the backend.
- Notifications are campus-wide or targeted to the approving user.

## Useful Scripts

```bash
npm run dev
npm run dev:server
npm run dev:full
npm run lint
npm run build
npm start
```
