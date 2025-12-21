import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseurl } from "./constant";

export const adReviewsApi = createApi({
  reducerPath: "adReviewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseurl}/api/ad-reviews`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AdReview", "UserReviews"],
  endpoints: (builder) => ({
    // Existing endpoints...
    getAdReviews: builder.query({
      query: ({ adId, page = 1, limit = 10 }) =>
        `/ad/${adId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { adId }) => [
        { type: "AdReview", id: `AD-${adId}` },
      ],
    }),
    getAdRating: builder.query({
      query: (adId) => `/ad/${adId}/rating`,
      providesTags: (result, error, adId) => [
        { type: "AdReview", id: `RATING-${adId}` },
      ],
    }),
    getMyReview: builder.query({
      query: (adId) => `/ad/${adId}/my-review`,
      providesTags: (result, error, adId) => [
        { type: "AdReview", id: `MY-${adId}` },
      ],
    }),
    getUserReviews: builder.query({
      query: ({ userId, page = 1, limit = 10 }) =>
        `/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { userId }) => [
        { type: "AdReview", id: `USER-${userId}` },
      ],
    }),
    getReview: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "AdReview", id }],
    }),

    // NEW ENDPOINTS FOR USER REVIEWS
    getReceivedReviews: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/received/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "UserReviews", id: `RECEIVED-${userId}` },
      ],
    }),

    getGivenReviews: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/given/${userId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "UserReviews", id: `GIVEN-${userId}` },
      ],
    }),

    getUserReviewStats: builder.query({
      query: (userId) => `/stats/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "UserReviews", id: `STATS-${userId}` },
      ],
    }),

    getMyReceivedReviews: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/my/received`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: "UserReviews", id: "MY-RECEIVED" },
      ],
    }),

    getMyGivenReviews: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/my/given`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: "UserReviews", id: "MY-GIVEN" },
      ],
    }),

    getMyReviewStats: builder.query({
      query: () => `/my/stats`,
      providesTags: [{ type: "UserReviews", id: "MY-STATS" }],
    }),

    // Mutations...
    createReview: builder.mutation({
      query: ({ adId, ...body }) => ({
        url: `/ad/${adId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { adId }) => [
        { type: "AdReview", id: `AD-${adId}` },
        { type: "AdReview", id: `RATING-${adId}` },
        { type: "AdReview", id: `MY-${adId}` },
        { type: "UserReviews", id: "MY-GIVEN" },
        { type: "UserReviews", id: `GIVEN-${result?.user_id}` },
        { type: "UserReviews", id: `STATS-${result?.ad_owner_id}` },
        { type: "UserReviews", id: "MY-STATS" },
      ],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdReview", id },
        { type: "AdReview", id: "LIST" },
        { type: "UserReviews", id: "MY-GIVEN" },
      ],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AdReview", id },
        { type: "AdReview", id: "LIST" },
        { type: "UserReviews", id: "MY-GIVEN" },
      ],
    }),

    addReaction: builder.mutation({
      query: ({ id, type }) => ({
        url: `/${id}/react`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "AdReview", id }],
    }),

    removeReaction: builder.mutation({
      query: (id) => ({
        url: `/${id}/react`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "AdReview", id }],
    }),
  }),
});

export const {
  useGetAdReviewsQuery,
  useGetAdRatingQuery,
  useGetMyReviewQuery,
  useGetUserReviewsQuery,
  useGetReviewQuery,
  useGetReceivedReviewsQuery,
  useGetGivenReviewsQuery,
  useGetUserReviewStatsQuery,
  useGetMyReceivedReviewsQuery,
  useGetMyGivenReviewsQuery,
  useGetMyReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
} = adReviewsApi;
