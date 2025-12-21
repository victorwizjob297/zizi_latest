import React, { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

interface ConditionalDisplay {
  field_name: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: any;
}

interface CategoryAttribute {
  id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'textarea' | 'tel' | 'email' | 'url' | 'range';
  field_options?: any[];
  placeholder?: string;
  validation_rules?: ValidationRules;
  conditional_display?: ConditionalDisplay;
  is_required: boolean;
  help_text?: string;
}

interface DynamicFormBuilderProps {
  attributes: CategoryAttribute[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}

const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  attributes,
  values,
  onChange,
  errors = {}
}) => {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const visible = new Set<string>();

    attributes.forEach((attr) => {
      if (!attr.conditional_display) {
        visible.add(attr.field_name);
      } else {
        const condition = attr.conditional_display;
        const dependentValue = values[condition.field_name];

        let shouldShow = false;

        switch (condition.operator) {
          case 'equals':
            shouldShow = dependentValue === condition.value;
            break;
          case 'not_equals':
            shouldShow = dependentValue !== condition.value;
            break;
          case 'contains':
            shouldShow = Array.isArray(dependentValue)
              ? dependentValue.includes(condition.value)
              : String(dependentValue || '').includes(String(condition.value));
            break;
        }

        if (shouldShow) {
          visible.add(attr.field_name);
        }
      }
    });

    setVisibleFields(visible);
  }, [attributes, values]);

  const renderField = (attr: CategoryAttribute) => {
    if (!visibleFields.has(attr.field_name)) {
      return null;
    }

    const value = values[attr.field_name] || '';
    const error = errors[attr.field_name];
    const hasError = !!error;

    const baseClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    const handleChange = (newValue: any) => {
      onChange(attr.field_name, newValue);
    };

    switch (attr.field_type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <input
            type={attr.field_type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attr.placeholder}
            required={attr.is_required}
            className={baseClasses}
            minLength={attr.validation_rules?.minLength}
            maxLength={attr.validation_rules?.maxLength}
            pattern={attr.validation_rules?.pattern}
          />
        );

      case 'number':
      case 'range':
        return (
          <input
            type={attr.field_type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attr.placeholder}
            required={attr.is_required}
            className={baseClasses}
            min={attr.validation_rules?.min}
            max={attr.validation_rules?.max}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            required={attr.is_required}
            className={baseClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attr.placeholder}
            required={attr.is_required}
            rows={4}
            className={baseClasses}
            minLength={attr.validation_rules?.minLength}
            maxLength={attr.validation_rules?.maxLength}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            required={attr.is_required}
            className={baseClasses}
          >
            <option value="">Select {attr.field_label}</option>
            {attr.field_options?.map((option, index) => (
              <option key={index} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              handleChange(selected);
            }}
            required={attr.is_required}
            className={`${baseClasses} h-32`}
          >
            {attr.field_options?.map((option, index) => (
              <option key={index} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {attr.field_options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={attr.field_name}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleChange(e.target.value)}
                    required={attr.is_required}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-900">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {attributes.map((attr) => (
        visibleFields.has(attr.field_name) && (
          <div key={attr.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attr.field_label}
              {attr.is_required && <span className="text-red-600 ml-1">*</span>}
              {attr.help_text && (
                <span className="ml-2 inline-flex items-center group relative">
                  <HelpCircle size={16} className="text-gray-400" />
                  <span className="absolute left-6 top-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 w-48 z-10">
                    {attr.help_text}
                  </span>
                </span>
              )}
            </label>
            {renderField(attr)}
            {errors[attr.field_name] && (
              <p className="text-sm text-red-600 mt-1">{errors[attr.field_name]}</p>
            )}
          </div>
        )
      ))}
    </div>
  );
};

export default DynamicFormBuilder;
