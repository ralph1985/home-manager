export type HomeInsuranceCoverage = {
  dwellingEur?: number | null;
  contentsEur?: number | null;
  jewelryEur?: number | null;
  aestheticDwellingEur?: number | null;
  aestheticContentsEur?: number | null;
  liabilityEur?: number | null;
  legalDefenseEur?: number | null;
};

export type HomeInsuranceReceipt = {
  basePremiumEur?: number | null;
  legalDefensePremiumEur?: number | null;
  consortiumEur?: number | null;
  taxesEur?: number | null;
  totalEur?: number | null;
};

export type HomeInsurancePayment = {
  method?: string | null;
  frequency?: string | null;
  cardMasked?: string | null;
};

export type HomeInsuranceLoyalty = {
  trebolesAccumulated?: number | null;
  conversion?: string | null;
  minimumDiscount?: number | null;
};

export type HomeInsuranceDetails = {
  documentCountry?: string | null;
  coverages?: HomeInsuranceCoverage | null;
  receipt?: HomeInsuranceReceipt | null;
  payment?: HomeInsurancePayment | null;
  loyalty?: HomeInsuranceLoyalty | null;
};

export interface HomeInsurancePolicy {
  id: number;
  homeId: number;
  insurer: string;
  product: string;
  policyNumber: string;
  documentStatus: string;
  issueDate: Date | null;
  effectiveDate: Date;
  expiryDate: Date;
  receiptStart: Date | null;
  receiptEnd: Date | null;
  revaluationPct: number | null;
  premiumTotal: number | null;
  paymentMethod: string | null;
  paymentFrequency: string | null;
  documentUrl: string | null;
  riskAddressLine: string | null;
  riskPostalCode: string | null;
  riskCity: string | null;
  details: HomeInsuranceDetails | null;
  createdAt: Date;
  updatedAt: Date;
}
