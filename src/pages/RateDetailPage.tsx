
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRate } from '@/data/mockRates';
import { FreightRate } from '@/types/freight';
import Header from '@/components/Header';
import ChargesTable from '@/components/ChargesTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ship, 
  Plane, 
  Calendar, 
  Clock, 
  DollarSign, 
  ArrowLeft,
  Building,
  MapPin,
  Truck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [rate, setRate] = useState<FreightRate | null>(null);
  
  useEffect(() => {
    if (id) {
      const foundRate = getRate(id);
      if (foundRate) {
        setRate(foundRate);
      }
    }
  }, [id]);
  
  if (!rate) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-muted-foreground">Loading rate details...</p>
          </div>
        </main>
      </div>
    );
  }
  
  const isOcean = rate.mode === 'ocean';
  const isSpot = rate.type === 'spot';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Calculate included/excluded charges
  const includedCharges = rate.charges.filter(charge => charge.included);
  const excludedCharges = rate.charges.filter(charge => !charge.included);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/rates" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to rates
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {isOcean ? 
                  <Ship className="h-6 w-6 text-ocean" /> : 
                  <Plane className="h-6 w-6 text-air" />
                }
                <h1 className="text-3xl font-bold">
                  {rate.origin} to {rate.destination}
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                {rate.carrier} • {isOcean ? 'Ocean freight' : 'Air freight'} •
                Valid until {formatDate(rate.validTo)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link to="/rates">
                <Button variant="outline">View All Rates</Button>
              </Link>
              <Link to={`/book/${rate.id}`}>
                <Button className="bg-action hover:bg-action-hover">Book Now</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Rate Details</CardTitle>
              <CardDescription>Complete information about this {rate.mode} freight rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Route Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Origin:</div>
                      <div>{rate.origin}</div>
                      <div className="text-muted-foreground">Destination:</div>
                      <div>{rate.destination}</div>
                      <div className="text-muted-foreground">Transit Time:</div>
                      <div>{rate.transitTime} days</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-1">
                      <Building className="h-4 w-4" /> Provider Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Carrier:</div>
                      <div>{rate.carrier}</div>
                      <div className="text-muted-foreground">Rate Type:</div>
                      <div>
                        <Badge variant={isSpot ? "default" : "outline"} className={isSpot ? "bg-action" : ""}>
                          {isSpot ? "Spot" : "Contract"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {isOcean && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Truck className="h-4 w-4" /> Equipment Details
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Container Type:</div>
                        <div>{rate.containerType}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Validity Period
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Valid From:</div>
                      <div>{formatDate(rate.validFrom)}</div>
                      <div className="text-muted-foreground">Valid To:</div>
                      <div>{formatDate(rate.validTo)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Rate Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Base Rate:</div>
                      <div>{rate.baseRate.toLocaleString('en-US')} {rate.currency}</div>
                      <div className="text-muted-foreground">Total Rate:</div>
                      <div className="font-bold text-base">
                        {rate.totalRate.toLocaleString('en-US')} {rate.currency}
                        {isOcean && <span className="text-xs text-muted-foreground ml-1">/{rate.containerType}</span>}
                        {!isOcean && <span className="text-xs text-muted-foreground ml-1">/kg</span>}
                      </div>
                      <div className="text-muted-foreground">Included Charges:</div>
                      <div>{includedCharges.length} of {rate.charges.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rate Summary</CardTitle>
              <CardDescription>Overview of costs and charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Base Rate</span>
                    <span className="font-bold">{rate.baseRate.toLocaleString('en-US')} {rate.currency}</span>
                  </div>
                  
                  {includedCharges.filter(c => c.amount).map((charge, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="text-muted-foreground">+ {charge.name}</span>
                      <span>{charge.amount?.toLocaleString('en-US')} {charge.currency}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                    <span className="font-medium">Total Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-lg">{rate.totalRate.toLocaleString('en-US')}</span>
                      <span className="text-sm text-muted-foreground">{rate.currency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Additional Charges</h3>
                  {excludedCharges.length > 0 ? (
                    <ul className="space-y-2">
                      {excludedCharges.map((charge, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{charge.name}</span>
                          <span className="font-medium">
                            {charge.amount?.toLocaleString('en-US')} {charge.currency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No additional charges</p>
                  )}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Link to={`/book/${rate.id}`}>
                    <Button className="w-full bg-action hover:bg-action-hover">Book This Rate</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Charges Breakdown</CardTitle>
            <CardDescription>Detailed breakdown of all charges for this rate</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Charges</TabsTrigger>
                <TabsTrigger value="included">Included ({includedCharges.length})</TabsTrigger>
                <TabsTrigger value="excluded">Not Included ({excludedCharges.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ChargesTable charges={rate.charges} currency={rate.currency} />
              </TabsContent>
              
              <TabsContent value="included">
                {includedCharges.length > 0 ? (
                  <ChargesTable charges={includedCharges} currency={rate.currency} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">No included charges</p>
                )}
              </TabsContent>
              
              <TabsContent value="excluded">
                {excludedCharges.length > 0 ? (
                  <ChargesTable charges={excludedCharges} currency={rate.currency} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">No excluded charges</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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

export default RateDetailPage;
