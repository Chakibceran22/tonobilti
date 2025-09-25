import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { TranslationFn } from '@/providers/LanguageContext';

interface PromoCodeSectionProps {
  isRtl?: boolean;
  t?: TranslationFn
  currentPromoCode?: string;
  currentPromoDiscount?: number;
  onPromoApplied?: (code: string, discount: number, label: string) => void;
  onPromoRemoved?: () => void;
}

interface PromoCode {
  discount: number;
  type: 'fixed' | 'percentage';
  label: string;
}

const PromoCodeSection: React.FC<PromoCodeSectionProps> = ({ 
  isRtl = false, 
  t = (key: string) => key,
  currentPromoCode = '',
  currentPromoDiscount = 0,
  onPromoApplied,
  onPromoRemoved
}) => {
  const [promoCode, setPromoCode] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');

  // Mock promo codes for UI demonstration
  const mockPromoCodes: Record<string, PromoCode> = {
    'WELCOME10': { discount: 10000, type: 'fixed', label: 'Réduction Bienvenue' },
    'SAVE5PERCENT': { discount: 5, type: 'percentage', label: 'Réduction 5%' },
    'FREESHIP': { discount: 50000, type: 'fixed', label: 'Livraison Offerte' }
  };

  const handleApplyPromo = async (): Promise<void> => {
    if (!promoCode.trim()) return;

    setIsApplying(true);
    setPromoError('');
    
    // Simulate API call
    setTimeout(() => {
      const promo = mockPromoCodes[promoCode.toUpperCase()];
      if (promo) {
        setPromoError('');
        setPromoCode('');
        // Call parent callback to update formData
        if (onPromoApplied) {
          onPromoApplied(promoCode.toUpperCase(), promo.discount, promo.label);
        }
      } else {
        setPromoError('Code promo invalide');
      }
      setIsApplying(false);
    }, 1000);
  };

  const handleRemovePromo = (): void => {
    setPromoCode('');
    setPromoError('');
    // Call parent callback to clear promo data
    if (onPromoRemoved) {
      onPromoRemoved();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromo();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoError('');
  };

  const handlePromoCodeClick = (code: string): void => {
    setPromoCode(code);
  };

  // Get the applied promo details for display
  const getAppliedPromoLabel = () => {
    if (!currentPromoCode) return '';
    const promo = mockPromoCodes[currentPromoCode];
    return promo ? promo.label : 'Code Appliqué';
  };

  const getAppliedPromoType = () => {
    if (!currentPromoCode) return 'fixed';
    const promo = mockPromoCodes[currentPromoCode];
    return promo ? promo.type : 'fixed';
  };

  return (
    <div className="pt-2">
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {t('promocode_label')}
        </label>
        
        {!currentPromoCode ? (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={promoCode}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('promocode_placeholder')}
                className={`w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 ${
                  isRtl 
                    ? "text-right pr-10 pl-3" 
                    : "pl-10 pr-3"
                }`}
                disabled={isApplying}
              />
              <Tag className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-800 ${
                isRtl ? "right-3" : "left-3"
              }`} />
            </div>
            
            {promoError && (
              <p className="text-xs text-red-600">{t('promocode_error')}</p>
            )}
            
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplying}
              className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                promoCode.trim() && !isApplying
                  ? "bg-blue-800 text-white hover:bg-blue-900"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isApplying ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('promocode_applying')}
                </span>
              ) : (
                t('promocode_apply_button')
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {t('promocode_applied_label')}
                  </p>
                  <p className="text-xs text-green-600">
                    {t('promocode_code')} {currentPromoCode}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-green-200">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">{t('promocode_discount')}</span>
                <span className="font-medium text-green-800">
                  {getAppliedPromoType() === 'percentage' 
                    ? `-${currentPromoDiscount}%`
                    : `-${currentPromoDiscount.toLocaleString()} DZD`
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default PromoCodeSection;