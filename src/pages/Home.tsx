import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetFeaturedAdsQuery, useGetAdsQuery } from "../redux/api/adsApi";
import { useGetCategoriesQuery } from "../redux/api/categoriesApi";
import Pagination from "../components/common/Pagination";
import LocationSelector from "../components/common/LocationSelector";
import { isUserLongTimeMember, getUserTenureYears } from "../utils/user";
import {
  MapPin,
  Clock,
  ChevronRight,
  Search, // Used for the category arrow
  Award,
} from "lucide-react";

/**
 * Ad Card Component
 * A reusable component for rendering a single ad item.
 */
const AdCard = ({ ad }) => {
  const isLongTimeUser = isUserLongTimeMember(ad.user?.created_at);
  const isNotFree = ad.subscription_type && ad.subscription_type !== "free";

  return (
    <Link
      to={`/ads/${ad.id}`}
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={
            ad.images?.[0]?.url ||
            "https://via.placeholder.com/300x200?text=No+Image" // Placeholder for ad image
          }
          alt={ad.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {ad.is_urgent && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              Urgent
            </span>
          )}
          {isNotFree && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
              {ad.subscription_type}
            </span>
          )}
          {isLongTimeUser && (
            <span
              className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
              title="Trusted seller - on platform for 1+ years"
            >
              <Award size={12} />
              Trusted
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {ad.title}
        </h3>
        <p className="text-green-600 font-bold text-lg mb-2">
          ₦{ad.price?.toLocaleString() || "N/A"}
        </p>
        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          <span>{ad.location || "Unknown"}</span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock size={14} className="mr-1" />
          <span>
            {ad.created_at
              ? new Date(ad.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </Link>
  );
};

/**
 * Category Item Component with Hover Submenu
 */
const CategoryItem = ({
  category,
}: {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    ad_count?: number;
    subcategories?: Array<{
      id: string;
      name: string;
      slug: string;
      ad_count?: number;
    }>;
  };
}) => {
  const hasSubcategories =
    category.subcategories && category.subcategories.length > 0;

  return (
    <div className="relative group">
      <Link
        to={`/search?category_id=${category.id}`}
        className="flex justify-between items-center px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors cursor-pointer"
        data-testid={`link-category-${category.slug}`}
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 flex items-center justify-center text-xl">
            <span>{category.icon}</span>
          </div>
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{Number(category.ad_count || 0).toLocaleString()} ads</span>
          {hasSubcategories && (
            <ChevronRight size={16} className="ml-1 text-gray-400" />
          )}
        </div>
      </Link>

      {hasSubcategories && (
        <div className="absolute left-full top-0 ml-1 w-64 bg-white border border-gray-200 shadow-xl z-20 invisible group-hover:visible transition-opacity duration-150">
          <div className="p-2">
            <h4 className="px-2 py-1 text-sm font-semibold text-gray-900">
              {category.name} Subcategories
            </h4>
            <div className="w-full h-px bg-gray-200 mb-2"></div>
            <ul>
              {category.subcategories?.map((sub) => (
                <li key={sub.id}>
                  <Link
                    to={`/search?category_id=${category.id}&subcategory_id=${sub.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100 transition-colors"
                    data-testid={`link-subcategory-${sub.slug}`}
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Home Page Component
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [recentPage, setRecentPage] = useState(1);
  const [recentLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Use the actual hooks, and use mock data for listings if they are loading or empty
  const { data: featuredAdsResponse, isLoading: loadingFeatured } =
    useGetFeaturedAdsQuery({
      limit: 4,
    });
  const { data: recentAdsResponse, isLoading: loadingRecent } = useGetAdsQuery({
    limit: recentLimit,
    page: recentPage,
    province: selectedProvince,
    district: selectedDistrict,
  });
  const { data: categoriesResponse, isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchTerm);
      if (selectedProvince) params.set("province", selectedProvince);
      if (selectedDistrict) params.set("district", selectedDistrict);
      navigate(`/search?${params.toString()}`);
    }
  };
  const featuredAds = featuredAdsResponse?.data || [
    {
      id: 1,
      title: "Featured Apple MacBook Pro 2023 M2 Chip",
      price: 1200000,
      location: "Lagos",
      images: [],
      is_urgent: true,
    },
    {
      id: 2,
      title: "Brand New Samsung Galaxy S23 Ultra",
      price: 750000,
      location: "Abuja",
      images: [],
      is_urgent: false,
    },
    {
      id: 3,
      title: "German Shepherd Puppies for Sale",
      price: 150000,
      location: "Port Harcourt",
      images: [],
      is_urgent: false,
    },
    {
      id: 4,
      title: "High-Efficiency Solar Panel 350W",
      price: 85000,
      location: "Kano",
      images: [],
      is_urgent: true,
    },
  ];
  const recentAds = recentAdsResponse?.data?.ads || [];
  const totalRecentAds = recentAdsResponse?.data?.total || 0;
  const totalRecentPages = Math.ceil(totalRecentAds / recentLimit) || 1;
  // Assuming the categories are in categoriesResponse.data (matching your JSON structure)
  const categories = categoriesResponse?.data || [];

  const AdCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header Section */}
      <header className="bg-green-700 py-12 rounded-b-[50px]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            What are you looking for?
          </h1>

          <div className="max-w-4xl mx-auto">
            {/* Location Selector with inline layout for HomePage */}
            <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
              <LocationSelector
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                onProvinceChange={setSelectedProvince}
                onDistrictChange={setSelectedDistrict}
                layout="inline"
                showLabels={true}
                compact={false}
                className="mb-0"
              />
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content: Categories Sidebar and Listings Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Categories Sidebar (Left Column) */}
          {/* Categories Sidebar (Left Column) */}
          <aside className="w-full max-w-xs pr-6 hidden lg:block relative z-30">
            {/* Added 'relative z-30' here */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-4">
              <h2 className="px-4 py-3 text-lg font-bold text-gray-900 border-b border-gray-100">
                All Categories
              </h2>
              {/* ... rest of your sidebar code ... */}
              {loadingCategories ? (
                <div className="p-4 space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-5 bg-gray-200 rounded w-full animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <nav className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </nav>
              )}

              <div className="px-4 py-2 text-center">
                <Link
                  to="/categories"
                  className="text-sm text-green-600 hover:underline"
                >
                  View More Categories
                </Link>
              </div>
            </div>
          </aside>

          {/* Listings Area (Right Column) */}
          <main className="flex-1 min-w-0">
            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pt-10">
              {" "}
              {/* Added pt-10 to make room for overlapping images */}
              {/* Apply for Job Card */}
              <Link
                to="/apply"
                className="relative z-10 flex flex-col items-start justify-end p-6 h-36 bg-[#ECF9EE] border border-[#D1EAD7] rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img
                    src="/job.png"
                    alt="Apply for Job"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-[#2D3F43]">
                  Apply for job
                </span>
              </Link>
              {/* How to Sell Card */}
              <Link
                to="/sell"
                className="relative flex flex-col items-start justify-end p-6 h-36 bg-[#ECF9EE] border border-[#D1EAD7] rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center transition-transform group-hover:scale-105">
                  {/* Replace with your 3D Cash Image */}
                  <img
                    src="/coins.png"
                    alt="Apply for Job"
                    className="w-full h-full object-contain"
                  />{" "}
                </div>
                <span className="text-2xl font-bold text-[#2D3F43]">
                  How to sell
                </span>
              </Link>
              {/* How to Buy Card */}
              <Link
                to="/buy"
                className="relative flex flex-col items-start justify-end p-6 h-36 bg-[#F0EEFF] border border-[#D9D6F5] rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center transition-transform group-hover:scale-105">
                  {/* Replace with your 3D Basket Image */}
                  <img
                    src="/basket.png"
                    alt="Apply for Job"
                    className="w-full h-full object-contain"
                  />{" "}
                </div>
                <span className="text-2xl font-bold text-[#2D3F43]">
                  How to buy
                </span>
              </Link>
            </div>

            {/* Recommended for you */}
            {/* Recommended for you Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D3F43] mb-6">
                Recommended for you
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Laptops & Computers",
                    src: "https://i.rtings.com/assets/pages/IxCXzynA/best-apple-laptops-20241009-medium.jpg?format=auto",
                  },
                  {
                    label: "Mobile Phones",
                    src: "https://m-cdn.phonearena.com/images/article/102312-wide-two_1200/The-best-Android-phones-in-2025.jpg",
                  },
                  {
                    label: "Electrical Equipment",
                    src: "https://img.freepik.com/free-photo/electrical-panel-with-fuses-contactors-closeup_169016-53777.jpg?semt=ais_hybrid&w=740&q=80",
                  },
                  {
                    label: "Dogs & Puppies",
                    src: "https://i.rtings.com/assets/pages/IxCXzynA/best-apple-laptops-20241009-medium.jpg?format=auto",
                  },
                ].map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="aspect-square w-full bg-[#F5F7F9] rounded-2xl overflow-hidden border border-gray-100 mb-3 flex items-center justify-center p-2">
                      <img
                        className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                        src={item.src}
                        alt={item.label}
                      />
                    </div>
                    <p className="text-sm font-semibold text-[#2D3F43] text-center group-hover:text-green-600 transition-colors">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Ads Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Featured Listings
                </h2>
                <Link
                  to="/search?featured=true"
                  className="text-green-600 font-semibold hover:text-green-700 text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadingFeatured
                  ? [...Array(4)].map((_, i) => <AdCardSkeleton key={i} />)
                  : featuredAds
                      .slice(0, 4)
                      .map((ad) => <AdCard key={ad.id} ad={ad} />)}
              </div>
            </div>

            {/* Recent Ads Section (Trending Ads) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Ads
                </h2>
                <Link
                  to="/search"
                  className="text-green-600 font-semibold hover:text-green-700 text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadingRecent
                  ? [...Array(12)].map((_, i) => <AdCardSkeleton key={i} />)
                  : recentAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
              </div>
              {totalRecentPages > 1 && (
                <Pagination
                  currentPage={recentPage}
                  totalPages={totalRecentPages}
                  totalItems={totalRecentAds}
                  itemsPerPage={recentLimit}
                  onPageChange={setRecentPage}
                />
              )}
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
