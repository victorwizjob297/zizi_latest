import { useState, useEffect } from 'react';
import { zimbabweLocations, provinces, getDistrictsByProvince, Province } from '../../data/zimbabweLocations';

interface LocationSelectorProps {
  selectedProvince: string;
  selectedDistrict: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function LocationSelector({
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  required = false,
  error,
  className = ''
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      const provinceDistricts = getDistrictsByProvince(selectedProvince as Province);
      setDistricts(provinceDistricts);

      if (!provinceDistricts.includes(selectedDistrict)) {
        onDistrictChange('');
      }
    } else {
      setDistricts([]);
      onDistrictChange('');
    }
  }, [selectedProvince]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
          Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="province"
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
          District {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="district"
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          required={required}
          disabled={!selectedProvince}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
