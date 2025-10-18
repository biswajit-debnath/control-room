# Control Room DG Operations SystemThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

A full-stack administrative dashboard application for managing DG (Diesel Generator) Operations data with role-based access control.## Getting Started

## 🚀 Tech StackFirst, run the development server:

- **Framework**: Next.js 15 (App Router)```bash

- **Database**: MongoDB with Prisma ORMnpm run dev

- **Authentication**: Custom session-based auth with bcryptjs# or

- **Styling**: Tailwind CSSyarn dev

- **Validation**: Zod# or

- **Forms**: React Hook Formpnpm dev

- **UI**: Custom components with Lucide icons# or

- **Notifications**: Sonner (toast notifications)bun dev

````

## 📋 Features

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Authentication**: Phone number + password based login (no public signup)

- **Role-Based Access**: You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

  - **TA**: Can create forms and view records

  - **EOD**: Can create forms, view records, and update digital signaturesThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

  - **AE**: Can create forms, view records, and update digital signatures

- **Multiple Entries Per Day**: Unlimited entries for same date/shift## Learn More

- **Two-Stage Digital Signatures**:

  1. Duty Staff Signature (auto-filled on submission)To learn more about Next.js, take a look at the following resources:

  2. EOD/AE Signature (can be added later by authorized users)

- **Activity Tracking**: Complete audit trail of all actions- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Comprehensive DG Operations Form**: All required fields for DG monitoring- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Advanced Filtering**: Filter records by date, date range, and shift

- **Responsive Design**: Works on desktop and mobile devicesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## 🛠️ Setup Instructions## Deploy on Vercel



### PrerequisitesThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



- Node.js 18+ installedCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- MongoDB database (Atlas or local)
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
npm install
````

### Step 2: Configure Environment Variables

The `.env` file should have your MongoDB connection string:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name"
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Seed the Database

Create initial test users:

```bash
npm run seed
```

This creates 3 test users:

- **AE User**: Phone: `9999999999`, Password: `password123`
- **EOD User**: Phone: `8888888888`, Password: `password123`
- **TA User**: Phone: `7777777777`, Password: `password123`

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### Login

1. Navigate to root `/` (redirects to login)
2. Enter phone number and password
3. Click "Login"

### Create DG Operation Entry

1. Navigate to "DG Operations" from dashboard
2. Fill in the form (Date and Shift are required)
3. Digital Signature auto-fills with your name
4. Click "Submit Entry"
5. Form resets for next entry

### View & Manage Records

1. Click "View All Records"
2. Use filters to search by date/shift
3. View details by clicking "View"
4. Sign entries (EOD/AE only) by clicking "Sign"

## 🗂️ Project Structure

```
controllroom-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── dg-operations/     # CRUD operations
│   │   ├── login/             # Authentication
│   │   └── session/           # Session management
│   ├── dashboard/             # Main dashboard
│   ├── dg-operations/         # DG operations module
│   │   ├── records/           # View records
│   │   └── page.tsx           # Entry form
│   └── login/                 # Login page
├── components/
│   ├── ui/                    # Reusable UI components
│   └── session-provider.tsx   # Session context
├── lib/
│   ├── prisma.ts             # Database client
│   ├── schemas.ts            # Validation schemas
│   └── utils.ts              # Helper functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── package.json
```

## 👥 Test Accounts

After running `npm run seed`:

| Role | Phone      | Password    | Permissions        |
| ---- | ---------- | ----------- | ------------------ |
| AE   | 9999999999 | password123 | Create, View, Sign |
| EOD  | 8888888888 | password123 | Create, View, Sign |
| TA   | 7777777777 | password123 | Create, View       |

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with test users
- `npx prisma studio` - Open database GUI

## 🎨 Features Implemented

✅ Phone-based authentication  
✅ Role-based access control (TA, EOD, AE)  
✅ Multiple entries per day support  
✅ Two-stage digital signatures  
✅ Comprehensive DG operations form  
✅ Records viewing with filters  
✅ Activity logging  
✅ Responsive design with Tailwind CSS  
✅ Toast notifications  
✅ Session management  
✅ Form validation with Zod  
✅ MongoDB integration with Prisma

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MongoDB connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Check database user permissions

### Build Errors

- Run `npm install` to install dependencies
- Run `npx prisma generate` to regenerate client
- Clear `.next` folder and rebuild

---

**Built for efficient DG Operations management**
