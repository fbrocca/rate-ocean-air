
import React from 'react';
import { Booking } from '@/types/freight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Ship, Plane, Package } from 'lucide-react';
import { FreightRate } from '@/types/freight';

interface BookingCardProps {
  booking: Booking;
  rate: FreightRate;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, rate }) => {
  const isOcean = rate.mode === 'ocean';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="overflow-hidden border-l-4 border-l-action hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-action" />
            <CardTitle className="text-lg">{booking.reference}</CardTitle>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isOcean ? <Ship className="h-4 w-4 text-ocean" /> : <Plane className="h-4 w-4 text-air" />}
            <span className="text-sm">
              {rate.origin} to {rate.destination} via {rate.carrier}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Booked: {formatDate(booking.bookingDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Departure: {formatDate(booking.departureDate)}</span>
            </div>
          </div>
          
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-sm font-medium">Rate:</span>
            <span className="text-sm font-bold">
              {rate.totalRate.toLocaleString('en-US')} {rate.currency}
              {isOcean && <span className="text-xs text-muted-foreground ml-1">/{rate.containerType}</span>}
              {!isOcean && <span className="text-xs text-muted-foreground ml-1">/kg</span>}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
