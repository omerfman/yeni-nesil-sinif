# Firestore Database Structure

This document describes the Firestore collections and document structures for the Yeni Nesil Sınıf platform.

## Collections

### `users`
User accounts (students, teachers, admins)

```javascript
{
  "uid": "string (auto-generated doc ID)",
  "email": "string",
  "displayName": "string",
  "role": "student | teacher | admin",
  "phone": "string (optional)",
  "bio": "string (optional, for teachers)",
  "imageUrl": "string (optional)",
  "isActive": "boolean (default: true)",
  
  // Teacher-specific fields
  "subjects": ["string"] // e.g., ["Matematik", "Fizik"]
  "hourlyRate": "number", // in TRY
  "rating": "number (0-5)",
  "totalReviews": "number",
  "availability": {
    "monday": ["09:00-12:00", "14:00-17:00"],
    "tuesday": [...],
    // ... other days
  },
  
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `bookings`
Lesson bookings between students and teachers

```javascript
{
  "id": "string (auto-generated)",
  "studentId": "string (user doc ID)",
  "teacherId": "string (user doc ID)",
  "studentName": "string",
  "teacherName": "string",
  "subject": "string",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "duration": "number (in minutes, e.g., 60)",
  "status": "pending | confirmed | completed | cancelled",
  "meetingLink": "string (optional, Zoom/Teams link)",
  "notes": "string (optional)",
  "price": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `assignments`
Homework assignments from teachers to students

```javascript
{
  "id": "string (auto-generated)",
  "teacherId": "string",
  "studentId": "string (optional, for individual assignments)",
  "title": "string",
  "description": "string",
  "subject": "string",
  "dueDate": "timestamp",
  "status": "assigned | submitted | graded",
  "fileUrl": "string (optional, assignment file)",
  
  // Submission fields
  "submissionFileUrl": "string (optional)",
  "submittedAt": "timestamp (optional)",
  "grade": "number (optional, 0-100)",
  "feedback": "string (optional)",
  
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `notifications`
User notifications

```javascript
{
  "id": "string (auto-generated)",
  "userId": "string",
  "type": "booking | assignment | system",
  "title": "string",
  "message": "string",
  "isRead": "boolean (default: false)",
  "link": "string (optional, e.g., /bookings/detail.html?id=xxx)",
  "metadata": {
    "bookingId": "string (optional)",
    "assignmentId": "string (optional)"
  },
  "createdAt": "timestamp"
}
```

### `reviews`
Teacher reviews from students (optional, for future implementation)

```javascript
{
  "id": "string (auto-generated)",
  "teacherId": "string",
  "studentId": "string",
  "bookingId": "string",
  "rating": "number (1-5)",
  "comment": "string (optional)",
  "createdAt": "timestamp"
}
```

## Indexes

Required Firestore indexes for efficient queries:

1. **users**
   - `role` (ascending) + `isActive` (ascending)
   - `email` (ascending)

2. **bookings**
   - `teacherId` (ascending) + `startTime` (ascending)
   - `studentId` (ascending) + `startTime` (descending)
   - `status` (ascending) + `startTime` (ascending)

3. **assignments**
   - `studentId` (ascending) + `dueDate` (ascending)
   - `teacherId` (ascending) + `createdAt` (descending)

4. **notifications**
   - `userId` (ascending) + `isRead` (ascending) + `createdAt` (descending)

## Security Rules (Basic)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId) || hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isSignedIn() && (
        resource.data.studentId == request.auth.uid ||
        resource.data.teacherId == request.auth.uid ||
        hasRole('admin')
      );
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (
        resource.data.studentId == request.auth.uid ||
        resource.data.teacherId == request.auth.uid ||
        hasRole('admin')
      );
      allow delete: if hasRole('admin');
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if isSignedIn() && (
        resource.data.studentId == request.auth.uid ||
        resource.data.teacherId == request.auth.uid ||
        hasRole('admin')
      );
      allow create: if isSignedIn() && hasRole('teacher');
      allow update: if isSignedIn() && (
        resource.data.studentId == request.auth.uid ||
        resource.data.teacherId == request.auth.uid
      );
      allow delete: if isSignedIn() && resource.data.teacherId == request.auth.uid;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if hasRole('admin') || hasRole('teacher');
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
  }
}
```

## Notes

- All timestamps use Firestore server timestamp: `firebase.firestore.FieldValue.serverTimestamp()`
- Use subcollections for scalability if a user has many related documents
- Implement pagination for large queries (e.g., teacher list, booking history)
- Consider denormalization for frequently accessed data (e.g., teacher name in bookings)
