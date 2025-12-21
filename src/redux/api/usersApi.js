import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseurl } from "./constant";

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseurl}/api/users`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery,
  tagTypes: ["User", "UserAds"],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    getUserAds: builder.query({
      query: ({ userId, page = 1, limit = 20, status = "active" }) =>
        `/${userId}/ads?page=${page}&limit=${limit}&status=${status}`,
      providesTags: (result, error, { userId }) => [
        { type: "UserAds", id: userId },
      ],
    }),
    getUserStats: builder.query({
      query: (userId) => `/${userId}/stats`,
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/avatar",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { 
  useGetUserQuery, 
  useGetUserAdsQuery, 
  useGetUserStatsQuery,
  useUpdateAvatarMutation 
} = usersApi;
