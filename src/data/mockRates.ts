
import { FreightRate } from '@/types/freight';
import { v4 as uuidv4 } from 'uuid';

export const mockRates: FreightRate[] = [
  // Ocean Contract Rates
  {
    id: uuidv4(),
    mode: 'ocean',
    type: 'contract',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, USA',
    carrier: 'Maersk Line',
    validFrom: '2023-01-01',
    validTo: '2023-12-31',
    transitTime: 18,
    baseRate: 2500,
    currency: 'USD',
    containerType: '40ft High Cube',
    charges: [
      { name: 'Basic Freight', included: true, currency: 'USD' },
      { name: 'BAF (Bunker Adjustment Factor)', included: true, amount: 250, currency: 'USD' },
      { name: 'Documentation Fee', included: true, amount: 75, currency: 'USD' },
      { name: 'Terminal Handling Charges', included: false, amount: 150, currency: 'USD' },
      { name: 'Security Fee', included: true, amount: 45, currency: 'USD' },
      { name: 'Customs Clearance', included: false, amount: 200, currency: 'USD' },
      { name: 'Inland Transportation', included: false, amount: 350, currency: 'USD' },
    ],
    totalRate: 2870,
  },
  {
    id: uuidv4(),
    mode: 'ocean',
    type: 'contract',
    origin: 'Rotterdam, Netherlands',
    destination: 'New York, USA',
    carrier: 'MSC',
    validFrom: '2023-01-01',
    validTo: '2023-12-31',
    transitTime: 12,
    baseRate: 1800,
    currency: 'USD',
    containerType: '20ft Standard',
    charges: [
      { name: 'Basic Freight', included: true, currency: 'USD' },
      { name: 'BAF (Bunker Adjustment Factor)', included: true, amount: 180, currency: 'USD' },
      { name: 'Documentation Fee', included: true, amount: 65, currency: 'USD' },
      { name: 'Terminal Handling Charges', included: true, amount: 120, currency: 'USD' },
      { name: 'Security Fee', included: true, amount: 40, currency: 'USD' },
      { name: 'Customs Clearance', included: false, amount: 180, currency: 'USD' },
      { name: 'Inland Transportation', included: false, amount: 250, currency: 'USD' },
    ],
    totalRate: 2205,
  },
  
  // Ocean Spot Rates
  {
    id: uuidv4(),
    mode: 'ocean',
    type: 'spot',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, USA',
    carrier: 'CMA CGM',
    validFrom: '2023-06-01',
    validTo: '2023-06-30',
    transitTime: 19,
    baseRate: 3200,
    currency: 'USD',
    containerType: '40ft High Cube',
    charges: [
      { name: 'Basic Freight', included: true, currency: 'USD' },
      { name: 'BAF (Bunker Adjustment Factor)', included: true, amount: 320, currency: 'USD' },
      { name: 'Documentation Fee', included: true, amount: 80, currency: 'USD' },
      { name: 'Terminal Handling Charges', included: false, amount: 180, currency: 'USD' },
      { name: 'Peak Season Surcharge', included: true, amount: 150, currency: 'USD' },
      { name: 'Security Fee', included: true, amount: 50, currency: 'USD' },
      { name: 'Customs Clearance', included: false, amount: 200, currency: 'USD' },
    ],
    totalRate: 3800,
  },
  
  // Air Contract Rates
  {
    id: uuidv4(),
    mode: 'air',
    type: 'contract',
    origin: 'Hong Kong, China',
    destination: 'Frankfurt, Germany',
    carrier: 'Lufthansa Cargo',
    validFrom: '2023-01-01',
    validTo: '2023-12-31',
    transitTime: 3,
    baseRate: 4.5, // per kg
    currency: 'USD',
    charges: [
      { name: 'Basic Freight', included: true, currency: 'USD' },
      { name: 'Security Fee', included: true, amount: 0.15, currency: 'USD' },
      { name: 'Fuel Surcharge', included: true, amount: 0.8, currency: 'USD' },
      { name: 'Terminal Handling Charges', included: true, amount: 0.25, currency: 'USD' },
      { name: 'Documentation Fee', included: false, amount: 45, currency: 'USD' },
      { name: 'Customs Clearance', included: false, amount: 120, currency: 'USD' },
    ],
    totalRate: 5.7,
  },
  
  // Air Spot Rates
  {
    id: uuidv4(),
    mode: 'air',
    type: 'spot',
    origin: 'Seoul, South Korea',
    destination: 'Chicago, USA',
    carrier: 'Korean Air Cargo',
    validFrom: '2023-06-01',
    validTo: '2023-06-15',
    transitTime: 2,
    baseRate: 5.8, // per kg
    currency: 'USD',
    charges: [
      { name: 'Basic Freight', included: true, currency: 'USD' },
      { name: 'Security Fee', included: true, amount: 0.2, currency: 'USD' },
      { name: 'Fuel Surcharge', included: true, amount: 1.1, currency: 'USD' },
      { name: 'Terminal Handling Charges', included: true, amount: 0.3, currency: 'USD' },
      { name: 'Documentation Fee', included: true, amount: 60, currency: 'USD' },
      { name: 'Customs Clearance', included: false, amount: 150, currency: 'USD' },
      { name: 'Peak Season Surcharge', included: true, amount: 0.4, currency: 'USD' },
    ],
    totalRate: 7.8,
  },
];

export const getFilteredRates = (
  mode?: FreightMode, 
  type?: RateType, 
  origin?: string, 
  destination?: string
): FreightRate[] => {
  return mockRates.filter(rate => {
    if (mode && rate.mode !== mode) return false;
    if (type && rate.type !== type) return false;
    if (origin && !rate.origin.toLowerCase().includes(origin.toLowerCase())) return false;
    if (destination && !rate.destination.toLowerCase().includes(destination.toLowerCase())) return false;
    return true;
  });
};

export const getRate = (id: string): FreightRate | undefined => {
  return mockRates.find(rate => rate.id === id);
};

export type FreightMode = 'ocean' | 'air';
export type RateType = 'contract' | 'spot';
