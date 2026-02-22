# Admin Wallpaper Panel

A full-featured Next.js 14 admin panel for managing multiple wallpaper apps with Firebase and Cloudinary integration.

## Features

- Multi-app support (switch between different wallpaper apps e.g., Lumio, Bhim)
- Firebase Authentication (email/password) with admin role verification
- Complete wallpaper CRUD operations
- Category management with drag-to-reorder
- Cloudinary upload widget for images, GIFs, and videos
- Auto-generate color palettes from images
- User management and statistics
- Dashboard with analytics

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.local.example` to `.env.local` and fill in your Firebase Admin SDK credentials:
```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Configure apps in Settings:
- Navigate to Settings page after login
- Add your app configurations (Firebase + Cloudinary)
- Save settings

4. Run development server:
```bash
npm run dev
```

## Firestore Structure

```
# Root level collections
admin_users/{userId}                    # Admin users (separate from app users)
  ├── email: string
  ├── createdAt: string
  └── (document existence = admin access)

# Project-specific collections
projects/{projectId}/
  ├── wallpapers/{wallpaperId}
  │   ├── title: string
  │   ├── categoryIds: string[]
  │   ├── thumbnail_url: string
  │   ├── full_url: string
  │   ├── color_palette: string[]
  │   ├── isActive: boolean
  │   ├── downloads: number
  │   ├── likes: number
  │   ├── views: number
  │   ├── createdAt: string
  │   ├── tags: string[]
  │   └── info: string
  │
  ├── categories/{categoryId}
  │   ├── name: string
  │   ├── thumbnail: string
  │   ├── order: number
  │   ├── isActive: boolean
  │   ├── isVirtual: boolean
  │   └── createdAt: string
  │
  └── users/{userId}                    # App users (for wallpaper app)
      ├── email: string
      ├── createdAt: string
      └── favorites: string[]
```

## Admin User Setup

To create an admin user:
1. Create a user in Firebase Authentication
2. Add a document in `admin_users` collection (root level, not inside projects):
   ```javascript
   admin_users/{uid}/
   {
     email: "admin@example.com",
     createdAt: "2024-01-01T00:00:00Z"
   }
   ```
3. Use that email/password to login to the admin panel

## Technologies

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS + ShadCN UI
- Firebase (Auth + Firestore)
- Cloudinary
- Zustand (State Management)
- React Hook Form + Zod
