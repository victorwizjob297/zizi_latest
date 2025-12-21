import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Calendar,
  Star,
  User,
  MessageCircle,
  Grid,
  List,
  Filter,
  ArrowLeft,
  Package,
  Clock,
  Shield,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useGetUserQuery, useGetUserAdsQuery } from "../redux/api/usersApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
} from "../redux/api/followsApi";
import { useSelector } from "react-redux";

const SellerShop = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Get current user from Redux state
  const currentUser = useSelector((state) => state.auth.user);
  const isOwnProfile = currentUser?.id?.toString() === userId;

  // User queries
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserQuery(userId);
  const {
    data: adsData,
    isLoading: adsLoading,
    error: adsError,
  } = useGetUserAdsQuery({
    userId,
    page,
    limit: 20,
    status: filter === "all" ? undefined : filter,
  });

  // Follow queries
  const { data: followStatusData, refetch: refetchFollowStatus } =
    useGetFollowStatusQuery(userId, { skip: isOwnProfile || !currentUser });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] =
    useUnfollowUserMutation();

  const isLoading = userLoading || adsLoading;
  const error = userError || adsError;
  const seller = userData?.data?.user;
  const ads = adsData?.data?.ads || [];

  const followData = followStatusData?.data || {};
  const isFollowingUser = followData.is_following || false;
  const followersCount = followData.followers_count || 0;
  const followingCount = followData.following_count || 0;

  const filteredAds = ads;

  // Handle follow action
  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowingUser) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
      // Refetch the follow status to update UI
      refetchFollowStatus();
    } catch (error) {
      console.error("Follow action failed:", error);
      // You might want to show a toast notification here
    }
  };

  // Navigate to followers/following lists
  const navigateToFollowers = () => {
    navigate(`/user/${userId}/followers`);
  };

  const navigateToFollowing = () => {
    navigate(`/user/${userId}/following`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seller Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The seller you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeAdsCount = ads.filter((ad) => ad.status === "active").length;
  const soldAdsCount = ads.filter((ad) => ad.status === "sold").length;
  const memberSince = new Date(seller.created_at).getFullYear();
  const averageRating = seller.average_rating || 0;
  const reviewsCount = seller.review_count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-green-600" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {seller.name}
                  </h1>
                  {seller.is_verified && (
                    <Shield className="text-green-600" size={24} />
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Member since {memberSince}
                  </div>
                  {seller.location && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {seller.location}
                    </div>
                  )}
                </div>

                {averageRating > 0 && (
                  <div className="flex items-center mt-2">
                    <Star
                      size={16}
                      className="text-green-500 fill-current mr-1"
                    />
                    <span className="font-medium text-gray-900">
                      {Number(averageRating)?.toFixed(1)}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({reviewsCount} reviews)
                    </span>
                  </div>
                )}

                {/* Follow stats */}
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={navigateToFollowers}
                    className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Users size={14} className="mr-1" />
                    <span className="font-medium">{followersCount}</span>
                    <span className="ml-1">followers</span>
                  </button>
                  <button
                    onClick={navigateToFollowing}
                    className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <span className="font-medium">{followingCount}</span>
                    <span className="ml-1">following</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowing || isUnfollowing || !currentUser}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isFollowingUser
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowing || isUnfollowing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Processing...</span>
                    </>
                  ) : isFollowingUser ? (
                    <>
                      <UserCheck size={20} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}

              <Link
                to={`/chat?user=${seller.id}`}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>Contact Seller</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-green-600 mb-2">
                <Package size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {activeAdsCount}
              </p>
              <p className="text-sm text-gray-600">Active Listings</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <Shield size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{soldAdsCount}</p>
              <p className="text-sm text-gray-600">Sold Items</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-green-600 mb-2">
                <Star size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {averageRating > 0 ? Number(averageRating)?.toFixed(1) : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Listings ({filteredAds.length})
          </h2>

          <div className="flex items-center space-x-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Ads Grid/List */}
        {filteredAds.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAds.map((ad) => (
              <Link
                key={ad.id}
                to={`/ads/${ad.id}`}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <img
                  src={
                    ad.images?.[0]?.url ||
                    "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg"
                  }
                  alt={ad.title}
                  className={
                    viewMode === "grid"
                      ? "w-full h-48 object-cover"
                      : "w-48 h-48 object-cover"
                  }
                />
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {ad.title}
                    </h3>
                    {ad.status === "sold" && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Sold
                      </span>
                    )}
                  </div>
                  <p className="text-green-600 font-bold text-lg mb-2">
                    ₦{ad.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      <span>{ad.location || ad.district}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {new Date(ad.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "This seller has no listings yet."
                : `This seller has no ${filter} listings.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerShop;
