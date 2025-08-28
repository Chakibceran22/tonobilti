// LanguageContext.tsx - ULTRA SIMPLE FIX - ONE FILE ONLY
"use client"
import { createContext, useState, useEffect, ReactNode } from "react"
import translations from "@/data/translations.json"

export type Language = 'ar' | 'fr'

export type TranslationKeys = keyof typeof translations.fr
export type TranslationFn = (key: TranslationKeys) => string
export type TranslationArrayFn = (key: TranslationKeys) => any[]

interface LanguageContextType {
  language: Language
  setLanguage: (newLanguage: Language) => void
  isClient: boolean
  isRtl: boolean
  t: (key: TranslationKeys) => string
  tArray: (key: TranslationKeys) => any[]
  tObject: (key: TranslationKeys) => any
}

export const LanguageContext = createContext<LanguageContextType | null>(null)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr')
  const [isClient, setIsClient] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  // Step 1: Mark as client-side and mounted
  useEffect(() => {
    setIsClient(true)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    try {
      const savedLanguage = localStorage.getItem('tonobilti-language')
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'fr')) {
        setLanguage(savedLanguage as Language)
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error)
    }
  }, [mounted])

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (isClient) {
      try {
        localStorage.setItem('tonobilti-language', newLanguage)
      } catch (error) {
        console.error('Error saving language to localStorage:', error)
      }
    }
  }

  // Update document attributes when language changes
  useEffect(() => {
    if (!isClient) return
    
    const html = document.documentElement
    if (language === 'ar') {
      html.setAttribute('dir', 'rtl')
      html.setAttribute('lang', 'ar')
    } else {
      html.setAttribute('dir', 'ltr')
      html.setAttribute('lang', 'fr')
    }
  }, [language, isClient])

  // STRING TRANSLATION - TypeScript will autocomplete and check keys
  const t = (key: TranslationKeys): string => {
    try {
      const value = translations[language][key]
      if (typeof value === 'string') {
        return value
      }
      if (value !== undefined) {
        return String(value)
      }
      console.warn(`Translation "${String(key)}" not found`)
      return String(key)
    } catch (error) {
      console.error(`Error translating "${String(key)}":`, error)
      return String(key)
    }
  }

  // ARRAY TRANSLATION - Always returns array, safe to map
  const tArray = (key: TranslationKeys): any[] => {
    try {
      const value = translations[language][key]
      if (Array.isArray(value)) {
        return value
      }
      if (value !== undefined) {
        console.warn(`Translation "${String(key)}" is not an array`)
      }
      return []
    } catch (error) {
      console.error(`Error getting array for "${String(key)}":`, error)
      return []
    }
  }

  // RAW TRANSLATION - Returns exactly what's in JSON
  const tObject = (key: TranslationKeys): any => {
    try {
      const value = translations[language][key]
      return value !== undefined ? value : null
    } catch (error) {
      console.error(`Error getting object for "${String(key)}":`, error)
      return null
    }
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    isClient,
    isRtl: language === 'ar',
    t,
    tArray,
    tObject
  }

  // PREVENT HYDRATION ISSUES - Don't render children until mounted
  if (!mounted) {
    return null
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}