"use client"

import { useRouter } from "next/navigation"
import {  AlertTriangle } from "lucide-react"
import { useLanguage } from '@/hooks/useLanguage'



export default function NotFound() {
  const router = useRouter()
  const { t, isRtl } = useLanguage()



  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-x-hidden ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
   

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-8 relative">
              <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-blue-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <h1 className="text-6xl sm:text-8xl font-bold text-blue-800 mb-4">404</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('notFound_pageNotFound')}</h2>
            <p className="text-blue-800 max-w-lg mb-8">
              {t('notFound_oopsMessage')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-white border border-blue-200 text-blue-800 rounded-md hover:bg-blue-50 transition-colors font-medium shadow-sm"
              >
                {t('notFound_goBack')}
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors font-medium shadow-sm"
              >
                {t('notFound_returnToHome')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}