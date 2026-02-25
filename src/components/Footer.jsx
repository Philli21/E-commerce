/**
 * Simple footer
 * @returns {JSX.Element}
 */
const Footer = () => {
  return (
    <footer className="bg-surface border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-light">
        <p>&copy; {new Date().getFullYear()} Midnight Bazaar. All rights reserved.</p>
        <p className="text-sm mt-1">Connecting Ethiopian buyers and sellers.</p>
      </div>
    </footer>
  )
}

export default Footer