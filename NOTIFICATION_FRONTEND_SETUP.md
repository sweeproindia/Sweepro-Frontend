# 🔔 Notification System - Frontend Setup Guide

## ✅ What's Been Created

### 1. **Services**
- `src/services/websocketService.ts` - WebSocket connection management with auto-reconnect
- `src/services/notificationService.ts` - REST API integration for notifications

### 2. **Context**
- `src/contexts/NotificationContext.tsx` - Global state management with React Context

### 3. **Components**
- `src/components/notifications/NotificationBell.tsx` - Header bell icon with dropdown (Updated)
- `src/pages/NotificationsPage.tsx` - Full notifications page

---

## 🚀 Integration Steps

### Step 1: Install Dependencies

```bash
npm install sonner
# or
yarn add sonner
```

**Sonner** is used for toast notifications. If you prefer a different toast library, update the Context file.

---

### Step 2: Wrap App with NotificationProvider

Update your `src/App.tsx` or `src/main.tsx`:

```tsx
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <NotificationProvider>
      <Toaster position="top-right" />
      {/* Your existing app routes */}
      <YourRoutes />
    </NotificationProvider>
  );
}
```

---

### Step 3: Add Notification Bell to Header

Update your header/navbar component:

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const Header = () => {
  return (
    <header>
      {/* Your existing header content */}
      <NotificationBell />
    </header>
  );
};
```

---

### Step 4: Add Notifications Route

Add the notifications page to your router:

```tsx
import NotificationsPage from '@/pages/NotificationsPage';

// In your routes configuration
{
  path: '/notifications',
  element: <NotificationsPage />
}
```

---

### Step 5: Configure API Base URL

Update the API base URL in `src/services/notificationService.ts` if needed:

```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL
```

Also update WebSocket URL in `src/services/websocketService.ts`:

```typescript
constructor(url: string = 'ws://localhost:3000') {
  this.url = url;
}
```

---

## 🎯 Usage Examples

### Using the Notification Hook

```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

---

## 🔧 Features

### ✅ Real-time Notifications
- WebSocket connection with auto-reconnect
- Instant notification delivery
- Connection status indicator

### ✅ Notification Management
- Mark as read/unread
- Delete notifications
- Clear all read notifications
- Mark all as read

### ✅ UI Components
- Bell icon with unread badge
- Dropdown with recent notifications
- Full notifications page with tabs
- Toast notifications for new messages

### ✅ Filters & Tabs
- All notifications
- Unread only
- Read only

---

## 🎨 Customization

### Change Notification Sound

Add a notification sound file to `public/notification-sound.mp3` or update the path in `NotificationContext.tsx`:

```typescript
const audio = new Audio('/your-sound-file.mp3');
```

### Customize Toast Appearance

Update toast configuration in `NotificationContext.tsx`:

```typescript
toast.info(notification.title, {
  description: notification.message,
  duration: 5000,
  // Add more options
});
```

### Add Custom Notification Icons

Update `getNotificationIcon` function in components to add more icon types:

```typescript
const getNotificationIcon = (type: string) => {
  if (type === 'YOUR_TYPE') return <YourIcon className="h-4 w-4 text-color" />;
  // ...
};
```

---

## 🧪 Testing

### Test WebSocket Connection

1. Start your backend server
2. Login to the app
3. Check browser console for: `✅ WebSocket connected`
4. Look for the green WiFi icon in the notification bell

### Test Real-time Notifications

Use Postman to send a test notification:

```http
POST http://localhost:3000/api/notifications/admin/test
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "userId": "USER_ID",
  "type": "SYSTEM_ALERT",
  "title": "Test Notification",
  "message": "This is a test notification",
  "data": {
    "test": true
  }
}
```

You should see:
- Toast notification appear
- Bell badge increment
- Notification in dropdown

---

## 🐛 Troubleshooting

### WebSocket Not Connecting

1. **Check backend is running**: `http://localhost:3000/health`
2. **Verify token**: Check `localStorage.getItem('token')`
3. **Check console**: Look for WebSocket errors
4. **CORS issues**: Ensure backend allows WebSocket connections

### Notifications Not Appearing

1. **Check API response**: Open Network tab, check `/api/notifications`
2. **Verify token**: Ensure valid JWT token in localStorage
3. **Check context**: Ensure `NotificationProvider` wraps your app

### Toast Not Showing

1. **Install sonner**: `npm install sonner`
2. **Add Toaster**: `<Toaster />` component in App
3. **Check imports**: Verify `import { toast } from 'sonner'`

---

## 📊 API Endpoints Used

```
GET    /api/notifications              - Get all notifications
GET    /api/notifications/unread       - Get unread notifications
GET    /api/notifications/unread/count - Get unread count
PATCH  /api/notifications/:id/read     - Mark as read
PATCH  /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
DELETE /api/notifications/bulk/clear-read - Clear read notifications
```

---

## 🎉 You're All Set!

Your notification system is now fully integrated with:
- ✅ Real-time WebSocket updates
- ✅ REST API integration
- ✅ Beautiful UI components
- ✅ Global state management
- ✅ Toast notifications

**Next Steps:**
1. Customize notification icons and colors
2. Add notification preferences
3. Implement notification filtering by type
4. Add notification settings page

---

## 📚 Additional Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [React Context](https://react.dev/reference/react/useContext)

---

**Need Help?** Check the backend documentation: `NOTIFICATION_SYSTEM_IMPLEMENTATION.md`
