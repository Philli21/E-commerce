import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

const SellerCard = ({ seller }) => {
  if (!seller) return null

  const joinDate = seller.created_at ? format(new Date(seller.created_at), 'MMMM yyyy') : 'Recently'

  return (
    <div className="bg-surface p-6 rounded-xl border border-slate-100">
      <h2 className="font-semibold text-text mb-4">Seller Information</h2>
      <div className="flex items-center gap-4">
        {seller.avatar_url ? (
          <img
            src={seller.avatar_url}
            alt={seller.full_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-xl">
            {seller.full_name?.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-text">{seller.full_name}</h3>
          <p className="text-text-light text-sm flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" />
            Member since {joinDate}
          </p>
        </div>
      </div>
      <Link
        to={`/profile/${seller.id}`}
        className="mt-4 block text-center border border-primary text-primary hover:bg-primary-50 py-2 rounded-lg transition"
      >
        View Profile
      </Link>
    </div>
  )
}

export default SellerCard