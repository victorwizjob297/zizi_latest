import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetAdsQuery } from "../redux/api/adsApi";
import { useGetCategoriesQuery } from "../redux/api/categoriesApi";
import { useSaveSearchMutation } from "../redux/api/savedSearchesApi";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Clock,
  Heart,
  Star,
  Grid2x2 as Grid,
  List,
  Bookmark,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { addNotification } from "../redux/slices/uiSlice";
import FilterSidebar from "../components/common/FilterSidebar";

interface Filters {
  q: string;
  category_id: string;
  subcategory_id: string;
  province: string;
  district: string;
  location: string;
  min_price: string;
  max_price: string;
  condition: string;
  sort_by: string;
  page: number;
  attributes: Record<string, string>;
}

const parseFiltersFromParams = (
  searchParams: URLSearchParams,
  categoriesData: Array<{ id: string; slug: string; subcategories?: Array<{ id: string; slug: string }> }>
): Filters => {
  const parseAttributesFromParams = (): Record<string, string> => {
    const attrs: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        attrs[key.replace("attr_", "")] = value;
      }
    });
    return attrs;
  };

  const getCategoryIdFromSlug = (slug: string): string => {
    if (!slug) return "";
    const category = categoriesData.find((c) => c.slug === slug);
    return category?.id || slug;
  };

  const getSubcategoryIdFromSlug = (categorySlug: string, subSlug: string): string => {
    if (!subSlug) return "";
    const category = categoriesData.find((c) => c.slug === categorySlug);
    if (category?.subcategories) {
      const sub = category.subcategories.find((s) => s.slug === subSlug);
      return sub?.id || subSlug;
    }
    return subSlug;
  };

  const categorySlug = searchParams.get("category") || "";
  const subSlug = searchParams.get("sub") || "";

  return {
    q: searchParams.get("q") || "",
    category_id: searchParams.get("category_id") || getCategoryIdFromSlug(categorySlug),
    subcategory_id: searchParams.get("subcategory_id") || getSubcategoryIdFromSlug(categorySlug, subSlug),
    province: searchParams.get("province") || "",
    district: searchParams.get("district") || "",
    location: searchParams.get("location") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    condition: searchParams.get("condition") || "",
    sort_by: searchParams.get("sort_by") || "newest",
    page: parseInt(searchParams.get("page") || "1"),
    attributes: parseAttributesFromParams(),
  };
};

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const isUpdatingUrl = useRef(false);

  const { data: categories } = useGetCategoriesQuery();
  const categoriesData = categories?.data || [];

  const [filters, setFilters] = useState<Filters>(() =>
    parseFiltersFromParams(searchParams, categoriesData)
  );

  const searchParamsString = searchParams.toString();
  const categoriesLoaded = categoriesData.length > 0;
  
  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }
    const newFilters = parseFiltersFromParams(searchParams, categoriesData);
    setFilters(newFilters);
    
    if (categoriesLoaded) {
      const hasSlugParams = searchParams.has("category") || searchParams.has("sub");
      const needsCanonicalUpdate = hasSlugParams && (newFilters.category_id || newFilters.subcategory_id);
      
      if (needsCanonicalUpdate) {
        isUpdatingUrl.current = true;
        const params = new URLSearchParams();
        
        Object.entries(newFilters).forEach(([key, value]) => {
          if (key === "attributes") return;
          if (value && value !== "" && value !== "newest" && !(key === "page" && value === 1)) {
            params.set(key, value.toString());
          }
        });
        
        if (newFilters.sort_by && newFilters.sort_by !== "newest") {
          params.set("sort_by", newFilters.sort_by);
        }
        
        if (newFilters.attributes) {
          Object.entries(newFilters.attributes).forEach(([key, value]) => {
            if (value) {
              params.set(`attr_${key}`, value);
            }
          });
        }
        
        setSearchParams(params, { replace: true });
      }
    }
  }, [searchParamsString, categoriesLoaded]);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  const cleanFilters = (filtersToClean: Filters) => {
    const cleaned: Record<string, string | number> = {};

    Object.entries(filtersToClean).forEach(([key, value]) => {
      if (key === "attributes") return;
      if (value !== "" && value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    });

    if (filtersToClean.attributes) {
      Object.entries(filtersToClean.attributes).forEach(([key, value]) => {
        if (value) {
          cleaned[`attr_${key}`] = value;
        }
      });
    }

    return cleaned;
  };

  const {
    data: adsResponse,
    isLoading,
    error,
  } = useGetAdsQuery(cleanFilters(filters));
  const [saveSearch] = useSaveSearchMutation();

  const adsData = adsResponse?.data || { ads: [], total: 0, totalPages: 0 };

  const updateUrlParams = useCallback((newFilters: Filters) => {
    isUpdatingUrl.current = true;
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === "attributes") return;
      if (value && value !== "" && value !== "newest" && !(key === "page" && value === 1)) {
        params.set(key, value.toString());
      }
    });
    
    if (newFilters.sort_by && newFilters.sort_by !== "newest") {
      params.set("sort_by", newFilters.sort_by);
    }
    
    if (newFilters.attributes) {
      Object.entries(newFilters.attributes).forEach(([key, value]) => {
        if (value) {
          params.set(`attr_${key}`, value);
        }
      });
    }
    
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1,
      };
      updateUrlParams(newFilters);
      return newFilters;
    });
  };

  const handleAttributeFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [key]: value,
        },
        page: 1,
      };
      updateUrlParams(newFilters);
      return newFilters;
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => {
      const newFilters = { ...prev, page };
      updateUrlParams(newFilters);
      return newFilters;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    const newFilters: Filters = {
      q: "",
      category_id: "",
      subcategory_id: "",
      province: "",
      district: "",
      location: "",
      min_price: "",
      max_price: "",
      condition: "",
      sort_by: "newest",
      page: 1,
      attributes: {},
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      dispatch(
        addNotification({
          type: "error",
          message: "Please enter a name for your search",
        })
      );
      return;
    }

    try {
      await saveSearch({
        name: searchName,
        search_params: cleanFilters(filters),
        notification_enabled: false,
      }).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Search saved successfully!",
        })
      );

      setShowSaveModal(false);
      setSearchName("");
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to save search",
        })
      );
    }
  };

  const getSelectedCategoryName = () => {
    if (!filters.category_id) return null;
    const category = categoriesData.find((c: { id: string }) => c.id === filters.category_id);
    return category?.name;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange("q", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-mobile-filters"
              >
                <SlidersHorizontal size={20} />
                <span>Filters</span>
              </button>
              <button
                onClick={() => {
                  // Pre-populate search name with current search query or a descriptive name
                  const generateSearchName = () => {
                    const parts: string[] = [];
                    if (filters.q) parts.push(filters.q);
                    const categoryName = getSelectedCategoryName();
                    if (categoryName) parts.push(categoryName);
                    if (filters.province) parts.push(filters.district || filters.province);
                    return parts.length > 0 ? parts.join(" - ") : "My Search";
                  };
                  setSearchName(generateSearchName());
                  setShowSaveModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-save-search"
              >
                <Bookmark size={20} />
                <span className="hidden sm:inline">Save Search</span>
              </button>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  } transition-colors rounded-l-lg`}
                  data-testid="button-view-grid"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 ${
                    viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  } transition-colors rounded-r-lg`}
                  data-testid="button-view-list"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.category_id && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  {getSelectedCategoryName()}
                  <button
                    onClick={() => {
                      handleFilterChange("category_id", "");
                      handleFilterChange("subcategory_id", "");
                    }}
                    className="ml-1 hover:text-green-900"
                    data-testid="button-remove-category-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.province && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  {filters.district || filters.province}
                  <button
                    onClick={() => {
                      handleFilterChange("province", "");
                      handleFilterChange("district", "");
                    }}
                    className="ml-1 hover:text-green-900"
                    data-testid="button-remove-location-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {(filters.min_price || filters.max_price) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  &#x20A6;{filters.min_price || "0"} - &#x20A6;{filters.max_price || "Any"}
                  <button
                    onClick={() => {
                      handleFilterChange("min_price", "");
                      handleFilterChange("max_price", "");
                    }}
                    className="ml-1 hover:text-green-900"
                    data-testid="button-remove-price-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                data-testid="select-sort"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onAttributeFilterChange={handleAttributeFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    data-testid="button-close-mobile-filters"
                  >
                    <X size={24} />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onAttributeFilterChange={handleAttributeFilterChange}
                  onClearFilters={clearFilters}
                  className="border-0 rounded-none shadow-none"
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="text-search-title">
                  {filters.q
                    ? `Results for "${filters.q}"`
                    : getSelectedCategoryName()
                    ? `${getSelectedCategoryName()}`
                    : "All Listings"}
                </h1>
                {adsData && (
                  <p className="text-gray-600 text-sm mt-1" data-testid="text-results-count">
                    {adsData.total} results found
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-search-error">
                  Unable to load results
                </h3>
                <p className="text-gray-600 mb-4">
                  Please check your connection and try again
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  data-testid="button-retry"
                >
                  Retry
                </button>
              </div>
            )}

            {isLoading && !error && (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }>
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
            )}

            {!isLoading && adsData.ads && (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-4"
                  }
                >
                  {adsData.ads.map((ad: {
                    id: string;
                    title: string;
                    price: number;
                    location: string;
                    images: Array<{ url: string } | string>;
                    is_featured: boolean;
                    is_urgent: boolean;
                    created_at: string;
                  }) => (
                    <Link
                      key={ad.id}
                      to={`/ads/${ad.id}`}
                      className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                      data-testid={`card-ad-${ad.id}`}
                    >
                      <div
                        className={`relative ${
                          viewMode === "list" ? "w-48 flex-shrink-0" : ""
                        }`}
                      >
                        <img
                          src={
                            (typeof ad.images?.[0] === 'object' ? ad.images?.[0]?.url : ad.images?.[0]) ||
                            "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg"
                          }
                          alt={ad.title}
                          className={`object-cover ${
                            viewMode === "list" ? "w-full h-32" : "w-full h-48"
                          }`}
                        />
                        {ad.is_featured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <Star size={12} fill="currentColor" />
                              <span>Featured</span>
                            </span>
                          </div>
                        )}
                        {ad.is_urgent && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                              Urgent
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {ad.title}
                        </h3>
                        <p className="text-green-600 font-bold text-lg mb-2">
                          &#x20A6;{ad.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <MapPin size={14} className="mr-1" />
                          <span>{ad.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500 text-sm">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {new Date(ad.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {adsData.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      data-testid="button-prev-page"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(5, adsData.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            filters.page === page
                              ? "bg-green-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                          data-testid={`button-page-${page}`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= adsData.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      data-testid="button-next-page"
                    >
                      Next
                    </button>
                  </div>
                )}

                {adsData.ads.length === 0 && (
                  <div className="text-center py-12">
                    <SearchIcon
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      data-testid="button-clear-all-filters"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowSaveModal(false)}
            />

            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Save Search
                </h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="button-close-save-modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Name
                  </label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="e.g., iPhone in Lagos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    data-testid="input-search-name"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Search Criteria
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {filters.q && <p>Query: "{filters.q}"</p>}
                    {filters.category_id && <p>Category: {getSelectedCategoryName()}</p>}
                    {filters.province && <p>Location: {filters.district || filters.province}</p>}
                    {(filters.min_price || filters.max_price) && (
                      <p>
                        Price: &#x20A6;{filters.min_price || 0} - &#x20A6;
                        {filters.max_price || "Any"}
                      </p>
                    )}
                    {filters.condition && <p>Condition: {filters.condition}</p>}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="button-cancel-save"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSearch}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    data-testid="button-confirm-save"
                  >
                    Save Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
