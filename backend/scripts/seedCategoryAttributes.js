import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const categoryAttributesData = {
  // Vehicles - Cars
  cars: [
    {
      field_name: 'make',
      field_label: 'Make',
      field_type: 'select',
      field_options: ['Toyota', 'Honda', 'Nissan', 'Mercedes-Benz', 'BMW', 'Audi', 'Mazda', 'Volkswagen', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Other'],
      is_required: true,
      is_searchable: true,
      order_index: 0
    },
    {
      field_name: 'model',
      field_label: 'Model',
      field_type: 'text',
      placeholder: 'e.g., Camry, Corolla',
      is_required: true,
      is_searchable: true,
      order_index: 1
    },
    {
      field_name: 'year',
      field_label: 'Year',
      field_type: 'number',
      validation_rules: { min: 1980, max: new Date().getFullYear() + 1 },
      is_required: true,
      is_searchable: true,
      order_index: 2
    },
    {
      field_name: 'mileage',
      field_label: 'Mileage (km)',
      field_type: 'number',
      validation_rules: { min: 0 },
      is_searchable: true,
      order_index: 3
    },
    {
      field_name: 'transmission',
      field_label: 'Transmission',
      field_type: 'select',
      field_options: ['Automatic', 'Manual'],
      is_required: true,
      is_searchable: true,
      order_index: 4
    },
    {
      field_name: 'fuel_type',
      field_label: 'Fuel Type',
      field_type: 'select',
      field_options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      is_required: true,
      is_searchable: true,
      order_index: 5
    },
    {
      field_name: 'engine_capacity',
      field_label: 'Engine Capacity (cc)',
      field_type: 'number',
      validation_rules: { min: 500, max: 10000 },
      order_index: 6
    },
    {
      field_name: 'color',
      field_label: 'Color',
      field_type: 'select',
      field_options: ['Black', 'White', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Gold', 'Brown', 'Other'],
      is_searchable: true,
      order_index: 7
    },
    {
      field_name: 'body_type',
      field_label: 'Body Type',
      field_type: 'select',
      field_options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Van', 'Pickup', 'Convertible'],
      is_searchable: true,
      order_index: 8
    }
  ],

  // Property - Houses for Rent
  houses_for_rent: [
    {
      field_name: 'bedrooms',
      field_label: 'Bedrooms',
      field_type: 'number',
      validation_rules: { min: 1, max: 20 },
      is_required: true,
      is_searchable: true,
      order_index: 0
    },
    {
      field_name: 'bathrooms',
      field_label: 'Bathrooms',
      field_type: 'number',
      validation_rules: { min: 1, max: 10 },
      is_required: true,
      is_searchable: true,
      order_index: 1
    },
    {
      field_name: 'square_footage',
      field_label: 'Square Footage',
      field_type: 'number',
      validation_rules: { min: 100 },
      placeholder: 'e.g., 1500',
      is_searchable: true,
      order_index: 2
    },
    {
      field_name: 'furnished',
      field_label: 'Furnishing',
      field_type: 'select',
      field_options: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      is_required: true,
      is_searchable: true,
      order_index: 3
    },
    {
      field_name: 'parking',
      field_label: 'Parking Spaces',
      field_type: 'number',
      validation_rules: { min: 0, max: 10 },
      order_index: 4
    },
    {
      field_name: 'amenities',
      field_label: 'Amenities',
      field_type: 'multiselect',
      field_options: ['Pool', 'Garden', 'Security', 'Borehole', 'Generator', 'Air Conditioning', 'DSTV', 'WiFi'],
      help_text: 'Hold Ctrl/Cmd to select multiple',
      order_index: 5
    }
  ],

  // Electronics - Mobile Phones
  mobile_phones: [
    {
      field_name: 'brand',
      field_label: 'Brand',
      field_type: 'select',
      field_options: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'Vivo', 'Nokia', 'Tecno', 'Infinix', 'Other'],
      is_required: true,
      is_searchable: true,
      order_index: 0
    },
    {
      field_name: 'model',
      field_label: 'Model',
      field_type: 'text',
      placeholder: 'e.g., iPhone 13, Galaxy S21',
      is_required: true,
      is_searchable: true,
      order_index: 1
    },
    {
      field_name: 'storage',
      field_label: 'Storage',
      field_type: 'select',
      field_options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
      is_required: true,
      is_searchable: true,
      order_index: 2
    },
    {
      field_name: 'ram',
      field_label: 'RAM',
      field_type: 'select',
      field_options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'],
      is_searchable: true,
      order_index: 3
    },
    {
      field_name: 'screen_size',
      field_label: 'Screen Size (inches)',
      field_type: 'number',
      validation_rules: { min: 4, max: 8 },
      order_index: 4
    },
    {
      field_name: 'camera',
      field_label: 'Main Camera (MP)',
      field_type: 'number',
      validation_rules: { min: 2, max: 200 },
      order_index: 5
    },
    {
      field_name: 'battery',
      field_label: 'Battery Capacity (mAh)',
      field_type: 'number',
      validation_rules: { min: 1000, max: 10000 },
      order_index: 6
    },
    {
      field_name: 'color',
      field_label: 'Color',
      field_type: 'text',
      placeholder: 'e.g., Black, White, Gold',
      order_index: 7
    }
  ]
};

async function findOrCreateCategory(name, slug, parentSlug = null) {
  let parentId = null;

  if (parentSlug) {
    const parentResult = await query(
      'SELECT id FROM categories WHERE slug = $1',
      [parentSlug]
    );
    if (parentResult.rows.length === 0) {
      console.log(`Parent category '${parentSlug}' not found, skipping...`);
      return null;
    }
    parentId = parentResult.rows[0].id;
  }

  const result = await query(
    'SELECT id FROM categories WHERE slug = $1',
    [slug]
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  console.log(`Category '${slug}' not found, creating...`);
  const insertResult = await query(
    `INSERT INTO categories (name, slug, parent_id, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING id`,
    [name, slug, parentId]
  );

  return insertResult.rows[0].id;
}

async function seedCategoryAttributes() {
  try {
    console.log('🌱 Starting category attributes seeding...');

    const categoryMappings = [
      { key: 'cars', name: 'Cars', slug: 'cars', parentSlug: 'vehicles' },
      { key: 'houses_for_rent', name: 'Houses for Rent', slug: 'houses-for-rent', parentSlug: 'property' },
      { key: 'mobile_phones', name: 'Mobile Phones', slug: 'mobile-phones', parentSlug: 'electronics' }
    ];

    for (const mapping of categoryMappings) {
      const categoryId = await findOrCreateCategory(mapping.name, mapping.slug, mapping.parentSlug);

      if (!categoryId) {
        continue;
      }

      const attributes = categoryAttributesData[mapping.key];

      console.log(`Adding attributes for ${mapping.name}...`);

      for (const attr of attributes) {
        const existing = await query(
          'SELECT id FROM category_attributes WHERE category_id = $1 AND field_name = $2',
          [categoryId, attr.field_name]
        );

        if (existing.rows.length > 0) {
          console.log(`  - Attribute '${attr.field_name}' already exists, skipping...`);
          continue;
        }

        await query(
          `INSERT INTO category_attributes (
            category_id, field_name, field_label, field_type, field_options,
            placeholder, validation_rules, order_index, is_required, is_searchable, help_text
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            categoryId,
            attr.field_name,
            attr.field_label,
            attr.field_type,
            JSON.stringify(attr.field_options || []),
            attr.placeholder || null,
            JSON.stringify(attr.validation_rules || {}),
            attr.order_index,
            attr.is_required || false,
            attr.is_searchable || false,
            attr.help_text || null
          ]
        );

        console.log(`  ✓ Added attribute: ${attr.field_label}`);
      }
    }

    console.log('✅ Category attributes seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCategoryAttributes();
