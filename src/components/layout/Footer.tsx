import React from 'react';
import { Github, MessageCircle, Twitter, BookOpen, Users } from 'lucide-react';
import { SOCIAL_LINKS } from '@/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-4 col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-end space-x-2 sm:space-x-3">
              <img
                src="/rubix-icon.png"
                alt="Rubix Logo"
                className="h-6 sm:h-8 w-auto"
              />
              <span className="text-lg sm:text-xl font-bold text-heading flex items-end font-heading">
                Rubix Explorer
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Comprehensive blockchain explorer for the Rubix ecosystem.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-heading mb-3 sm:mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/search"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Search
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-heading mb-3 sm:mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-heading mb-3 sm:mb-4">
              Community
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href={SOCIAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.MEDIUM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.DISCORD}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Users className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-600 text-sm text-center sm:text-left">
              © {currentYear} Rubix Explorer. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors text-center sm:text-left"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors text-center sm:text-left"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
