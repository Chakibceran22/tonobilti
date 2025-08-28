import React from 'react'
import { Globe } from 'lucide-react'
import { Language } from '@/providers/LanguageContext'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const AuthHeader = ({language, toggleLanguage, router} : { language: Language, toggleLanguage: () => void, router:AppRouterInstance}) => {
  return (
     <header className="bg-white shadow-md w-full sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-800 cursor-pointer" onClick={() => router.push("/")}>
              Tonobilti
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-500 hover:text-blue-800 transition-colors duration-300 flex items-center"
          >
            <Globe className="h-5 w-5 mx-1" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </button>
        </div>
      </header>
  )
}

export default AuthHeader