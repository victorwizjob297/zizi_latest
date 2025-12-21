import { useState, useEffect } from "react";
import {
  zimbabweLocations,
  provinces,
  getDistrictsByProvince,
  Province,
} from "../../data/zimbabweLocations";

interface LocationSelectorProps {
  selectedProvince: string;
  selectedDistrict: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  layout?: "stacked" | "inline" | "auto"; // New prop to control layout
  showLabels?: boolean; // New prop to control label visibility
  compact?: boolean; // New prop for compact styling
}

export default function LocationSelector({
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  required = false,
  error,
  className = "",
  layout = "stacked", // Default to stacked for backward compatibility
  showLabels = true, // Default to show labels
  compact = false, // Default to normal spacing
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      const provinceDistricts = getDistrictsByProvince(
        selectedProvince as Province,
      );
      setDistricts(provinceDistricts);

      if (!provinceDistricts.includes(selectedDistrict)) {
        onDistrictChange("");
      }
    } else {
      setDistricts([]);
      onDistrictChange("");
    }
  }, [selectedProvince]);

  // Determine layout classes based on the layout prop
  const getLayoutClasses = () => {
    switch (layout) {
      case "inline":
        return "flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0";
      case "auto":
        return "flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0";
      case "stacked":
      default:
        return "space-y-4";
    }
  };

  // Determine padding classes based on compact prop
  const getPaddingClasses = () => {
    return compact ? "px-3 py-2 text-sm" : "px-4 py-3";
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {/* Province Selector */}
      <div
        className={`flex-1 ${layout !== "stacked" ? "w-full sm:w-auto" : ""}`}
      >
        {showLabels && (
          <label
            htmlFor="province"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Province {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          id="province"
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          required={required}
          className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPaddingClasses()}`}
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* District Selector - Conditionally rendered when province is selected */}
      {selectedProvince && (
        <div
          className={`flex-1 ${layout !== "stacked" ? "w-full sm:w-auto" : ""}`}
        >
          {showLabels && (
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              District {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            required={required}
            disabled={!selectedProvince}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${getPaddingClasses()}`}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2 col-span-full">{error}</p>
      )}
    </div>
  );
}
