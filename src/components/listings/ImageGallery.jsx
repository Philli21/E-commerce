import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * Image gallery with thumbnails and lightbox.
 * @param {Array} images - Array of image objects with image_url and is_primary.
 * @returns {JSX.Element}
 */
const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images.find(img => img.is_primary)?.image_url || images[0]?.image_url)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images.length) {
    return <div className="w-full h-96 bg-slate-200 rounded-lg flex items-center justify-center">No images</div>
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main image */}
        <div
          className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in"
          onClick={() => openLightbox(images.findIndex(img => img.image_url === mainImage))}
        >
          <img src={mainImage} alt="Listing" className="w-full h-full object-cover" />
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img.image_url)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${
                mainImage === img.image_url ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img.image_url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={prevImage}
            className="absolute left-4 text-white p-2"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={images[lightboxIndex]?.image_url}
            alt="Lightbox"
            className="max-h-full max-w-full object-contain"
          />
          <button
            onClick={nextImage}
            className="absolute right-4 text-white p-2"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  )
}

export default ImageGallery