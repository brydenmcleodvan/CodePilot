# Healthmap Analytics Implementation

## Overview
Comprehensive usage tracking system implemented across all platform modules with centralized logging to `/api/analytics` endpoint.

## Backend Implementation

### Analytics Endpoint
- **Route**: `POST /api/analytics`
- **Location**: `server/routes.ts`
- **Functionality**: 
  - Validates event data
  - Creates logs directory if needed
  - Appends timestamped events to `logs/usage.log`
  - Returns success confirmation

### Log File Format
```
2025-06-22T16:24:41.349Z - Event: telehealth_session_booked
2025-06-22T16:24:41.372Z - Event: forum_post_viewed
2025-06-22T16:24:41.387Z - Event: goal_completed
```

## Frontend Implementation

### Analytics Utility
- **Location**: `client/src/lib/analytics.ts`
- **Features**:
  - Centralized `trackEvent()` function
  - Predefined event constants in `ANALYTICS_EVENTS`
  - Error handling for failed requests
  - Convenience functions for common tracking patterns

### Tracked Events Across Modules

#### Telehealth Module
- **Location**: `client/src/pages/health-coach.tsx`
- **Events**:
  - `telehealth_session_booked` - When appointment is successfully booked
  - `telehealth_provider_viewed` - When viewing provider details
  - **Implementation**: Added to `bookAppointment` mutation success handler

#### Forum Module  
- **Location**: `client/src/components/forum-post.tsx`
- **Events**:
  - `forum_post_liked` - When upvoting/downvoting posts
  - `forum_post_viewed` - When viewing post details
  - `forum_post_saved` - When saving posts to favorites
  - **Implementation**: Added to vote handling and post interaction functions

#### Dashboard Module
- **Location**: `client/src/pages/dashboard.tsx`
- **Events**:
  - `dashboard_viewed` - Page visit tracking
  - `goal_completed` - When user completes health goals
  - `health_metric_logged` - When logging health data
  - **Implementation**: Added to useEffect hooks and goal completion handlers

#### Marketplace Module
- **Location**: `client/src/pages/marketplace.tsx`
- **Events**:
  - `marketplace_visited` - Page visit tracking
  - `product_added_to_cart` - When adding products to cart
  - `product_viewed` - When viewing product details
  - **Implementation**: Added to page load and purchase handlers

#### Profile Module
- **Location**: `client/src/pages/profile.tsx`
- **Events**:
  - `profile_viewed` - Page visit tracking
  - `profile_tab_changed` - When switching between profile tabs
  - `health_data_connected` - When connecting external health services
  - **Implementation**: Added to page load and tab change handlers

#### Insurance Module
- **Events**: `insurance_tab_opened` - When accessing insurance information
- **Implementation**: Tracked across insurance-related components

## Testing Infrastructure

### Analytics Test Suite
- **Location**: `tests/analytics.test.ts`
- **Coverage**:
  - Event logging functionality
  - Log file creation and directory handling
  - Timestamp format validation
  - Error handling for missing events
  - Complex event name support
  - Metadata handling capabilities

### Test Results
```
✓ should log analytics events successfully
✓ should create log file and directory if they dont exist  
✓ should append events to log file with timestamps
✓ should return 400 when event is missing
✓ should handle complex event names
✓ should log events with metadata
```

## Event Categories

### User Engagement
- Page views and navigation
- Feature usage patterns
- Module access frequency

### Health Actions
- Goal setting and completion
- Health data logging
- Medication tracking

### Service Interactions
- Telehealth bookings
- Forum participation
- Marketplace activity

### System Events
- Authentication actions
- Profile updates
- Data connections

## Usage Examples

### Frontend Tracking
```typescript
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

// Simple event tracking
trackEvent(ANALYTICS_EVENTS.DASHBOARD_VIEWED);

// Event with metadata
trackEvent(ANALYTICS_EVENTS.TELEHEALTH_SESSION_BOOKED, {
  sessionId: "session-123",
  appointmentTime: "Today 2:00 PM",
  providerId: "dr-johnson"
});
```

### Backend API Call
```bash
curl -X POST http://localhost:5000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"event": "goal_completed"}'
```

## Future Enhancement Options

### LogRocket Integration
Replace file logging with LogRocket for advanced analytics:
```typescript
// Future implementation
import LogRocket from 'logrocket';

export const trackEvent = (event: string, metadata?: any) => {
  LogRocket.track(event, metadata);
};
```

### Sentry Integration  
Add error tracking and performance monitoring:
```typescript
import * as Sentry from "@sentry/browser";

export const trackEvent = (event: string, metadata?: any) => {
  Sentry.addBreadcrumb({
    message: event,
    data: metadata,
    category: 'user-action'
  });
};
```

## Implementation Status
- ✅ Analytics endpoint implemented and tested
- ✅ Frontend tracking utility created
- ✅ Telehealth booking tracking active
- ✅ Forum interaction tracking active  
- ✅ Dashboard goal completion tracking active
- ✅ Insurance tab access tracking active
- ✅ Marketplace activity tracking active
- ✅ Comprehensive test suite created
- ✅ Log file system working correctly
- ✅ Error handling implemented

## Log File Location
- **Path**: `logs/usage.log`
- **Format**: Timestamped events with ISO date format
- **Rotation**: Manual (can be enhanced with log rotation in production)

The analytics system is fully operational and tracking user interactions across all major platform modules.