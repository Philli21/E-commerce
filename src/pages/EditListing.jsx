import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getListingById, updateListing } from '../services/listingService';
import { Loader2, X, Star, Upload } from 'lucide-react';

// Reuse step components from PostAd (or create dedicated ones)
import StepCategory from '../components/post-ad/StepCategory';
import StepDetails from '../components/post-ad/StepDetails';

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
  'Hawassa', 'Adama', 'Jimma', 'Jijiga', 'Dessie', 'Others'
];

const steps = ['Category', 'Details', 'Images'];

const EditListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category_id: null,
    title: '',
    description: '',
    price: '',
    price_negotiable: true,
    condition: 'used',
    location: '',
    existingImages: [],        // from DB: { id, image_url, is_primary, display_order }
    newImages: [],             // File objects for new uploads
    removedImageIds: [],       // IDs of images to delete
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        // Ensure user owns this listing (protect route)
        if (data.user_id !== user?.id) {
          navigate('/my-listings');
          return;
        }
        setFormData({
          category_id: data.category_id,
          title: data.title,
          description: data.description,
          price: data.price,
          price_negotiable: data.price_negotiable,
          condition: data.condition,
          location: data.location,
          existingImages: data.listing_images || [],
          newImages: [],
          removedImageIds: [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, user, navigate]);

  const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const handleNext = () => setCurrentStep(i => i + 1);
  const handleBack = () => setCurrentStep(i => i - 1);

  // ---- Image management for step 2 ----
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.existingImages.length + formData.newImages.length + files.length;
    if (totalImages > 8) {
      alert('Maximum 8 images allowed');
      return;
    }
    updateForm({ newImages: [...formData.newImages, ...files] });
  };

  const removeExistingImage = (imageId) => {
    updateForm({
      existingImages: formData.existingImages.filter(img => img.id !== imageId),
      removedImageIds: [...formData.removedImageIds, imageId]
    });
  };

  const removeNewImage = (index) => {
    updateForm({
      newImages: formData.newImages.filter((_, i) => i !== index)
    });
  };

  const setPrimaryImage = (imageIdOrIndex, type) => {
    if (type === 'existing') {
      const updated = formData.existingImages.map(img => ({
        ...img,
        is_primary: img.id === imageIdOrIndex
      }));
      updateForm({ existingImages: updated });
    } else {
      // For new images, we'll handle primary flag on submit
      // We could reorder newImages, but it's simpler to let first new image be primary if no existing
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await updateListing(id, formData);
      navigate('/my-listings');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-error">{error}</div>;
  }

  // Render step components
  const stepProps = {
    formData,
    updateForm,
    onNext: handleNext,
    onBack: handleBack,
    isLastStep: currentStep === steps.length - 1,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepCategory {...stepProps} />;
      case 1:
        return <StepDetails {...stepProps} />;
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-text mb-6">Manage Images</h2>
            <p className="text-text-light mb-4">Up to 8 images. First image is the cover.</p>

            {/* Existing images */}
            {formData.existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.existingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.image_url}
                        alt="Listing"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                        {!img.is_primary && (
                          <button
                            onClick={() => setPrimaryImage(img.id, 'existing')}
                            className="p-1 bg-white rounded-full hover:bg-secondary"
                            title="Set as cover"
                          >
                            <Star className="w-4 h-4 text-text" />
                          </button>
                        )}
                        <button
                          onClick={() => removeExistingImage(img.id)}
                          className="p-1 bg-white rounded-full hover:bg-error"
                          title="Remove"
                        >
                          <X className="w-4 h-4 text-text" />
                        </button>
                      </div>
                      {img.is_primary && (
                        <span className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image uploads */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Add New Images</h3>
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary"
                onClick={() => document.getElementById('image-upload').click()}
              >
                <Upload className="w-8 h-8 text-text-light mx-auto mb-2" />
                <p className="text-text-light">Click to upload or drag & drop</p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {formData.newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.newImages.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full hover:bg-error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                disabled={submitting}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-secondary hover:bg-secondary-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  idx <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-text-light'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`ml-2 text-sm ${idx === currentStep ? 'font-medium text-text' : 'text-text-light'}`}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${idx < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default EditListing;