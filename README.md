# ReachInbox Email Scheduler – Frontend

Frontend for the ReachInbox Email Scheduler application, built with **Next.js (App Router)** and deployed on **Vercel**.

## 🌐 Live URL

https://task-brown-gamma.vercel.app/

## 🎥 Demo Video

https://drive.google.com/file/d/1R84QJ8EQ8uVA1SPu6TxYnsSF9KoeRf2s/view?usp=drivesdk
---

## 🧰 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- Lucide Icons

---

## ✨ Features

- Google OAuth login
- JWT-based authentication
- Dashboard with Scheduled / Sent emails
- Email scheduling UI
- Search & filter emails
- Attachment preview
- Real-time status updates

---

## ⚙️ Environment Variables

Create a `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_API_URL=https://task-backend-9w9u.onrender.com
```

---

## 🛠 Local Development

```bash
git clone https://github.com/BismarckSVBP/task
cd client
npm install
npm run dev
```

Open:  
👉 http://localhost:3000

---

## 🔗 Backend Integration

This frontend connects to the backend API deployed on Render:

👉 https://task-backend-9w9u.onrender.com

---

## 🚀 Deployment

- Platform: **Vercel**
- Auto-deployed from GitHub
- Environment variables configured in Vercel Dashboard

---

## 📌 Notes

- Auth success redirect: `/auth/success`
- Dashboard route: `/dashboard`
- Uses client-side rendering where required
- Fully compatible with backend rate limiting & queue system

---

## 👤 Author

**Abhay Kumar**  
GitHub: https://github.com/BismarckSVBP
