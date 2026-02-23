### Required environment variables (production)

- **Frontend → Backend API base URL**
  - `NEXT_PUBLIC_API_BASE_URL=https://speaking-practice.ddns.net`

- **NextAuth (your Next.js domain)**
  - `NEXTAUTH_URL=https://speaking-practice.ddns.net`
  - `NEXTAUTH_SECRET=<long random string>`

- **OAuth providers**
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
  - `GITHUB_CLIENT_ID=...`
  - `GITHUB_CLIENT_SECRET=...`

### OAuth redirect URLs you must allow

- **Google**
  - `https://speaking-practice.ddns.net/api/auth/callback/google`

- **GitHub**
  - `https://speaking-practice.ddns.net/api/auth/callback/github`

