
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FreightRate } from '@/types/freight';
import { Calendar as CalendarIcon, Ship, Plane, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { addBooking } from '@/data/mockBookings';

interface BookingFormProps {
  rate: FreightRate;
}

const BookingForm: React.FC<BookingFormProps> = ({ rate }) => {
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isOcean = rate.mode === 'ocean';
  const isSpot = rate.type === 'spot';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureDate) {
      toast({
        title: "Error",
        description: "Please select a departure date",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newBooking = addBooking({
        rateId: rate.id,
        bookingDate: new Date().toISOString().split('T')[0],
        departureDate: departureDate.toISOString().split('T')[0],
        status: 'pending',
      });
      
      toast({
        title: "Booking Created",
        description: `Your booking reference is ${newBooking.reference}`,
      });
      
      navigate('/bookings');
    }, 1000);
  };
  
  // Calculate dates
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 3); // Minimum 3 days from now
  
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60); // Maximum 60 days from now
  
  // For validity date range display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isOcean ? <Ship className="h-5 w-5 text-ocean" /> : <Plane className="h-5 w-5 text-air" />}
          <CardTitle>Book Shipment</CardTitle>
        </div>
        <CardDescription>
          {isOcean ? 'Ocean freight' : 'Air freight'} from {rate.origin} to {rate.destination}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form id="booking-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Information</label>
              <div className="bg-muted p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Carrier:</span>
                  <span className="text-sm font-medium">{rate.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rate Type:</span>
                  <span className="text-sm font-medium">{isSpot ? 'Spot' : 'Contract'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transit Time:</span>
                  <span className="text-sm font-medium">{rate.transitTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valid Until:</span>
                  <span className="text-sm font-medium">{formatDate(rate.validTo)}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-2 mt-2">
                  <span className="text-sm font-medium">Total Rate:</span>
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="h-4 w-4 text-action" />
                    <span className="font-bold">{rate.totalRate.toLocaleString('en-US')}</span>
                    <span className="text-sm text-muted-foreground">{rate.currency}</span>
                    {isOcean && <span className="text-xs text-muted-foreground">/{rate.containerType}</span>}
                    {!isOcean && <span className="text-xs text-muted-foreground">/kg</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Departure Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    disabled={(date) => 
                      date < minDate || 
                      date > maxDate || 
                      date > new Date(rate.validTo)
                    }
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select a date between {format(minDate, "MMM d, yyyy")} and {format(maxDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          form="booking-form" 
          type="submit" 
          className="w-full bg-action hover:bg-action-hover"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
