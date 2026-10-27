# Nohradhar & Churdhar — Beyond the Clouds

A React + Express tourism website featuring the supplied mountain photos, visitor information, and an enquiry form.

## Run locally

1. Install Node.js (version 20.12 or newer).
2. Copy `.env.example` to `.env` and set a private password for `ADMIN_PASSWORD` (12+ characters).
3. In this folder, run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:5173.

The React app runs on Vite. Express serves the destination, visitor guide, and enquiry API on port 4001. Enquiries are saved on the server in `server/data/inquiries.jsonl`. Open `/admin` on the website and enter the admin password to view them. Keep the `.env` file private; set `ADMIN_PASSWORD` as an environment variable on the host if deploying.

To create a production build, run `npm run build`, then `npm start`.
# beautifulnohradhar
