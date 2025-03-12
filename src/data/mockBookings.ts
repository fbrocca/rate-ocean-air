
import { Booking } from '@/types/freight';
import { v4 as uuidv4 } from 'uuid';
import { mockRates } from './mockRates';

// Use actual rate IDs from mockRates
const validRateIds = mockRates.map(rate => rate.id);

export const mockBookings: Booking[] = [
  {
    id: uuidv4(),
    rateId: validRateIds[0], // Use a valid rate ID
    bookingDate: '2023-05-15',
    departureDate: '2023-06-10',
    status: 'confirmed',
    reference: 'BKG-1234567',
  },
  {
    id: uuidv4(),
    rateId: validRateIds[1], // Use a valid rate ID
    bookingDate: '2023-05-20',
    departureDate: '2023-06-15',
    status: 'pending',
    reference: 'BKG-7654321',
  },
];

export const addBooking = (booking: Omit<Booking, 'id' | 'reference'>): Booking => {
  const newBooking: Booking = {
    id: uuidv4(),
    reference: `BKG-${Math.floor(Math.random() * 10000000)}`,
    ...booking,
  };
  
  mockBookings.push(newBooking);
  return newBooking;
};

export const getBookings = (): Booking[] => {
  return mockBookings;
};

export const getBooking = (id: string): Booking | undefined => {
  return mockBookings.find(booking => booking.id === id);
};
