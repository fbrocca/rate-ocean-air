
import { Booking } from '@/types/freight';
import { v4 as uuidv4 } from 'uuid';

export const mockBookings: Booking[] = [
  {
    id: uuidv4(),
    rateId: '1', // This will be replaced with actual rate IDs
    bookingDate: '2023-05-15',
    departureDate: '2023-06-10',
    status: 'confirmed',
    reference: 'BKG-1234567',
  },
  {
    id: uuidv4(),
    rateId: '2', // This will be replaced with actual rate IDs
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
