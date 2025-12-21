# Ad Reviews & Ratings System

## Overview
A comprehensive review and rating system has been added to your ads listing website. Users can now leave comments, ratings (1-5 stars), and react to reviews with likes/dislikes directly on ad detail pages.

## Features Implemented

### 1. Database Schema

#### New Tables:

**ad_reviews**
- Stores user reviews/comments for ads
- Fields:
  - `id` - Unique identifier
  - `ad_id` - Links to ads table
  - `user_id` - Review author
  - `rating` - Optional 1-5 star rating
  - `comment` - Review text (required)
  - `created_at` / `updated_at` - Timestamps

**ad_review_reactions**
- Stores likes/dislikes on reviews
- Fields:
  - `id` - Unique identifier
  - `review_id` - Links to ad_reviews
  - `user_id` - User who reacted
  - `reaction_type` - 'like' or 'dislike'
  - One reaction per user per review (unique constraint)

### 2. Backend Implementation

#### Model: AdReview.js
Location: `backend/models/AdReview.js`

Key Methods:
- `create()` - Post a new review
- `getByAd()` - Get all reviews for an ad (paginated)
- `findById()` - Get single review with stats
- `update()` - Edit review (owner only)
- `delete()` - Delete review (owner only)
- `addReaction()` - Like/dislike a review
- `removeReaction()` - Remove reaction
- `getAdRating()` - Get aggregate rating statistics
- `getUserReview()` - Check if user already reviewed
- `getReviewsByUser()` - Get all reviews by a user

#### Routes: adReviews.js
Location: `backend/routes/adReviews.js`

Endpoints:
- `GET /api/ad-reviews/ad/:adId` - Get reviews for ad (paginated)
- `GET /api/ad-reviews/ad/:adId/rating` - Get rating statistics
- `GET /api/ad-reviews/ad/:adId/my-review` - Get logged-in user's review
- `GET /api/ad-reviews/user/:userId` - Get user's reviews
- `GET /api/ad-reviews/:id` - Get single review
- `POST /api/ad-reviews/ad/:adId` - Create review (requires auth)
- `PUT /api/ad-reviews/:id` - Update review (owner only)
- `DELETE /api/ad-reviews/:id` - Delete review (owner only)
- `POST /api/ad-reviews/:id/react` - Add like/dislike (requires auth)
- `DELETE /api/ad-reviews/:id/react` - Remove reaction (requires auth)

### 3. Frontend Implementation

#### Redux API: adReviewsApi.js
Location: `src/redux/api/adReviewsApi.js`

RTK Query hooks:
- `useGetAdReviewsQuery` - Fetch reviews
- `useGetAdRatingQuery` - Fetch rating stats
- `useGetMyReviewQuery` - Check user's review
- `useGetUserReviewsQuery` - User's review history
- `useCreateReviewMutation` - Post review
- `useUpdateReviewMutation` - Edit review
- `useDeleteReviewMutation` - Delete review
- `useAddReactionMutation` - Like/dislike
- `useRemoveReactionMutation` - Remove reaction

#### Component: AdReviews.tsx
Location: `src/components/ads/AdReviews.tsx`

Features:
- Rating overview with star distribution chart
- Average rating display
- Review list with pagination
- Post/edit review form with optional star rating
- Like/dislike buttons with counts
- Edit/delete buttons for own reviews
- Real-time reaction updates
- User authentication checks

#### Updated: AdDetail.tsx
The ad detail page now includes the reviews section at the bottom, after similar ads.

### 4. Key Features

#### Rating System
- Optional 1-5 star ratings on reviews
- Aggregate rating calculation
- Star distribution visualization
- Average rating display

#### Comments
- Required text comment on all reviews
- Edit your own reviews
- Delete your own reviews
- Character limit enforced

#### Reactions
- Like or dislike any review
- Toggle reactions (click again to remove)
- Real-time counter updates
- One reaction per user per review
- Can change reaction type

#### User Experience
- Avatar display for reviewers
- Timestamps on reviews
- Author name visible
- Edit/delete only for own reviews
- Login prompts for unauthenticated users
- Pagination for large review lists

## API Usage Examples

### Post a Review
```javascript
POST /api/ad-reviews/ad/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "rating": 5,
  "comment": "Great product! Highly recommend."
}
```

### Get Reviews
```javascript
GET /api/ad-reviews/ad/123?page=1&limit=10
```

Response:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "ad_id": 123,
        "user_id": 45,
        "user_name": "John Doe",
        "user_avatar": "...",
        "rating": 5,
        "comment": "Great product!",
        "likes_count": 5,
        "dislikes_count": 1,
        "user_reaction": "like",
        "created_at": "2025-10-11T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Get Rating Statistics
```javascript
GET /api/ad-reviews/ad/123/rating
```

Response:
```json
{
  "success": true,
  "data": {
    "review_count": 25,
    "average_rating": 4.2,
    "five_star": 10,
    "four_star": 8,
    "three_star": 5,
    "two_star": 1,
    "one_star": 1
  }
}
```

### React to Review
```javascript
POST /api/ad-reviews/42/react
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "like"  // or "dislike"
}
```

## Usage Guide

### For Users

