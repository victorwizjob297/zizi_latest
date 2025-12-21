import { useState, useEffect } from "react";
import { useGetCategoriesQuery } from "../../redux/api/categoriesApi";
import { useGetSearchableAttributesQuery } from "../../redux/api/categoryAttributesApi";
import LocationSelector from "./LocationSelector";
import { ChevronDown, ChevronUp, X, ChevronRight } from "lucide-react";

interface FilterSidebarProps {
  filters: {
    q?: string;
    category_id?: string;
    subcategory_id?: string;
    province?: string;
    district?: string;
    location?: string;
    min_price?: string;
    max_price?: string;
    condition?: string;
    sort_by?: string;
    attributes?: Record<string, string>;
    [key: string]: string | Record<string, string> | undefined;
  };
  onFilterChange: (key: string, value: string) => void;
  onAttributeFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

interface CollapsedSections {
  categories: boolean;
  location: boolean;
  price: boolean;
  condition: boolean;
  attributes: boolean;
  [key: string]: boolean;
}

const FilterSidebar = ({
  filters,
  onFilterChange,
  onAttributeFilterChange,
  onClearFilters,
  className = "",
}: FilterSidebarProps) => {
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(
    {
      categories: false,
      location: true,
      price: true,
      condition: true,
      attributes: true,
    }
  );

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    filters.category_id || null
  );
  console.log(expandedCategory, "expandedCategory");
  const { data: attributesResponse } = useGetSearchableAttributesQuery(
    filters.category_id,
    { skip: !filters.category_id }
  );
  const searchableAttributes = attributesResponse?.data || [];
  console.log(searchableAttributes, "searchableAttributes");
  useEffect(() => {
    if (filters.category_id) {
      setExpandedCategory(filters.category_id);
      setCollapsedSections((prev) => ({ ...prev, attributes: false }));
    }
  }, [filters.category_id]);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    if (filters.category_id === categoryId) {
      onFilterChange("category_id", "");
      onFilterChange("subcategory_id", "");
      setExpandedCategory(null);
    } else {
      onFilterChange("category_id", categoryId);
      onFilterChange("subcategory_id", "");
      setExpandedCategory(categoryId);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (filters.subcategory_id === subcategoryId) {
      onFilterChange("subcategory_id", "");
    } else {
      onFilterChange("subcategory_id", subcategoryId);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.subcategory_id) count++;
    if (filters.province) count++;
    if (filters.district) count++;
    if (filters.min_price || filters.max_price) count++;
    if (filters.condition) count++;
    if (filters.attributes) {
      count += Object.keys(filters.attributes).length;
    }
    return count;
  };

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 10);

  const renderAttributeInput = (attribute: {
    id: string;
    field_name: string;
    field_label: string;
    field_type: string;
    field_options?: string[];
    is_searchable?: boolean;
  }) => {
    const currentValue = filters.attributes?.[attribute.field_name] || "";

    switch (attribute.field_type) {
      case "select":
      case "dropdown":
        return (
          <select
            value={currentValue}
            onChange={(e) =>
              onAttributeFilterChange(attribute.field_name, e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            data-testid={`select-attribute-${attribute.field_name}`}
          >
            <option value="">All {attribute.field_name}</option>
            {attribute.field_options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {attribute.field_options?.map((option) => (
              <label
                key={option}
                className="flex items-center text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={currentValue === option}
                  onChange={() =>
                    onAttributeFilterChange(
                      attribute.field_name,
                      currentValue === option ? "" : option
                    )
                  }
                  className="mr-2 rounded text-green-600 focus:ring-green-500"
                  data-testid={`checkbox-attribute-${attribute.field_name}-${option}`}
                />
                {option}
              </label>
            ))}
          </div>
        );
      case "number":
      case "range":
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) =>
              onAttributeFilterChange(attribute.field_name, e.target.value)
            }
            placeholder={`Enter ${attribute.field_name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            data-testid={`input-attribute-${attribute.field_name}`}
          />
        );
      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) =>
              onAttributeFilterChange(attribute.field_name, e.target.value)
            }
            placeholder={`Enter ${attribute.field_name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            data-testid={`input-attribute-${attribute.field_name}`}
          />
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            data-testid="button-clear-filters"
          >
            <X size={14} />
            Clear all ({getActiveFiltersCount()})
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        <div className="p-4">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-toggle-categories"
          >
            <span className="font-medium text-green-600 text-sm uppercase tracking-wide">
              Categories
            </span>
            {collapsedSections.categories ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronUp size={18} className="text-gray-400" />
            )}
          </button>

          {!collapsedSections.categories && (
            <div className="mt-3 space-y-1">
              {displayedCategories.map(
                (category: {
                  id: string;
                  name: string;
                  slug: string;
                  ad_count?: number;
                  subcategories?: Array<{
                    id: string;
                    name: string;
                    slug: string;
                    ad_count?: number;
                  }>;
                }) => {
                  const isExpanded = expandedCategory === category.id;
                  const isSelected = filters.category_id === category.id;
                  const hasSubcategories =
                    category.subcategories && category.subcategories.length > 0;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex items-center justify-between w-full px-2 py-2 text-sm rounded-md transition-colors ${
                          isSelected
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        data-testid={`button-category-${category.slug}`}
                      >
                        <span className="flex items-center gap-2">
                          {hasSubcategories && (
                            <ChevronRight
                              size={14}
                              className={`transform transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                          <span>{category.name}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.ad_count
                            ? Number(category.ad_count).toLocaleString()
                            : 0}
                        </span>
                      </button>

                      {isExpanded && hasSubcategories && (
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                          {category.subcategories?.map(
                            (sub: {
                              id: string;
                              name: string;
                              slug: string;
                              ad_count?: number;
                            }) => (
                              <button
                                key={sub.id}
                                onClick={() => handleSubcategorySelect(sub.id)}
                                className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
                                  filters.subcategory_id === sub.id
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                                data-testid={`button-subcategory-${sub.slug}`}
                              >
                                <span>{sub.name}</span>
                                <span className="text-xs text-gray-400">
                                  {sub.ad_count
                                    ? Number(sub.ad_count).toLocaleString()
                                    : 0}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {categories.length > 10 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-sm text-green-600 hover:text-green-700 mt-2 px-2"
                  data-testid="button-show-more-categories"
                >
                  {showAllCategories
                    ? "Show less"
                    : `Show all (${categories.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => toggleSection("location")}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-toggle-location"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Location</span>
              {(filters.province || filters.district) && (
                <span className="text-xs text-green-600">
                  {filters.district || filters.province}
                </span>
              )}
            </div>
            {collapsedSections.location ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronUp size={18} className="text-gray-400" />
            )}
          </button>

          {!collapsedSections.location && (
            <div className="mt-3 space-y-3">
              <LocationSelector
                selectedProvince={filters.province || ""}
                selectedDistrict={filters.district || ""}
                onProvinceChange={(province) =>
                  onFilterChange("province", province)
                }
                onDistrictChange={(district) =>
                  onFilterChange("district", district)
                }
                className="space-y-3"
              />
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-toggle-price"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Price, &#x20A6;</span>
              {(filters.min_price || filters.max_price) && (
                <span className="text-xs text-green-600">
                  &#x20A6;{filters.min_price || 0} - &#x20A6;
                  {filters.max_price || "Any"}
                </span>
              )}
            </div>
            {collapsedSections.price ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronUp size={18} className="text-gray-400" />
            )}
          </button>

          {!collapsedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price || ""}
                  onChange={(e) => onFilterChange("min_price", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  data-testid="input-min-price"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price || ""}
                  onChange={(e) => onFilterChange("max_price", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  data-testid="input-max-price"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["1000", "5000", "10000", "50000", "100000"].map((price) => (
                  <button
                    key={price}
                    onClick={() => onFilterChange("max_price", price)}
                    className={`px-2 py-1 text-xs border rounded-md ${
                      filters.max_price === price
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                    data-testid={`button-price-${price}`}
                  >
                    Under &#x20A6;{Number(price).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => toggleSection("condition")}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-toggle-condition"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Condition</span>
              {filters.condition && (
                <span className="text-xs text-green-600 capitalize">
                  {filters.condition}
                </span>
              )}
            </div>
            {collapsedSections.condition ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronUp size={18} className="text-gray-400" />
            )}
          </button>

          {!collapsedSections.condition && (
            <div className="mt-3 space-y-2">
              {["new", "used", "refurbished"].map((condition) => (
                <label
                  key={condition}
                  className="flex items-center text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="condition"
                    checked={filters.condition === condition}
                    onChange={() => onFilterChange("condition", condition)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                    data-testid={`radio-condition-${condition}`}
                  />
                  <span className="capitalize">{condition}</span>
                </label>
              ))}
              {filters.condition && (
                <button
                  onClick={() => onFilterChange("condition", "")}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  data-testid="button-clear-condition"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {filters.category_id && searchableAttributes.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection("attributes")}
              className="flex items-center justify-between w-full text-left"
              data-testid="button-toggle-attributes"
            >
              <span className="font-medium text-gray-700">More Filters</span>
              {collapsedSections.attributes ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronUp size={18} className="text-gray-400" />
              )}
            </button>

            {!collapsedSections.attributes && (
              <div className="mt-3 space-y-4">
                {searchableAttributes.map(
                  (attribute: {
                    id: string;
                    field_name: string;
                    field_label: string;
                    field_type: string;
                    field_options?: string[];
                    is_searchable?: boolean;
                  }) => (
                    <div key={attribute.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {attribute.field_label}
                      </label>
                      {renderAttributeInput(attribute)}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
