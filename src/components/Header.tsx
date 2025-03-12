
import React from 'react';
import { Ship, Plane, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search",
      description: "Search functionality will be implemented in the next version",
    });
  };

  return (
    <header className="bg-ocean text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
              <Ship className="h-8 w-8" />
              <span>FreightRates</span>
            </Link>
          </div>
          
          <div className="w-full md:w-auto flex gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative max-w-md">
              <Input 
                type="text" 
                placeholder="Search rates..." 
                className="bg-white text-black w-full pr-10"
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full text-gray-500"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
            
            <nav className="flex items-center gap-3">
              <Link to="/rates" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-ocean-dark transition-colors">
                <Ship className="h-5 w-5" />
                <span className="hidden sm:inline">Ocean</span>
              </Link>
              <Link to="/rates?mode=air" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-ocean-dark transition-colors">
                <Plane className="h-5 w-5" />
                <span className="hidden sm:inline">Air</span>
              </Link>
              <Link to="/bookings" className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-ocean-dark transition-colors">
                <span>Bookings</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
