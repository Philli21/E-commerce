// src/components/post-ad/CategorySpecFields.jsx
import { useCategories } from '../../hooks/useCategories';

const SpecInput = ({ label, name, type = 'text', ...props }) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <input
      type={type}
      name={name}
      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
      {...props}
    />
  </div>
);

const SpecSelect = ({ label, name, options }) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <select
      name={name}
      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
    >
      <option value="">Select</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SpecCheckbox = ({ label, name }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" name={name} className="rounded border-slate-300 text-primary focus:ring-primary" />
    <span className="text-sm text-text">{label}</span>
  </label>
);

const SPEC_FIELDS = {
  laptops: () => (
    <>
      <SpecSelect label="Brand" name="brand" options={['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Other']} />
      <SpecInput label="Processor" name="processor" placeholder="e.g., 11th Gen Intel i5" />
      <SpecSelect label="RAM" name="ram" options={['4GB', '8GB', '16GB', '32GB', '64GB+']} />
      <SpecSelect label="Storage" name="storage" options={['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', 'HDD']} />
      <SpecSelect label="Screen Size" name="screenSize" options={['13"', '14"', '15.6"', '16"', '17"+']} />
      <SpecSelect label="Graphics" name="graphics" options={['Integrated', 'NVIDIA', 'AMD', 'Apple Silicon']} />
    </>
  ),
  phones: () => (
    <>
      <SpecSelect label="Brand" name="brand" options={['Apple', 'Samsung', 'Xiaomi', 'Tecno', 'Infinix', 'Huawei', 'Other']} />
      <SpecInput label="Model" name="model" />
      <SpecSelect label="Storage" name="storage" options={['32GB', '64GB', '128GB', '256GB', '512GB', '1TB']} />
      <SpecInput label="Battery Health" name="batteryHealth" type="number" min="0" max="100" step="1" placeholder="%" />
      <SpecInput label="Color" name="color" />
    </>
  ),
  cars: () => (
    <>
      <SpecSelect label="Brand" name="brand" options={['Toyota', 'Honda', 'BMW', 'Mercedes', 'Hyundai', 'Other']} />
      <SpecInput label="Model" name="model" />
      <SpecInput label="Year" name="year" type="number" min="1990" max="2026" />
      <SpecInput label="Mileage (km)" name="mileage" type="number" />
      <SpecSelect label="Fuel Type" name="fuelType" options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} />
      <SpecSelect label="Transmission" name="transmission" options={['Manual', 'Automatic', 'CVT']} />
      <SpecInput label="Color" name="color" />
    </>
  ),
  realEstate: () => (
    <>
      <SpecSelect label="Property Type" name="propertyType" options={['Apartment', 'Villa', 'Condo', 'Land', 'Commercial']} />
      <SpecSelect label="Bedrooms" name="bedrooms" options={['Studio', '1', '2', '3', '4', '5+']} />
      <SpecSelect label="Bathrooms" name="bathrooms" options={['1', '2', '3', '4+']} />
      <SpecInput label="Size (sqm)" name="size" type="number" />
      <SpecCheckbox label="Furnished" name="furnished" />
    </>
  ),
  clothing: () => (
    <>
      <SpecInput label="Brand" name="brand" />
      <SpecSelect label="Size" name="size" options={['XS', 'S', 'M', 'L', 'XL', 'XXL']} />
      <SpecInput label="Color" name="color" />
      <SpecSelect label="Material" name="material" options={['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool', 'Other']} />
    </>
  ),
};

const CategorySpecFields = ({ categoryId, specifications, onChange }) => {
  const { categories } = useCategories();
  const category = categories.find(c => c.id === categoryId);
  const categoryName = category?.name?.toLowerCase() || '';

  let SpecComponent = null;
  if (categoryName.includes('laptop')) SpecComponent = SPEC_FIELDS.laptops;
  else if (categoryName.includes('phone')) SpecComponent = SPEC_FIELDS.phones;
  else if (categoryName.includes('car')) SpecComponent = SPEC_FIELDS.cars;
  else if (categoryName.includes('real estate') || categoryName.includes('property')) SpecComponent = SPEC_FIELDS.realEstate;
  else if (categoryName.includes('clothing')) SpecComponent = SPEC_FIELDS.clothing;

  if (!SpecComponent) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    onChange({ ...specifications, [name]: val });
  };

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
      <h3 className="text-lg font-semibold">Specifications</h3>
      <div onChange={handleChange}>
        <SpecComponent />
      </div>
    </div>
  );
};

export default CategorySpecFields;