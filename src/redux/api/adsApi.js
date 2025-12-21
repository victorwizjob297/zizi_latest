import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseurl } from "./constant";

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseurl}/api/ads`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const adsApi = createApi({
  reducerPath: "adsApi",
  baseQuery,
  tagTypes: ["Ad", "Favorite"],
  endpoints: (builder) => ({
    getAds: builder.query({
      query: (params) => ({
        url: "",
        params,
      }),
      providesTags: ["Ad"],
    }),
    getMyAds: builder.query({
      query: (params) => ({
        url: "/my/ads",
        params,
      }),
      providesTags: ["Ad"],
    }),
    getFeaturedAds: builder.query({
      query: () => "/featured",
      providesTags: ["Ad"],
    }),
    getAd: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Ad", id }],
    }),
    createAd: builder.mutation({
      query: (adData) => ({
        url: "",
        method: "POST",
        body: adData,
      }),
      invalidatesTags: ["Ad"],
    }),
    updateAd: builder.mutation({
      query: ({ id, ...adData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: adData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Ad", id }],
    }),
    deleteAd: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ad"],
    }),
    bumpAd: builder.mutation({
      query: (id) => ({
        url: `/${id}/bump`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Ad", id }],
    }),
    featureAd: builder.mutation({
      query: (id) => ({
        url: `/${id}/feature`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Ad", id }],
    }),
    markUrgent: builder.mutation({
      query: (id) => ({
        url: `/${id}/urgent`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Ad", id }],
    }),
    searchAds: builder.query({
      query: (searchParams) => ({
        url: "/search",
        params: searchParams,
      }),
      providesTags: ["Ad"],
    }),
    getUserAds: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Ad"],
    }),
    getFavorites: builder.query({
      query: (params) => ({
        url: "../users/favorites",
        params,
      }),
      providesTags: ["Favorite"],
    }),
    addToFavorites: builder.mutation({
      query: (adId) => ({
        url: `../users/favorites/${adId}`,
        method: "POST",
      }),
      invalidatesTags: ["Favorite", "Ad"],
    }),
    removeFromFavorites: builder.mutation({
      query: (adId) => ({
        url: `../users/favorites/${adId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorite", "Ad"],
    }),
    reportAd: builder.mutation({
      query: ({ adId, reason }) => ({
        url: `/${adId}/report`,
        method: "POST",
        body: { reason },
      }),
    }),
  }),
});

export const {
  useGetAdsQuery,
  useGetMyAdsQuery,
  useGetFeaturedAdsQuery,
  useGetAdQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useBumpAdMutation,
  useFeatureAdMutation,
  useMarkUrgentMutation,
  useSearchAdsQuery,
  useGetUserAdsQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetFavoritesQuery,
  useReportAdMutation,
} = adsApi;
