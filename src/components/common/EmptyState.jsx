// src/components/common/EmptyState.jsx
import { Package } from 'lucide-react';

const EmptyState = ({ icon: Icon = Package, title, message, action }) => (
  <div className="text-center py-12 px-4">
    <Icon className="w-16 h-16 mx-auto text-text-light mb-4" />
    <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
    <p className="text-text-light mb-6">{message}</p>
    {action}
  </div>
);

export default EmptyState;