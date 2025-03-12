
export type FreightMode = 'ocean' | 'air';

export type ChargeName = 
  | 'Basic Freight' 
  | 'BAF (Bunker Adjustment Factor)' 
  | 'CAF (Currency Adjustment Factor)' 
  | 'Documentation Fee'
  | 'Terminal Handling Charges'
  | 'Security Fee'
  | 'Customs Clearance'
  | 'Inland Transportation'
  | 'Insurance'
  | 'Warehousing'
  | 'Container Freight Station'
  | 'Port Congestion Surcharge'
  | 'Peak Season Surcharge'
  | 'War Risk Surcharge'
  | 'Low Sulfur Surcharge'
  | 'Equipment Imbalance Surcharge';

export interface Charge {
  name: ChargeName;
  included: boolean;
  amount?: number;
  currency: string;
}

export type RateType = 'contract' | 'spot';

export interface FreightRate {
  id: string;
  mode: FreightMode;
  type: RateType;
  origin: string;
  destination: string;
  carrier: string;
  validFrom: string;
  validTo: string;
  transitTime: number; // in days
  baseRate: number;
  currency: string;
  containerType?: string; // for ocean freight
  charges: Charge[];
  totalRate: number;
}

export interface Booking {
  id: string;
  rateId: string;
  bookingDate: string;
  departureDate: string;
  status: 'pending' | 'confirmed' | 'canceled';
  reference: string;
}
