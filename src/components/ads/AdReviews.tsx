import React, { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Edit, Trash2, Send } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetAdReviewsQuery,
  useGetAdRatingQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} from "../../redux/api/adReviewsApi";
import { addNotification } from "../../redux/slices/uiSlice";

interface AdReviewsProps {
  adId: string;
}

const AdReviews: React.FC<AdReviewsProps> = ({ adId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: reviewsData, isLoading } = useGetAdReviewsQuery({
    adId,
    page,
    limit: 10,
  });
  const { data: ratingData } = useGetAdRatingQuery(adId);
  const [createReview, { isLoading: creating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const reviews = reviewsData?.data?.reviews || [];
  const totalReviews = reviewsData?.data?.total || 0;
  const averageRating = ratingData?.data?.average_rating || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please login to post a review",
        })
      );
      return;
    }

    if (!comment.trim()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please write a comment",
        })
      );
      return;
    }

    try {
      if (editingId) {
        await updateReview({
          id: editingId,
          rating: rating || undefined,
          comment: comment.trim(),
        }).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Review updated successfully",
          })
        );
        setEditingId(null);
      } else {
        await createReview({
          adId,
          rating: rating || undefined,
          comment: comment.trim(),
        }).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Review posted successfully",
          })
        );
      }

      setRating(0);
      setComment("");
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to post review",
        })
      );
    }
  };

  const handleEdit = (review: any) => {
    setEditingId(review.id);
    setRating(review.rating || 0);
    setComment(review.comment);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview(id).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Review deleted successfully",
        })
      );
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to delete review",
        })
      );
    }
  };

  const handleReaction = async (
    reviewId: number,
    type: "like" | "dislike",
    currentReaction: string | null
  ) => {
    if (!user) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please login to react",
        })
      );
      return;
    }

    try {
      if (currentReaction === type) {
        await removeReaction(reviewId).unwrap();
      } else {
        await addReaction({ id: reviewId, type }).unwrap();
      }
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error.data?.message || "Failed to update reaction",
        })
      );
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            <Star
              size={20}
              className={
                star <= count
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Reviews & Ratings
        </h2>

        {ratingData?.data && (
          <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {Number(averageRating)?.toFixed(1) ?? "0.0"}
              </div>
              {renderStars(Math.round(averageRating))}
              <div className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  ratingData.data[
                    `${["", "one", "two", "three", "four", "five"][star]}_star`
                  ] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {user && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-4 border border-gray-200 rounded-lg"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? "Edit Your Review" : "Write a Review"}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (Optional)
            </label>
            {renderStars(rating, true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your thoughts about this ad..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setRating(0);
                  setComment("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={creating || updating}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send size={18} />
              <span>{editingId ? "Update" : "Post"} Review</span>
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">Be the first to review this ad</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: any) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {review.user_avatar ? (
                    <img
                      src={review.user_avatar}
                      alt={review.user_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {user && user.id === review.user_id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {review.rating && (
                <div className="mb-2">{renderStars(review.rating)}</div>
              )}

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    handleReaction(review.id, "like", review.user_reaction)
                  }
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    review.user_reaction === "like"
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ThumbsUp size={18} />
                  <span className="text-sm">{review.likes_count || 0}</span>
                </button>
                <button
                  onClick={() =>
                    handleReaction(review.id, "dislike", review.user_reaction)
                  }
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    review.user_reaction === "dislike"
                      ? "bg-red-100 text-red-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ThumbsDown size={18} />
                  <span className="text-sm">{review.dislikes_count || 0}</span>
                </button>
              </div>
            </div>
          ))}

          {reviewsData?.data?.totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {reviewsData.data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= reviewsData.data.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdReviews;
