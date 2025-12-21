import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import {
  useGetCategoryAttributesQuery,
  useCreateCategoryAttributeMutation,
  useUpdateCategoryAttributeMutation,
  useDeleteCategoryAttributeMutation,
} from '../../redux/api/categoryAttributesApi';
import { useGetCategoriesQuery } from '../../redux/api/categoriesApi';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../redux/slices/uiSlice';

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select (Dropdown)' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'tel', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
];

const CategoryAttributesManagement = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    field_options: '',
    placeholder: '',
    is_required: false,
    is_searchable: false,
    help_text: '',
  });

  const { data: categories } = useGetCategoriesQuery();
  const { data: attributesData, isLoading } = useGetCategoryAttributesQuery(
    selectedCategory,
    { skip: !selectedCategory }
  );
  const [createAttribute, { isLoading: creating }] = useCreateCategoryAttributeMutation();
  const [updateAttribute, { isLoading: updating }] = useUpdateCategoryAttributeMutation();
  const [deleteAttribute] = useDeleteCategoryAttributeMutation();

  const attributes = attributesData?.data || [];

  const allCategories = [
    ...(categories?.data || []),
    ...(categories?.data?.flatMap((cat) => cat.subcategories || []) || []),
  ];

  const resetForm = () => {
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text',
      field_options: '',
      placeholder: '',
      is_required: false,
      is_searchable: false,
      help_text: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (attribute) => {
    setFormData({
      field_name: attribute.field_name,
      field_label: attribute.field_label,
      field_type: attribute.field_type,
      field_options: Array.isArray(attribute.field_options)
        ? attribute.field_options.join(', ')
        : '',
      placeholder: attribute.placeholder || '',
      is_required: attribute.is_required,
      is_searchable: attribute.is_searchable,
      help_text: attribute.help_text || '',
    });
    setEditingId(attribute.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        category_id: parseInt(selectedCategory),
        field_options: formData.field_options
          ? formData.field_options.split(',').map((opt) => opt.trim())
          : [],
      };

      if (editingId) {
        await updateAttribute({ id: editingId, ...data }).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: 'Attribute updated successfully',
          })
        );
      } else {
        await createAttribute(data).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: 'Attribute created successfully',
          })
        );
      }

      resetForm();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: error.data?.message || 'Failed to save attribute',
        })
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;

    try {
      await deleteAttribute(id).unwrap();
      dispatch(
        addNotification({
          type: 'success',
          message: 'Attribute deleted successfully',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: error.data?.message || 'Failed to delete attribute',
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Attributes Management
          </h1>
          <p className="text-gray-600">
            Configure dynamic form fields for each category
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              resetForm();
            }}
            className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Choose a category...</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Attributes ({attributes.length})
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add Attribute</span>
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingId ? 'Edit Attribute' : 'New Attribute'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Name (Internal) *
                    </label>
                    <input
                      type="text"
                      value={formData.field_name}
                      onChange={(e) =>
                        setFormData({ ...formData, field_name: e.target.value })
                      }
                      placeholder="e.g., make, bedrooms"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Label (Display) *
                    </label>
                    <input
                      type="text"
                      value={formData.field_label}
                      onChange={(e) =>
                        setFormData({ ...formData, field_label: e.target.value })
                      }
                      placeholder="e.g., Make, Number of Bedrooms"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type *
                    </label>
                    <select
                      value={formData.field_type}
                      onChange={(e) =>
                        setFormData({ ...formData, field_type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={formData.placeholder}
                      onChange={(e) =>
                        setFormData({ ...formData, placeholder: e.target.value })
                      }
                      placeholder="e.g., Enter value"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {['select', 'multiselect', 'radio'].includes(formData.field_type) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.field_options}
                        onChange={(e) =>
                          setFormData({ ...formData, field_options: e.target.value })
                        }
                        placeholder="e.g., Option 1, Option 2, Option 3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={formData.help_text}
                      onChange={(e) =>
                        setFormData({ ...formData, help_text: e.target.value })
                      }
                      placeholder="Additional information for users"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_required}
                        onChange={(e) =>
                          setFormData({ ...formData, is_required: e.target.checked })
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">Required</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_searchable}
                        onChange={(e) =>
                          setFormData({ ...formData, is_searchable: e.target.checked })
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">Searchable</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{editingId ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading attributes...</p>
              </div>
            ) : attributes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No attributes yet</p>
                <p className="text-sm">
                  Click "Add Attribute" to create your first attribute
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <GripVertical size={20} className="text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">
                            {attr.field_label}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {attr.field_type}
                          </span>
                          {attr.is_required && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                              Required
                            </span>
                          )}
                          {attr.is_searchable && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                              Searchable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {attr.field_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(attr)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(attr.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAttributesManagement;
