
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Plane, Package, ArrowRight, DollarSign, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Index = () => {
  const navigate = useNavigate();
  
  const handleViewOceanRates = () => {
    navigate('/rates?mode=ocean');
  };
  
  const handleViewAirRates = () => {
    navigate('/rates?mode=air');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-ocean text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Manage Your Ocean & Air Freight Rates
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Compare rates, track charges, and book shipments all in one place
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-ocean hover:bg-gray-100 w-full sm:w-auto"
                  onClick={handleViewOceanRates}
                >
                  View Ocean Rates
                </Button>
                <Button 
                  size="lg" 
                  className="bg-white text-air hover:bg-gray-100 w-full sm:w-auto"
                  onClick={handleViewAirRates}
                >
                  View Air Rates
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Manage Rates</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-ocean-light rounded-full mb-4">
                  <DollarSign className="h-6 w-6 text-ocean" />
                </div>
                <h3 className="text-xl font-bold mb-2">Contract & Spot Rates</h3>
                <p className="text-gray-600 mb-4">
                  Access both your long-term contracted rates and short-term spot market rates in one place.
                </p>
                <Button 
                  variant="link" 
                  className="text-ocean hover:text-ocean-dark flex items-center gap-1 p-0"
                  onClick={handleViewOceanRates}
                >
                  View rates <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-air-light rounded-full mb-4">
                  <Clock className="h-6 w-6 text-air" />
                </div>
                <h3 className="text-xl font-bold mb-2">Transparent Charges</h3>
                <p className="text-gray-600 mb-4">
                  See exactly what charges are included in each rate - no hidden fees or surprises.
                </p>
                <Button 
                  variant="link" 
                  className="text-air hover:text-air-dark flex items-center gap-1 p-0"
                  onClick={handleViewOceanRates}
                >
                  Compare charges <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-action rounded-full mb-4">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                <p className="text-gray-600 mb-4">
                  Found a rate you like? Book your shipment directly without leaving the platform.
                </p>
                <Link to="/bookings" className="text-action hover:text-action-hover flex items-center gap-1">
                  View bookings <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-ocean py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Ready to Manage Your Freight Rates?</h2>
              <p className="text-xl mb-8 opacity-90">
                Get started today with our comprehensive rate management system.
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-ocean hover:bg-gray-100"
                  onClick={handleViewOceanRates}
                >
                  Explore Rates
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Ship className="h-6 w-6" />
                <span>FreightRates</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FreightRates. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
