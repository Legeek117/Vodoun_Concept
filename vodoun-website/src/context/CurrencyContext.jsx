import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

// Taux de conversion par rapport au FCFA
const RATES = {
  FCFA: 1,
  EUR: 0.001524,  // 1 FCFA ≈ 0.001524 EUR
  USD: 0.001667,  // 1 FCFA ≈ 0.001667 USD
};

const SYMBOLS = {
  FCFA: 'FCFA',
  EUR: '€',
  USD: '$',
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('FCFA');

  const formatPrice = (priceFCFA) => {
    const converted = priceFCFA * RATES[currency];
    if (currency === 'FCFA') {
      return `${priceFCFA.toLocaleString('fr-FR')} FCFA`;
    }
    return `${SYMBOLS[currency]}${converted.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, SYMBOLS }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
