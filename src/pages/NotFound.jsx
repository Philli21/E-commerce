// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-2xl text-text mb-6">Page not found</p>
      <p className="text-text-light mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-600 transition"
      >
        <Home size={20} />
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;