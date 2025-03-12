
import React from 'react';
import RateCard from './RateCard';
import { FreightRate } from '@/types/freight';

interface RatesListProps {
  rates: FreightRate[];
  emptyMessage?: string;
}

const RatesList: React.FC<RatesListProps> = ({ 
  rates, 
  emptyMessage = "No rates found matching your criteria. Try adjusting your filters." 
}) => {
  if (rates.length === 0) {
    return (
      <div className="bg-white p-8 rounded-md shadow text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rates.map(rate => (
        <RateCard key={rate.id} rate={rate} />
      ))}
    </div>
  );
};

export default RatesList;
