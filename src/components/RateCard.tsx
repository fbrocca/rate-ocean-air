
import React from 'react';
import { FreightRate } from '@/types/freight';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, Plane, Calendar, Clock, DollarSign, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RateCardProps {
  rate: FreightRate;
}

const RateCard: React.FC<RateCardProps> = ({ rate }) => {
  const isOcean = rate.mode === 'ocean';
  const isSpot = rate.type === 'spot';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const includedCharges = rate.charges.filter(charge => charge.included).length;
  const totalCharges = rate.charges.length;
  
  return (
    <Card className={`overflow-hidden animate-fade-in border-l-4 ${isOcean ? 'border-l-ocean' : 'border-l-air'} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isOcean ? <Ship className="h-5 w-5 text-ocean" /> : <Plane className="h-5 w-5 text-air" />}
            <CardTitle className="text-lg">{rate.origin} to {rate.destination}</CardTitle>
          </div>
          <Badge variant={isSpot ? "default" : "outline"} className={isSpot ? "bg-action" : ""}>
            {isSpot ? "Spot" : "Contract"}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{rate.carrier}</div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Valid: {formatDate(rate.validFrom)} - {formatDate(rate.validTo)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Transit: {rate.transitTime} days</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>{includedCharges} of {totalCharges} charges included</span>
          </div>
          <div className="flex items-baseline gap-1">
            <DollarSign className="h-4 w-4 text-action" />
            <span className="font-bold text-lg">{rate.totalRate.toLocaleString('en-US')}</span>
            <span className="text-sm text-muted-foreground">{rate.currency}</span>
            {isOcean && <span className="text-xs text-muted-foreground">/{rate.containerType}</span>}
            {!isOcean && <span className="text-xs text-muted-foreground">/kg</span>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full justify-end">
          <Link to={`/rates/${rate.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">View Details</Button>
          </Link>
          <Link to={`/book/${rate.id}`} className="w-full sm:w-auto">
            <Button className="w-full bg-action hover:bg-action-hover">Book Now</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RateCard;
