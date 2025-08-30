"use client";
import {   MapPin, Mail, Phone } from "lucide-react"
import { FaFacebook, FaInstagram, FaTiktok, FaChevronRight } from 'react-icons/fa'
import Link from "next/link"
import { TranslationFn } from "@/providers/LanguageContext"

const Footer = ({ t, isRtl }: { t: TranslationFn, isRtl: boolean }) => {
  
  return (
    <footer className="bg-gradient-to-br from-blue-900 to-blue-950 text-white py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Tonobilti</h3>
            <p className="text-blue-200 mb-4">{t('footer_findDream')}</p>
            <div className="flex space-x-4">
              <Link
                href=""
                className="h-10 w-10 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </Link>
              <Link
                href=""
                className="h-10 w-10 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </Link>
              <Link
                href=""
                className="h-10 w-10 rounded-full bg-blue-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer_quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <FaChevronRight
                    className={`h-4 w-4 mr-1 opacity-70 group-hover:translate-x-1 transition-transform duration-300 ${isRtl ? "rotate-180" : ""}`}
                  />
                  {t('footer_home')}
                </Link>
              </li>
              <li>
                <Link href="/user" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <FaChevronRight
                    className={`h-4 w-4 mr-1 opacity-70 group-hover:translate-x-1 transition-transform duration-300 ${isRtl ? "rotate-180" : ""}`}
                  />
                  {t('footer_vehicles')}
                </Link>
              </li>
              
              <li>
                <Link href="https://wa.me/message/TGUCWCSB54XKM1" className="text-blue-200 hover:text-white transition-colors flex items-center group">
                  <FaChevronRight
                    className={`h-4 w-4 mr-1 opacity-70 group-hover:translate-x-1 transition-transform duration-300 ${isRtl ? "rotate-180" : ""}`}
                  />
                  {t('footer_contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer_contactUs')}</h3>
            <address className="not-italic text-blue-200 space-y-2">
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-300" />
                Algerie, Alger
              </p>
              <p className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-300" />
                tonobilticars@gmail.com
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-300" />
                0781282376
              </p>
            </address>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-10 pt-8 text-center text-blue-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Tonobilti Collection. {t('footer_allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer