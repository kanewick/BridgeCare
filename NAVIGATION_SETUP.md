# BridgeCare Navigation Setup

## Required Dependencies

Make sure you have these packages installed:

```bash
npm install react-native-reanimated react-native-safe-area-context expo-haptics
```

## Features Implemented

### ✅ **Premium Tab Navigation**

- **5 Tabs**: Dashboard, Residents, Quick Log (FAB), Profile, Settings
- **Smooth Animations**: Scale/bounce effects on tab selection
- **Professional Design**: Clean, rounded corners, subtle shadows
- **Dark Mode Support**: Automatic theme switching

### ✅ **Floating Action Button (FAB)**

- **Perfectly Integrated**: Sits naturally on the navigation bar
- **Interactive**: Rotates 45° when active, scale animation on press
- **Haptic Feedback**: Medium impact on press
- **Prominent Design**: 64px circular button with shadow

### ✅ **Enhanced UX/UI**

- **Animated Icons**: Scale up when selected with spring animation
- **Background Highlights**: Soft colored background for active tabs
- **Smooth Transitions**: Spring-based animations throughout
- **Accessibility**: Proper roles, labels, and touch targets (56px min)

### ✅ **Visual Design**

- **Color Scheme**: Professional blue theme with proper contrast
- **Typography**: Clear labels with weight changes for active states
- **Spacing**: Consistent 20px border radius, proper padding
- **Shadows**: Platform-specific shadows (iOS/Android)

## File Structure

```
src/
├── components/
│   ├── navigation/
│   │   ├── CustomTabBar.tsx      # Premium custom tab bar with FAB
│   │   └── TabBarIcon.tsx        # Animated icon component
│   └── Header.tsx                # Professional header component
├── hooks/
│   └── useTabBarHeight.ts        # Tab bar height utilities
├── navigation/
│   ├── AppNavigator.tsx          # Main navigation router with stack support
│   ├── StaffTabNavigator.tsx     # Staff tab navigator setup
│   └── FamilyTabNavigator.tsx    # Family tab navigator setup
└── screens/
    ├── staff/                   # Staff/carer-specific screens
    │   ├── StaffDashboardScreen.tsx
    │   ├── StaffQuickLogScreen.tsx
    │   ├── StaffResidentsScreen.tsx
    │   ├── StaffProfileScreen.tsx
    │   └── StaffResidentDetailScreen.tsx
    ├── family/                  # Family-specific screens
    │   ├── FamilyHomeScreen.tsx
    │   ├── FamilyResidentProfileScreen.tsx
    │   ├── FamilyMessagesScreen.tsx
    │   ├── FamilyMediaScreen.tsx
    │   └── FamilyMoreScreen.tsx
    └── shared/                  # Shared across roles
        └── SettingsScreen.tsx
```

## Usage

### Staff Navigation

The navigation is automatically used for staff role users. The tab order is:

1. **Dashboard** (Home icon)
2. **Residents** (Users icon)
3. **Quick Log** (Plus icon - FAB in center)
4. **Profile** (User icon)
5. **Settings** (Gear icon)

### Family Navigation

For family users, the tab order is:

1. **Home** (Home icon) - Daily updates and feed
2. **Resident** (User icon) - Resident profile and health info
3. **Messages** (Chat icon - FAB in center) - Secure messaging with care team
4. **Media** (Images icon) - Photos and videos
5. **More** (Dots icon) - Settings and support

## Navigation Features

### Stack Navigation Support

- **Staff users**: Can navigate to `ResidentDetail` modal screens from the `ResidentsScreen`
- **Family users**: Self-contained navigation within their tab structure
- **Type safety**: Full TypeScript support with defined param lists

### Route Mapping

- Icons are automatically mapped based on route names
- FAB detection: `QuickLog` for staff, `Messages` for family
- Consistent styling across all navigation contexts

## Screen Content Padding

All screens should account for the tab bar height to prevent content overlap. Use the provided hook:

```tsx
import { useTabBarHeight } from "../hooks/useTabBarHeight";

const MyScreen = () => {
  const { tabBarHeightWithSafeArea } = useTabBarHeight();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: tabBarHeightWithSafeArea + 20,
      }}
    >
      {/* Your content */}
    </ScrollView>
  );
};
```

## Customization

### Colors

Edit the `COLORS` constant in `CustomTabBar.tsx`:

- `primary`: Main accent color
- `background`: Tab bar background
- `text/textMuted`: Label colors

### Animation Timing

Adjust spring animations in the `withSpring` calls:

- `damping`: Controls bounce (higher = less bounce)
- `stiffness`: Controls speed (higher = faster)

### FAB Size

Change `FAB_SIZE` constant for different button sizes.