#### Posting a Review:
1. Navigate to any ad detail page
2. Scroll down to "Reviews & Ratings" section
3. Optionally select a star rating (1-5)
4. Write your comment
5. Click "Post Review"

#### Editing a Review:
1. Find your review in the list
2. Click the edit icon (pencil)
3. Modify rating and/or comment
4. Click "Update Review"

#### Reacting to Reviews:
1. Find any review
2. Click thumbs up (like) or thumbs down (dislike)
3. Click again to remove your reaction
4. Change reaction by clicking the other button

### For Developers

#### Display Reviews on Custom Pages:
```tsx
import AdReviews from '../components/ads/AdReviews';

function MyPage() {
  return (
    <div>
      <AdReviews adId="123" />
    </div>
  );
}
```

#### Get Rating Data Programmatically:
```tsx
const { data: ratingData } = useGetAdRatingQuery(adId);
const averageRating = ratingData?.data?.average_rating || 0;
const totalReviews = ratingData?.data?.review_count || 0;
```

## Database Indexes

Performance indexes created:
- `idx_ad_reviews_ad_id` - Fast review lookups by ad
- `idx_ad_reviews_user_id` - User's reviews
- `idx_ad_reviews_rating` - Filter by rating
- `idx_ad_reviews_created_at` - Sort by date
- `idx_ad_review_reactions_review_id` - Reaction counts
- `idx_ad_review_reactions_user_id` - User reactions

## Validation Rules

### Review Creation:
- Comment: Required, non-empty after trimming
- Rating: Optional, 1-5 if provided
- User must be authenticated
- One review per user per ad

### Review Updates:
- Can only update own reviews
- Same validation as creation
- Comment cannot be empty

### Reactions:
- Must be authenticated
- Type must be 'like' or 'dislike'
- One reaction per user per review
- Can change reaction type

## Security

### Authentication:
- Login required for posting/editing/deleting reviews
- Login required for reactions
- Review viewing is public

### Authorization:
- Users can only edit/delete their own reviews
- Reactions are tied to authenticated user
- Admin rights not required (user-generated content)

### Data Protection:
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in escaping
- CSRF protection via token authentication

## Differences from User Reviews

The existing `reviews` table (for user-to-user reviews) is separate from this new ad review system:

| Feature | User Reviews | Ad Reviews |
|---------|-------------|------------|
| Purpose | Review other users | Review ads/listings |
| Location | Profile pages | Ad detail pages |
| Required | Rating + Comment | Comment only (rating optional) |
| Visibility | User profiles | Ad pages |
| Table | `reviews` | `ad_reviews` |

Both systems coexist independently.

## Migration

To set up the new tables:

```bash
cd backend
npm run migrate
```

This will create:
- `ad_reviews` table
- `ad_review_reactions` table
- All necessary indexes
- Update triggers

## Testing

### Manual Testing:

1. **Create Review**:
   - Visit any ad detail page
   - Post a review with and without rating
   - Verify it appears in the list

2. **Edit Review**:
   - Find your review
   - Click edit button
   - Change content and save
   - Verify updates appear

3. **Delete Review**:
   - Click delete on your review
   - Confirm deletion
   - Verify it's removed

4. **Reactions**:
   - Like a review
   - Check counter increases
   - Unlike it
   - Check counter decreases
   - Switch to dislike

5. **Pagination**:
   - Post multiple reviews
   - Verify pagination works
   - Navigate pages

### API Testing:

```bash
# Post a review
curl -X POST http://localhost:5000/api/ad-reviews/ad/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "Excellent!"}'

# Get reviews
curl http://localhost:5000/api/ad-reviews/ad/1

# Get rating stats
curl http://localhost:5000/api/ad-reviews/ad/1/rating
```

## Troubleshooting

### Reviews not showing:
- Check if ad ID is correct
- Verify database connection
- Check browser console for errors

### Cannot post review:
- Ensure user is logged in
- Check if user already reviewed this ad
- Verify token is valid

### Reactions not working:
- Confirm user is authenticated
- Check network tab for API errors
- Verify review ID is correct

## Future Enhancements

Potential additions:
1. Review images/photos
2. Helpful/not helpful reactions
3. Reply threads on reviews
4. Report inappropriate reviews
5. Sort reviews (newest, highest rated, most helpful)
6. Filter by rating
7. Verified purchase badges
8. Review moderation queue
9. Email notifications for new reviews
10. Review summaries/highlights

## File Structure

```
backend/
├── models/
│   └── AdReview.js (NEW)
├── routes/
│   └── adReviews.js (NEW)
├── scripts/
│   └── migrate.js (MODIFIED)
└── server.js (MODIFIED)

src/
├── components/
│   └── ads/
│       └── AdReviews.tsx (NEW)
├── pages/
│   └── ads/
│       └── AdDetail.tsx (MODIFIED)
└── redux/
    ├── api/
    │   └── adReviewsApi.js (NEW)
    └── store.ts (MODIFIED)
```

## Conclusion

Your ads listing website now has a complete review and rating system for ads. Users can leave feedback, rate ads, and interact with other reviews through likes/dislikes. The system is fully integrated with your existing authentication and properly separated from the user-to-user review system.

The build completed successfully, and the feature is production-ready!
