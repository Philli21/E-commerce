import { useState, useRef } from 'react'
import { Upload, X, Star } from 'lucide-react'

const MAX_IMAGES = 8

const StepImages = ({ formData, updateForm, onSubmit, onBack, submitting }) => {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef()

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, MAX_IMAGES - formData.images.length)
    const updated = [...formData.images, ...newFiles]
    updateForm({ images: updated })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index)
    updateForm({ images: updated })
  }

  const setPrimary = (index) => {
    const updated = [...formData.images]
    const [selected] = updated.splice(index, 1)
    updated.unshift(selected)
    updateForm({ images: updated })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-4">Upload Images</h2>
      <p className="text-text-light mb-6">
        Upload up to {MAX_IMAGES} images. First image will be the cover.
      </p>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-primary bg-primary-50' : 'border-slate-200'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-text-light mx-auto mb-4" />
        <p className="text-text mb-2">Drag & drop images here, or click to select</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg mt-2"
        >
          Browse Files
        </button>
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {formData.images.map((file, idx) => (
            <div key={idx} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${idx}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => setPrimary(idx)}
                  className="p-1 bg-white rounded-full hover:bg-secondary"
                  title="Set as cover"
                >
                  <Star className="w-4 h-4 text-text" />
                </button>
                <button
                  onClick={() => removeImage(idx)}
                  className="p-1 bg-white rounded-full hover:bg-error"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-text" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          disabled={submitting}
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || formData.images.length === 0}
          className="bg-secondary hover:bg-secondary-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? 'Posting...' : 'Post Ad'}
        </button>
      </div>
    </div>
  )
}

export default StepImages