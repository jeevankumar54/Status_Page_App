import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-neutral-500">
          © {year} Status Page App. All rights reserved.
        </div>
        <div className="mt-2 sm:mt-0 text-xs text-neutral-400">
          Version 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;