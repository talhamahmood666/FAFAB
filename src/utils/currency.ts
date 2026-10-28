/**
 * Multi-Currency Management & Exchange Rate Engine for FAFAB Limited ERP
 * Base Currency: PKR (Pakistani Rupee)
 * Supported Currencies: PKR, USD, GBP, EUR
 */

export type SupportedCurrency = 'PKR' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  rateToPKR: number; // How many PKR is 1 unit of this currency (e.g. 1 USD = 278.50 PKR)
  flag: string;
  locale: string;
}

export const DEFAULT_CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee (Base)',
    symbol: 'Rs.',
    rateToPKR: 1.0,
    flag: '🇵🇰',
    locale: 'en-PK',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rateToPKR: 278.50,
    flag: '🇺🇸',
    locale: 'en-US',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    rateToPKR: 352.10,
    flag: '🇬🇧',
    locale: 'en-GB',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rateToPKR: 298.40,
    flag: '🇪🇺',
    locale: 'de-DE',
  },
};

/**
 * Convert an amount from PKR to target currency
 */
export function convertFromPKR(amountInPKR: number, targetCurrency: SupportedCurrency, customRates?: Record<SupportedCurrency, number>): number {
  if (isNaN(amountInPKR) || amountInPKR === null || amountInPKR === undefined) return 0;
  if (targetCurrency === 'PKR') return amountInPKR;

  const rate = customRates?.[targetCurrency] || DEFAULT_CURRENCIES[targetCurrency]?.rateToPKR || 1;
  return amountInPKR / rate;
}

/**
 * Convert an amount from foreign currency to base PKR
 */
export function convertToPKR(amountInForeign: number, sourceCurrency: SupportedCurrency, customRates?: Record<SupportedCurrency, number>): number {
  if (isNaN(amountInForeign) || amountInForeign === null || amountInForeign === undefined) return 0;
  if (sourceCurrency === 'PKR') return amountInForeign;

  const rate = customRates?.[sourceCurrency] || DEFAULT_CURRENCIES[sourceCurrency]?.rateToPKR || 1;
  return amountInForeign * rate;
}

/**
 * Format raw currency number into formatted localized string with symbol
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'PKR',
  options: { showSymbol?: boolean; showCode?: boolean } = { showSymbol: true, showCode: false }
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${DEFAULT_CURRENCIES[currency].symbol} 0.00`;
  }

  const info = DEFAULT_CURRENCIES[currency] || DEFAULT_CURRENCIES.PKR;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parts: string[] = [];
  if (isNegative) parts.push('-');
  if (options.showSymbol !== false) parts.push(info.symbol);
  parts.push(formattedNumber);
  if (options.showCode) parts.push(info.code);

  return parts.join(' ');
}

/**
 * Convenience formatter that takes an amount in base PKR and formats it in the active display currency
 */
export function formatBasePKR(
  amountInPKR: number,
  displayCurrency: SupportedCurrency = 'PKR',
  customRates?: Record<SupportedCurrency, number>
): string {
  const converted = convertFromPKR(amountInPKR, displayCurrency, customRates);
  return formatCurrency(converted, displayCurrency, { showSymbol: true, showCode: displayCurrency !== 'PKR' });
}
