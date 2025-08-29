"use client"

import { useState } from "react"
import {   Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "../../hooks/useLanguage"
import AuthHeader from "@/components/AuthHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import useAuth from "@/hooks/useAuth"
import toast from "react-hot-toast"

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const { language, setLanguage, t, isRtl } = useLanguage()
  const router = useRouter()
  const { signIn: login, loading: isLoading } = useAuth()
  const toggleLanguage = (): void => {
    if (language === "fr") {
      setLanguage("ar")
    } else {
      setLanguage("fr")
    }
  }

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    let isValid: boolean = true

    // Email validation
    if (!email) {
      setEmailError(t('login_emailRequired'))
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('login_validEmail'))
      isValid = false
    } else {
      setEmailError("")
    }

    // Password validation
    if (!password) {
      setPasswordError(t('login_passwordRequired'))
      isValid = false
    } else if (password.length < 8) {
      setPasswordError(t('login_passwordLength'))
      isValid = false
    } else {
      setPasswordError("")
    }

    if (isValid) {
    try {
        const user = await login(email, password);
        if (user) {
            toast.success(t('login_success'));
            setTimeout(() => {
              router.push("/user");
            },1500)
        }
    } catch (error) {
        console.error("Login error:", error);
        toast.error(error instanceof Error ? error.message : "Login failed");
    }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
    if (emailError) setEmailError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
    if (passwordError) setPasswordError("")
  }

  return (
    <div
      className={`min-h-screen bg-white overflow-y-auto ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <AuthHeader toggleLanguage={toggleLanguage} language={language} router={router} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Left side - Login form - Full width on mobile */}
          <div
            className={`w-full md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 animate-fadeIn ${isRtl ? "md:order-2" : ""}`}
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('login_welcomeBack')}</h2>
                <p className="text-blue-800">{t('login_signInAccess')}</p>
              </div>

              <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('login_emailAddress')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login_emailPlaceholder')}
                    className={`h-12 px-4 py-3 bg-blue-50 border-blue-200 rounded-lg shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 ${
                      emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('login_password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`h-12 px-4 py-3 bg-blue-50 border-blue-200 rounded-lg shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 ${
                        passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      } ${isRtl ? "pl-12" : "pr-12"}`}
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`absolute top-1/2 -translate-y-1/2 h-8 w-8  text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded ${
                        isRtl ? "left-3" : "right-3"
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="!h-5 !w-5" /> : <Eye className="!h-5 !w-5" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{passwordError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={() => { setRememberMe(!rememberMe) }}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label 
                      htmlFor="remember" 
                      className="text-sm text-gray-700 cursor-pointer font-normal hover:text-gray-900 transition-colors duration-200"
                    >
                      {t('login_rememberMe')}
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {t('login_forgotPassword')}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      {t('login_signingIn')}
                    </>
                  ) : (
                    t('login_signIn')
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-blue-500 font-medium">{t('login_orContinueWith')}</span>
                </div>
              </div>

              

              <p className="text-center text-sm text-gray-600 mt-6">
                {t('login_dontHaveAccount')}{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 font-medium text-blue-800 hover:text-blue-900 transition-colors duration-200 text-sm"
                  disabled={isLoading}
                  onClick={() => router.push("/signup")}
                >
                  {t('login_signUp')}
                </Button>
              </p>
            </div>
          </div>

          {/* Right side - Tonobilti Showcase - Hidden on mobile, visible on md and up */}
         
        </div>
      </main>

      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-6 shadow-xl border border-blue-100">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 size={40} className="animate-spin text-blue-800" />
              <p className="font-medium text-gray-700">{t('login_authenticating')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage