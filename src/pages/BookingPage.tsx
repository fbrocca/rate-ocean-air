
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRate } from '@/data/mockRates';
import { FreightRate } from '@/types/freight';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [rate, setRate] = useState<FreightRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      try {
        const foundRate = getRate(id);
        if (foundRate) {
          console.log("Found rate:", foundRate);
          setRate(foundRate);
        } else {
          console.error("Rate not found for ID:", id);
          setError("Rate not found. Please try again or contact support.");
          toast({
            title: "Error",
            description: "Rate not found. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching rate:", err);
        setError("Failed to load rate information. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-muted-foreground">Loading booking information...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !rate) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-red-500 mb-4">{error || "Rate information not available"}</p>
            <Link to="/rates" className="text-action hover:underline">
              Return to Rates
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/rates/${rate.id}`} className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to rate details
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Book Shipment</h1>
          <p className="text-muted-foreground">
            Complete the form below to book your shipment with {rate.carrier}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="order-2 md:order-1">
            <BookingForm rate={rate} />
          </div>
          
          <div className="order-1 md:order-2">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">Booking Information</h2>
              <p className="text-muted-foreground mb-4">
                You are about to book a shipment using the following rate:
              </p>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium">Route:</span>
                  <span>{rate.origin} to {rate.destination}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium">Carrier:</span>
                  <span>{rate.carrier}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium">Service:</span>
                  <span>{rate.mode === 'ocean' ? 'Ocean Freight' : 'Air Freight'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium">Transit Time:</span>
                  <span>{rate.transitTime} days</span>
                </div>
                {rate.mode === 'ocean' && (
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="font-medium">Container Type:</span>
                    <span>{rate.containerType}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="font-medium">Total Rate:</span>
                  <span className="font-bold">
                    {rate.totalRate.toLocaleString('en-US')} {rate.currency}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Important Notes</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Bookings are subject to space and equipment availability</li>
                <li>Rates are valid for the dates specified only</li>
                <li>Additional charges may apply for specialized handling</li>
                <li>Please review all details before confirming your booking</li>
                <li>You will receive a confirmation email with your booking details</li>
              </ul>
            </div>
          </div>
        </div>
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

export default BookingPage;
