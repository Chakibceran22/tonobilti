"use client";

import { useRouter} from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Globe, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from '@/hooks/useAuth';
import logoImage from "@/public/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { language, setLanguage, isRtl, t } = useLanguage();
  const { user, loading: loadingUser, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper functions to safely get user data
  const getUserFullName = () => {
    if (!user) return "User";
    return user.user_metadata?.full_name || 
           user.user_metadata?.full_name || 
           `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim() ||
           user.email?.split('@')[0] || 
           "User";
  };

  const getUserInitials = () => {
    const fullName = getUserFullName();
    if (fullName === "User") return "U";
    
    const names = fullName.split(" ").filter((name: string) => name.length > 0);
    if (names.length === 0) return "U";
    if (names.length === 1) return names[0][0].toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    if (language === "fr") {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // FIRST: Loading state header
  if (loadingUser) {
    return (
      <header className="bg-white shadow-md w-full sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between h-16 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Logo - Same as your design */}
            <div className="flex items-center">
              <div className="flex items-center">
                <Image
                  src={logoImage}
                  alt="Tonobilti Logo"
                  width={96}
                  height={96}
                  quality={100}
                  className="w-20 h-20 sm:w-26 sm:h-26"
                  priority
                />
              </div>
            </div>

            {/* Center - Skeleton navigation */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="hidden md:flex space-x-8">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    style={{ width: `${60 + Math.random() * 40}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Right side - Skeleton buttons */}
            <div className="flex items-center space-x-4">
              {/* Language toggle skeleton */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-6 h-3 bg-gray-300 rounded animate-pulse"></div>
              </div>

              {/* Desktop buttons skeleton */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-blue-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Mobile menu button skeleton */}
              <div className="md:hidden w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="absolute left-0 right-0 bottom-0">
            <div className="h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-600 animate-loading-bar"></div>
            </div>
          </div>
        </div>

        {/* Add the loading bar animation style */}
        <style jsx>{`
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
        `}</style>
      </header>
    );
  }

  // SECOND: Public pages or no user
  if (!user) {
    return (
      <header
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer">
                <Image
                  src={logoImage}
                  alt="Tonobilti Logo"
                  width={96}
                  height={96}
                  quality={100}
                  className="w-20 h-20 sm:w-26 sm:h-26 "
                  priority
                />
              </div>
            </div>

            {/* Centered Navigation */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <nav className="hidden md:flex space-x-8">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_home")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/user"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_vehicles")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/learn-more"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_learnMore")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_about")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>
            </div>

            {/* Right-aligned Buttons */}
            <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-xs font-medium">
                  {language.toUpperCase()}
                </span>
              </button>

              <Link
                href={"/login"}
                className="hidden md:block px-4 py-2 text-gray-700 font-medium hover:text-blue-800 transition-colors duration-300"
              >
                {t("header_login")}
              </Link>

              <Link
                href={"/signup"}
                className="hidden md:block px-4 py-2 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {t("header_signup")}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300"
              >
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 animate-fadeIn">
              <nav className="flex flex-col space-y-3 pb-3">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-800 font-medium py-2 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_home")}
                </Link>
                <Link
                  href="/user"
                  className="text-gray-700 hover:text-blue-800 font-medium py-2 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_vehicles")}
                </Link>
                <Link
                  href="/learn-more"
                  className="text-gray-700 hover:text-blue-800 font-medium py-2 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_learnMore")}
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-800 font-medium py-2 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_about")}
                </Link>
              </nav>
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                <Link
                  href={"/login"}
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                  className="py-2 text-gray-700 font-medium hover:text-blue-800 transition-colors duration-300"
                >
                  {t("header_login")}
                </Link>
                <Link
                  href={"/signup"}
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                  className="py-2 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-sm hover:shadow-md text-center"
                >
                  {t("header_signup")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // THIRD: Logged in state - FIXED WITH CONSISTENT STYLING
  if (user) {
    return (
      <header
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer">
                <Image
                  src={logoImage}
                  alt="Tonobilti Logo"
                  width={96}
                  height={96}
                  quality={100}
                  className="w-20 h-20 sm:w-26 sm:h-26"
                  priority
                />
              </div>
            </div>

            {/* Centered Navigation */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <nav className="hidden md:flex space-x-8">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_home")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/user"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_vehicles")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/learn-more"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_learnMore")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-300 relative group text-center"
                >
                  {t("header_about")}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>
            </div>

            {/* Right-aligned Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-xs font-medium">
                  {language.toUpperCase()}
                </span>
              </button>

              {/* Desktop User Menu */}
              <div className="relative hidden md:block">
                <button
                  className={`flex items-center cursor-pointer ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <div className="h-10 w-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                    {getUserInitials()}
                  </div>
                  <div className={`ml-3 hidden sm:block`}>
                    <p className={`text-sm font-medium text-gray-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {getUserFullName()}
                    </p>
                    <p className={`text-xs text-blue-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {t("header_member")}
                    </p>
                  </div>
                  <ChevronDown className={`ml-2 h-4 w-4 text-gray-500`} />
                </button>
                {menuOpen && (
                  <div
                    dir={isRtl ? "rtl" : "ltr"}
                    ref={menuRef}
                    className={`absolute mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-blue-100 overflow-hidden z-[9999] ${
                      isRtl ? "left-0" : "right-0"
                    }`}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ${
                          isRtl ? "text-right" : "text-left"
                        }`}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("header_yourProfile")}
                      </Link>
                     
                      <button
                        className={`block w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ${
                          isRtl ? "text-right" : "text-left"
                        }`}
                        role="menuitem"
                        onClick={() => {
                          handleSignOut();
                          setMenuOpen(false);
                        }}
                      >
                        {t("header_signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300"
              >
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu for Logged In Users */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1 mb-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-800 font-medium py-3 px-2 transition-colors duration-300 rounded-lg hover:bg-blue-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_home")}
                </Link>
                <Link
                  href="/user"
                  className="text-gray-700 hover:text-blue-800 font-medium py-3 px-2 transition-colors duration-300 rounded-lg hover:bg-blue-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_vehicles")}
                </Link>
                <Link
                  href="/learn-more"
                  className="text-gray-700 hover:text-blue-800 font-medium py-3 px-2 transition-colors duration-300 rounded-lg hover:bg-blue-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_learnMore")}
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-blue-800 font-medium py-3 px-2 transition-colors duration-300 rounded-lg hover:bg-blue-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("header_about")}
                </Link>
              </nav>
              
              {/* Mobile User Menu Section */}
              <div className="pt-4 border-t border-gray-100">
                <div className={`flex items-center mb-4 px-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="h-12 w-12 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-lg flex-shrink-0">
                    {getUserInitials()}
                  </div>
                  <div className={`${isRtl ? 'mr-3' : 'ml-3'} min-w-0 flex-1`}>
                    <p className={`text-sm font-semibold text-gray-900 truncate ${isRtl ? 'text-right' : 'text-left'}`}>
                      {getUserFullName()}
                    </p>
                    <p className={`text-xs text-blue-600 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {t("header_member")}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className={`block py-3 px-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors rounded-lg ${isRtl ? 'text-right' : 'text-left'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("header_yourProfile")}
                  </Link>
                  
                  <button
                    className={`block w-full py-3 px-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg ${isRtl ? 'text-right' : 'text-left'}`}
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                  >
                    {t("header_signOut")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  return null;
};

export default Header;