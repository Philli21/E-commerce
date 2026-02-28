import Hero from '../components/Hero'
import CategoryGrid from '../components/categories/CategoryGrid'
import ListingGrid from '../components/listings/ListingGrid'
import { Package, MessageCircle, ThumbsUp } from 'lucide-react'

const Home = () => {
  return (
    <>
      <Hero />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6">Popular Categories</h2>
          <CategoryGrid />
        </div>
      </section>
      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6">Recent Listings</h2>
          <ListingGrid />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Post an Ad</h3>
              <p className="text-text-light">List your item with photos and details</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Browse & Chat</h3>
              <p className="text-text-light">Find what you need and message sellers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Meet & Transact</h3>
              <p className="text-text-light">Arrange a safe meetup and complete the deal</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home