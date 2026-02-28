import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StepCategory from '../components/post-ad/StepCategory'
import StepDetails from '../components/post-ad/StepDetails'
import StepImages from '../components/post-ad/StepImages'
import { createListing } from '../services/listingService'

const steps = ['Category', 'Details', 'Images']

const PostAd = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    category_id: null,
    title: '',
    description: '',
    price: '',
    price_negotiable: true,
    condition: 'used',
    location: '',
    images: [],
  })
  const [submitting, setSubmitting] = useState(false)

  const updateForm = (data) => setFormData(prev => ({ ...prev, ...data }))

  const handleNext = () => setCurrentStep(i => i + 1)
  const handleBack = () => setCurrentStep(i => i - 1)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const listingId = await createListing(formData, user.id)
      navigate(`/listing/${listingId}`)
    } catch (error) {
      console.error('Failed to create listing:', error)
      alert('Error creating ad. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const stepProps = {
    formData,
    updateForm,
    onNext: handleNext,
    onBack: handleBack,
    onSubmit: handleSubmit,
    isLastStep: currentStep === steps.length - 1,
    submitting,
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepCategory {...stepProps} />
      case 1: return <StepDetails {...stepProps} />
      case 2: return <StepImages {...stepProps} />
      default: return null
    }
  }

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
  )
}

export default PostAd