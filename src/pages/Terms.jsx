// src/pages/Terms.jsx
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Midnight Bazaar</title>
        <meta name="description" content="Terms and conditions for using Midnight Bazaar." />
      </Helmet>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-text mb-6">Terms of Service</h1>
        <p className="text-text-light mb-4">Last updated: March 2026</p>
        <div className="prose prose-slate">
          <p>
            Welcome to Midnight Bazaar. By using our platform, you agree to these terms...
          </p>
          {/* Add full terms here */}
        </div>
      </div>
    </>
  );
};

export default Terms;