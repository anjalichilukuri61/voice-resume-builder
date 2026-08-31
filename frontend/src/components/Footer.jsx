import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} VoiceResume.ai. All rights reserved.
        </p>
        <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
          Built with <Heart className="h-4 w-4 text-red-500 mx-1" fill="currentColor" /> for your career
        </p>
      </div>
    </footer>
  );
};

export default Footer;
