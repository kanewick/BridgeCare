# KinLoop MVP App

A React Native + Expo application for managing resident activities and family communication in care facilities.

## Features

### Staff Role (Quick Log)
- **Resident Selection**: Pick from available residents with fallback data
- **Activity Logging**: Toggle chips for Meal, Activity, Meds, Rest, and Photo
- **Note Input**: Optional text notes for activities
- **Photo Capture**: Camera integration with presigned upload support
- **Form Validation**: Ensures required fields are completed

### Family Role (Feed)
- **Resident Selection**: Choose family member to view
- **Activity Feed**: Display activities as rounded cards
- **Rich Content**: Shows type, timestamp, notes, tags, and photos
- **Interactive Elements**: Like and comment buttons (stubbed for MVP)
- **Pull-to-Refresh**: Update feed data

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Query (TanStack Query)
- **Form Validation**: Zod schemas
- **Styling**: Modern neutral design with consistent theming
- **Image Handling**: Expo Image Picker with presigned uploads

## Project Structure

```
src/
├── api/                 # API services and client
│   ├── client.ts       # Base HTTP client
│   ├── residents.ts    # Resident API endpoints
│   ├── feed.ts         # Feed API endpoints
│   └── uploads.ts      # Upload presigned URLs
├── components/         # Reusable UI components
│   ├── Card.tsx        # Rounded card container
│   ├── Badge.tsx       # Status indicators
│   └── TagButton.tsx   # Toggleable selection chips
├── hooks/              # Custom React hooks
│   └── useAuthRole.ts  # Role-based navigation
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx # Stack navigator with role switching
├── screens/            # App screens
│   ├── StaffQuickLogScreen.tsx  # Staff activity logging
│   └── FamilyFeedScreen.tsx     # Family activity feed
├── state/              # State management
│   └── queryClient.ts  # React Query configuration
├── types/              # TypeScript types and schemas
│   └── models.ts       # Zod schemas and type definitions
├── theme.ts            # Design system and theming
└── index.ts            # Main exports
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## API Endpoints

### Residents
- `GET /residents` - List all residents
- `GET /residents/:id` - Get resident details

### Feed
- `GET /residents/:id/feed` - Get feed items for a resident
- `POST /feed` - Create a new feed item

### Uploads
- `POST /uploads/presign` - Get presigned URL for file upload

## Design System

### Colors
- **Primary**: `#0ea5e9` (Blue)
- **Neutral**: Slate gray scale
- **Semantic**: Success, warning, error, info

### Typography
- **H1**: 32px, Bold
- **H2**: 24px, Semibold
- **H3**: 20px, Semibold
- **Body**: 16px, Regular
- **Caption**: 12px, Regular

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## Development Notes

### MVP Constraints
- No authentication system
- No push notifications
- No messaging functionality
- Simple role switching for testing

### Fallback Data
- Sample residents and feed items for development
- API fallbacks when endpoints are unavailable

### Testing
- Role switcher in header for easy testing
- Fallback data for offline development

## Future Enhancements

- User authentication and role management
- Push notifications for new activities
- Real-time messaging between staff and family
- Advanced filtering and search
- Activity analytics and reporting
- Photo gallery and sharing
- Offline support with sync

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Implement proper error handling
4. Add Zod validation for new data models
5. Follow the established design system
6. Test on both iOS and Android

## License

This project is proprietary software for KinLoop.
