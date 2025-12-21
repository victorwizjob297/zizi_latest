import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Clock,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetFavoritesQuery,
  useRemoveFromFavoritesMutation,
} from "../redux/api/adsApi";
import { useDispatch } from "react-redux";
import { addNotification } from "../redux/slices/uiSlice";

const Favorites = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // You can make this configurable if needed

  const {
    data: favoritesResponse,
    isLoading,
    isFetching,
  } = useGetFavoritesQuery({ page, limit });
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();

  const favorites = favoritesResponse?.data?.ads || [];
  const totalPages = favoritesResponse?.data?.totalPages || 1;
  const currentPage = favoritesResponse?.data?.page || 1;
  const totalItems = favoritesResponse?.data?.total || 0;

  const handleRemoveFromFavorites = async (adId) => {
    try {
      await removeFromFavorites(adId).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Removed from favorites",
        })
      );
      // If we're on the last page and removing the last item, go back a page
      if (favorites.length === 1 && currentPage > 1) {
        setPage(currentPage - 1);
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to remove from favorites",
        })
      );
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * limit, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === pageNum
                        ? "bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">Ads you've saved for later</p>
        </div>

        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link to={`/ads/${ad.id}`}>
                      <img
                        src={
                          ad.images?.[0] ||
                          "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg"
                        }
                        alt={ad.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFromFavorites(ad.id)}
                      className="absolute top-3 right-3 bg-white bg-opacity-90 text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/ads/${ad.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                        {ad.title}
                      </h3>
                    </Link>
                    <p className="text-green-600 font-bold text-lg mb-2">
                      ₦{ad.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>
                          Saved {new Date(ad.favorited_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        <span>{ad.views_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-4">
              Save ads you're interested in to see them here
            </p>
            <Link
              to="/search"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
            >
              <Search size={20} />
              <span>Browse Ads</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
