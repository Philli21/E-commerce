// src/pages/Privacy.jsx
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Midnight Bazaar</title>
        <meta name="description" content="Privacy policy for Midnight Bazaar." />
      </Helmet>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-text mb-6">Privacy Policy</h1>
        <p className="text-text-light mb-4">Last updated: March 2026</p>
        <div className="prose prose-slate">
          <p>
            Your privacy is important to us. This policy explains how we collect and use your data...
          </p>
          {/* Add full privacy policy here */}
        </div>
      </div>
    </>
  );
};

export default Privacy;