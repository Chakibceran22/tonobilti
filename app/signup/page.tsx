"use client"

import { useState } from "react"
import { Mail, Eye, EyeOff, Loader2, User, Store, Briefcase, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from '../../hooks/useLanguage'
import AuthHeader from "@/components/AuthHeader"
import useAuth from "@/hooks/useAuth"
import toast from "react-hot-toast"
type UserRole = "user" | "showroom" | "agent"
type HoveredCard = "showroom" | "agent" | null

interface FormData {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
  dealershipName: string
  type: UserRole
}

interface FormErrors {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
  dealershipName: string
  terms: string
}


// Language translations

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("user")
  const router = useRouter()
  const [termsChecked, setTermsChecked] = useState<boolean>(false)
  const { language, setLanguage, t, isRtl } = useLanguage() // Default to French as in login page
  // Add state to track hover for showroom and agent cards
  const [hoveredCard, setHoveredCard] = useState<HoveredCard>(null)
  const {loading: isLoading, signUp} = useAuth()


  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar")
    } else {
      setLanguage("fr")
    }
  }

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber:"",
    email: "",
    password: "",
    confirmPassword: "",
    dealershipName: "",
    type: selectedRole,
  })

  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    phoneNumber:"",
    email: "",
    password: "",
    confirmPassword: "",
    dealershipName: "",
    terms: "",
  })

  const validateForm = (): boolean => {
    let isValid: boolean = true
    const newErrors: FormErrors = {
      firstName: "",
      lastName: "",
      phoneNumber:"",
      email: "",
      password: "",
      confirmPassword: "",
      dealershipName: "",
      terms: "",
    }

    // First name validation
    if (formData.firstName.trim() === "") {
      newErrors.firstName = t('signup_firstNameRequired')
      isValid = false
    }

    // Last name validation
    if (formData.lastName.trim() === "") {
      newErrors.lastName = t('signup_lastNameRequired')
      isValid = false
    }
    if(formData.phoneNumber.trim() === ""){
      newErrors.phoneNumber = t('signup_phoneNumberRequired')
      isValid = false
    }

    // Email validation
    if (formData.email.trim() === "") {
      newErrors.email = t('signup_emailRequired')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('signup_validEmail')
      isValid = false
    }

    // Password validation
    if (formData.password === "") {
      newErrors.password = t('signup_passwordRequired')
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = t('signup_passwordLength')
      isValid = false
    }

    // Confirm password validation
    if (formData.confirmPassword === "") {
      newErrors.confirmPassword = t('signup_confirmPasswordRequired')
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup_passwordsDoNotMatch')
      isValid = false
    }

    // Dealership name validation (only if showroom is selected)
    if (selectedRole === "showroom" && formData.dealershipName.trim() === "") {
      newErrors.dealershipName = t('signup_dealershipNameRequired')
      isValid = false
    }

    // Terms validation
    if (!termsChecked) {
      newErrors.terms = t('signup_mustAgreeToTerms')
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChangeRole = (role: UserRole): void => {
    if (isLoading) return // Prevent changes while loading

    // Only allow selecting "user" role, show alert for others
    if (role === "showroom" || role === "agent") {
      alert(t('signup_featureNotUnlocked'))
      return
    }

    setSelectedRole(role)
    setFormData({ ...formData, type: role })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (validateForm()) {
      try {
          const user = await signUp(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName,
            formData.phoneNumber,
            formData.type
          )
          if(user){
            toast.success("Succeffully created")
          }
      } catch (error) {
        console.error("Signup failed:", error)
        toast.error((error as Error).message || " error for now ")
      } 
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  return (
    <div className={`min-h-screen  overflow-y-auto ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <AuthHeader toggleLanguage={toggleLanguage} language={language} router={router} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Signup form - Full width on mobile */}
          <div
            className={`w-full md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 animate-fadeIn ${isRtl ? "md:order-2" : ""}`}
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('signup_createAccount')}</h2>
                <p className="text-blue-800">{t('signup_signupAccess')}</p>
              </div>

              {/* Account Type Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-gray-700">{t('signup_registeringAs')}</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div
                    className={`flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-all duration-200 ${!isLoading ? "hover:border-blue-500 hover:shadow-md" : ""} ${selectedRole === "user" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"} ${isLoading ? "opacity-75" : ""}`}
                    onClick={() => handleChangeRole("user")}
                  >
                    <div
                      className={`mb-2 rounded-full p-2 ${selectedRole === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      <User className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-medium">{t('signup_customer')}</h3>
                    <input
                      type="radio"
                      name="accountType"
                      value="user"
                      checked={selectedRole === "user"}
                      onChange={() => handleChangeRole("user")}
                      className="sr-only"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Showroom option with locked overlay */}
                  <div
                    className={`flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-all duration-200 relative ${!isLoading ? "hover:border-blue-500 hover:shadow-md" : ""} ${selectedRole === "showroom" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"} ${isLoading ? "opacity-75" : ""}`}
                    onClick={() => handleChangeRole("showroom")}
                    onMouseEnter={() => setHoveredCard("showroom")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`mb-2 rounded-full p-2 ${selectedRole === "showroom" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Store className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-medium">{t('signup_showroom')}</h3>
                    <input
                      type="radio"
                      name="accountType"
                      value="showroom"
                      checked={selectedRole === "showroom"}
                      onChange={() => handleChangeRole("showroom")}
                      className="sr-only"
                      disabled={isLoading}
                    />

                    {/* Locked overlay */}
                    <div
                      className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-300 rounded-lg ${
                        hoveredCard === "showroom" ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <div className="text-center p-2">
                        <div className="bg-blue-800 rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-white text-xs font-medium">{t('signup_featureNotUnlocked')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent option with locked overlay */}
                  <div
                    className={`flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-all duration-200 relative ${!isLoading ? "hover:border-blue-500 hover:shadow-md" : ""} ${selectedRole === "agent" ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"} ${isLoading ? "opacity-75" : ""}`}
                    onClick={() => handleChangeRole("agent")}
                    onMouseEnter={() => setHoveredCard("agent")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`mb-2 rounded-full p-2 ${selectedRole === "agent" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-medium">{t('signup_salesAgent')}</h3>
                    <input
                      type="radio"
                      name="accountType"
                      value="agent"
                      checked={selectedRole === "agent"}
                      onChange={() => handleChangeRole("agent")}
                      className="sr-only"
                      disabled={isLoading}
                    />

                    {/* Locked overlay */}
                    <div
                      className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity duration-300 rounded-lg ${
                        hoveredCard === "agent" ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <div className="text-center p-2">
                        <div className="bg-blue-800 rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-white text-xs font-medium">{t('signup_featureNotUnlocked')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      {t('signup_firstName')}
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      placeholder="John"
                      className={`w-full rounded-lg border ${errors.firstName ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                      disabled={isLoading}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      {t('signup_lastName')}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      className={`w-full rounded-lg border ${errors.lastName ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                      disabled={isLoading}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    {t('signup_phoneNumber')}
                  </label>
                  <input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    type="text"
                    placeholder={t('signup_phoneNumberPlaceholder')}
                    className={`w-full rounded-lg border ${errors.phoneNumber ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                    disabled={isLoading}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('signup_emailAddress')}
                  </label>
                  <input
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    type="email"
                    placeholder={t('signup_emailPlaceholder')}
                    className={`w-full rounded-lg border ${errors.email ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Conditional fields based on role */}
                {selectedRole === "showroom" && (
                  <div className="space-y-2">
                    <label htmlFor="dealershipName" className="text-sm font-medium text-gray-700">
                      {t('signup_dealershipName')}
                    </label>
                    <input
                      id="dealershipName"
                      type="text"
                      value={formData.dealershipName}
                      onChange={handleInputChange('dealershipName')}
                      placeholder="Tonobilti Group"
                      className={`w-full rounded-lg border ${errors.dealershipName ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                      disabled={isLoading}
                    />
                    {errors.dealershipName && <p className="mt-1 text-sm text-red-600">{errors.dealershipName}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('signup_password')}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full rounded-lg border ${errors.password ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className={`absolute top-1/2 -translate-y-1/2 text-blue-500 transition-colors duration-200 hover:text-blue-600 ${isRtl ? "left-3" : "right-3"}`}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-gray-500">{t('signup_passwordRequirement')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {t('signup_confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full rounded-lg border ${errors.confirmPassword ? "border-red-500" : "border-blue-200"} px-4 py-3 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className={`absolute top-1/2 -translate-y-1/2 text-blue-500 transition-colors duration-200 hover:text-blue-600 ${isRtl ? "left-3" : "right-3"}`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsChecked}
                      onChange={() => setTermsChecked(!termsChecked)}
                      className={`h-4 w-4 mx-2 rounded border-${errors.terms ? "red-500" : "blue-300"} text-blue-800 focus:ring-blue-500`}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className={`font-medium ${errors.terms ? "text-red-600" : "text-gray-700"}`}>
                      {t('signup_agreeToTerms')}{" "}
                      <a href="#" className="text-blue-800 hover:text-blue-800" tabIndex={isLoading ? -1 : 0}>
                        {t('signup_termsOfService')}
                      </a>{" "}
                      {t('signup_and')}{" "}
                      <a href="#" className="text-blue-800 hover:text-blue-800" tabIndex={isLoading ? -1 : 0}>
                        {t('signup_privacyPolicy')}
                      </a>
                    </label>
                    {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-3 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className={`${isRtl ? "ml-2" : "mr-2"} animate-spin`} />
                      {t('signup_creatingAccount')}
                    </>
                  ) : (
                    t('signup_createAccountButton')
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-blue-500">{t('signup_orContinueWith')}</span>
                </div>
              </div>

              

              <p className="text-center text-sm text-gray-600 mt-6">
                {t('signup_alreadyHaveAccount')}{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-800 transition-colors duration-200 hover:text-blue-800"
                  tabIndex={isLoading ? -1 : 0}
                >
                  {t('signup_signIn')}
                </a>
              </p>
            </div>
          </div>

          
        </div>
      </main>

      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-xl border border-blue-100">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 size={40} className="animate-spin text-blue-800" />
              <p className="font-medium text-gray-700">{t('signup_creating')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignupPage