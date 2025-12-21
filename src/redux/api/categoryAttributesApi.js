import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseurl } from './constant';

export const categoryAttributesApi = createApi({
  reducerPath: 'categoryAttributesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseurl}/api/category-attributes`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['CategoryAttribute'],
  endpoints: (builder) => ({
    getCategoryAttributes: builder.query({
      query: (categoryId) => `/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: 'CategoryAttribute', id: `CATEGORY-${categoryId}` },
      ],
    }),
    getSearchableAttributes: builder.query({
      query: (categoryId) => `/category/${categoryId}/searchable`,
      providesTags: (result, error, categoryId) => [
        { type: 'CategoryAttribute', id: `SEARCHABLE-${categoryId}` },
      ],
    }),
    getCategoryAttribute: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'CategoryAttribute', id }],
    }),
    createCategoryAttribute: builder.mutation({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { category_id }) => [
        { type: 'CategoryAttribute', id: `CATEGORY-${category_id}` },
      ],
    }),
    bulkCreateCategoryAttributes: builder.mutation({
      query: (data) => ({
        url: '/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { category_id }) => [
        { type: 'CategoryAttribute', id: `CATEGORY-${category_id}` },
      ],
    }),
    updateCategoryAttribute: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CategoryAttribute', id },
        { type: 'CategoryAttribute', id: 'LIST' },
      ],
    }),
    updateAttributeOrder: builder.mutation({
      query: (attributeIds) => ({
        url: '/order/update',
        method: 'PUT',
        body: { attributeIds },
      }),
      invalidatesTags: [{ type: 'CategoryAttribute', id: 'LIST' }],
    }),
    deleteCategoryAttribute: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CategoryAttribute', id },
        { type: 'CategoryAttribute', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCategoryAttributesQuery,
  useGetSearchableAttributesQuery,
  useGetCategoryAttributeQuery,
  useCreateCategoryAttributeMutation,
  useBulkCreateCategoryAttributesMutation,
  useUpdateCategoryAttributeMutation,
  useUpdateAttributeOrderMutation,
  useDeleteCategoryAttributeMutation,
} = categoryAttributesApi;
