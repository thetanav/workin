# Joinin Feature Roadmap

## 🚀 Core Experience
- [ ] **Smart Status Expiry**: Automatically check out users after a set duration (e.g., 4 hours) or when they move significantly far from the check-in location.
- [ ] **"Focus Mode" Toggle**: Allow users to check in but mark themselves as "Do Not Disturb" (red ring on map avatar).
- [ ] **Future Check-ins**: "I'll be working at [Coffee Shop] tomorrow morning."
- [ ] **Guest/Anonymous Mode**: View map (limited info) without signing in.

## 👋 Social Interactions
- [ ] **"Wave" Interaction**: A low-friction way to say "Hi, I'm nearby" (sends a toast/notification) without a full chat.
- [ ] **User Follow/Friend System**: See specifically where your friends are working.
- [ ] **Activity Feed**: A text-based feed of recent check-ins ("Alice checked in at Blue Bottle", "Bob is focusing at WeWork").
- [ ] **Direct Messaging**: Simple ephemeral chat when both users are checked in nearby.

## 🏢 Venues & Discovery
- [ ] **Venue Ratings**: Rate locations based on "Wifi Speed", "Coffee Quality", "Noise Level", and "Outlet Availability".
- [ ] **Space Directory**: detailed pages for popular coworking spots with aggregated user stats ("3 builders here now").
- [ ] **City Leaderboards**: "Top active builders in San Francisco this week".

## 🛠 Technical & Infrastructure
- [ ] **PWA Support**: Installable on mobile devices with offline map caching.
- [ ] **Push Notifications**: Web Push for "Wave" alerts and "Friend nearby" notifications.
- [ ] **Geo-fencing**: Client-side validation to ensure users are actually at the location they claim (optional strict mode).
- [ ] **Privacy Zones**: Ability to fuzz location for home offices.

## 📚 Completed
- [x] Basic Auth (Clerk)
- [x] Map Integration (MapLibre)
- [x] Real-time Check-ins (Convex)