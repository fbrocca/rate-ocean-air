
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Plane, Filter } from 'lucide-react';
import { FreightMode, RateType } from '@/data/mockRates';

interface RateFilterProps {
  onFilter: (filters: {
    mode?: FreightMode;
    type?: RateType;
    origin?: string;
    destination?: string;
  }) => void;
  initialMode?: FreightMode;
}

const RateFilter: React.FC<RateFilterProps> = ({ onFilter, initialMode }) => {
  const [mode, setMode] = useState<FreightMode | undefined>(initialMode);
  const [type, setType] = useState<RateType | undefined>(undefined);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  const handleModeToggle = (selectedMode: FreightMode) => {
    setMode(mode === selectedMode ? undefined : selectedMode);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      mode,
      type,
      origin: origin || undefined,
      destination: destination || undefined,
    });
  };
  
  const handleClear = () => {
    setMode(undefined);
    setType(undefined);
    setOrigin('');
    setDestination('');
    onFilter({});
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h2 className="text-lg font-medium">Filter Rates</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Freight Mode</label>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant={mode === 'ocean' ? 'default' : 'outline'} 
                className={mode === 'ocean' ? 'bg-ocean hover:bg-ocean-dark' : ''}
                onClick={() => handleModeToggle('ocean')}
              >
                <Ship className="h-4 w-4 mr-2" />
                Ocean
              </Button>
              <Button 
                type="button"
                variant={mode === 'air' ? 'default' : 'outline'} 
                className={mode === 'air' ? 'bg-air hover:bg-air-dark' : ''}
                onClick={() => handleModeToggle('air')}
              >
                <Plane className="h-4 w-4 mr-2" />
                Air
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate Type</label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as RateType || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Rate Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Rate Types</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="spot">Spot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Origin</label>
            <Input 
              placeholder="Any origin" 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <Input 
              placeholder="Any destination" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button type="submit" className="bg-ocean hover:bg-ocean-dark">
            Apply Filters
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RateFilter;
