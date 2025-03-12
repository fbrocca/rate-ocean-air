
import React, { useEffect, useState } from 'react';
import { getBookings } from '@/data/mockBookings';
import { getRate } from '@/data/mockRates';
import { Booking, FreightRate } from '@/types/freight';
import Header from '@/components/Header';
import BookingCard from '@/components/BookingCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<{ booking: Booking; rate: FreightRate }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch bookings and their rates
    const allBookings = getBookings();
    const bookingsWithRates = allBookings
      .map(booking => {
        const rate = getRate(booking.rateId);
        return rate ? { booking, rate } : null;
      })
      .filter((item): item is { booking: Booking; rate: FreightRate } => item !== null);
    
    setBookings(bookingsWithRates);
    setLoading(false);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your ocean and air freight bookings
            </p>
          </div>
          
          <Link to="/rates">
            <Button className="bg-action hover:bg-action-hover">
              <Plus className="h-4 w-4 mr-2" />
              Book New Shipment
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-muted-foreground">Loading bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map(({ booking, rate }) => (
              <BookingCard key={booking.id} booking={booking} rate={rate} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-6">
              You haven't made any bookings yet. Start by exploring available rates.
            </p>
            <Link to="/rates">
              <Button className="bg-action hover:bg-action-hover">
                View Available Rates
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} FreightRates. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BookingsPage;
