// Conversion constant from CV to KW
const CV_TO_KW = 0.735499;

export const convertCVtoKW = (cv: number): number => {
  return Math.round(cv * CV_TO_KW);
};

export const calculateVehicleAge = (immatricolazione: string): number => {
  const today = new Date();
  const dateImmatricolazione = new Date(immatricolazione);
  return today.getFullYear() - dateImmatricolazione.getFullYear();
};

export const calculateBaseAmount = (kw: number, age: number): number => {
  if (kw <= 185 || age > 15) return 0;
  
  const extraKW = kw - 185;
  const baseAmount = extraKW * 20;
  
  // Apply age-based reductions
  if (age <= 5) return baseAmount;
  if (age <= 10) return baseAmount * 0.6;
  if (age <= 15) return baseAmount * 0.3;
  
  return 0;
};

export const calculatePenalty = (amount: number, daysLate: number): number => {
  if (daysLate <= 0) return 0;
  
  if (daysLate <= 15) {
    return amount * (0.001 * daysLate);
  }
  if (daysLate <= 30) {
    return amount * 0.015;
  }
  if (daysLate <= 90) {
    return amount * 0.0167;
  }
  if (daysLate <= 365) {
    return amount * 0.0375;
  }
  return amount * 0.05;
};

export const calculateInterest = (
  amount: number, 
  startDate: string, 
  endDate: string = new Date().toISOString()
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let totalInterest = 0;
  let currentDate = new Date(start);
  
  while (currentDate < end) {
    const year = currentDate.getFullYear();
    const daysInYear = currentDate.getFullYear() % 4 === 0 ? 366 : 365;
    const yearEndDate = new Date(Math.min(end.getTime(), new Date(year, 11, 31).getTime()));
    const daysInPeriod = (yearEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Get interest rate based on year
    let rate;
    switch (year) {
      case 2023:
        rate = 0.05;
        break;
      case 2024:
        rate = 0.025;
        break;
      default:
        rate = 0.02; // 2025 and beyond
    }
    
    totalInterest += (amount * rate * daysInPeriod) / daysInYear;
    currentDate = new Date(year + 1, 0, 1);
  }
  
  return Math.round(totalInterest * 100) / 100;
};

