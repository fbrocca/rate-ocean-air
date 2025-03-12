
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import RateFilter from '@/components/RateFilter';
import RatesList from '@/components/RatesList';
import { getFilteredRates, FreightMode, RateType } from '@/data/mockRates';
import { FreightRate } from '@/types/freight';

const RatesPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') as FreightMode | undefined;
  
  const [rates, setRates] = useState<FreightRate[]>([]);
  const [filters, setFilters] = useState<{
    mode?: FreightMode;
    type?: RateType;
    origin?: string;
    destination?: string;
  }>({
    mode: initialMode,
  });
  
  useEffect(() => {
    // Apply filters
    const filteredRates = getFilteredRates(
      filters.mode,
      filters.type,
      filters.origin,
      filters.destination
    );
    setRates(filteredRates);
  }, [filters]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {filters.mode ? 
              `${filters.mode.charAt(0).toUpperCase() + filters.mode.slice(1)} Freight Rates` : 
              'All Freight Rates'
            }
          </h1>
          <p className="text-muted-foreground mt-2">
            {filters.type ? 
              `Showing ${filters.type} rates` : 
              'Showing both contract and spot rates'
            }
            {filters.origin && ` from ${filters.origin}`}
            {filters.destination && ` to ${filters.destination}`}
          </p>
        </div>
        
        <RateFilter 
          onFilter={setFilters}
          initialMode={filters.mode} 
        />
        
        <RatesList rates={rates} />
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

export default RatesPage;
