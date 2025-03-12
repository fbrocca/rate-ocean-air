
import React from 'react';
import { Charge } from '@/types/freight';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';

interface ChargesTableProps {
  charges: Charge[];
  currency: string;
}

const ChargesTable: React.FC<ChargesTableProps> = ({ charges, currency }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Charge Name</TableHead>
          <TableHead>Included</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {charges.map((charge, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{charge.name}</TableCell>
            <TableCell>
              {charge.included ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </TableCell>
            <TableCell className="text-right">
              {charge.amount !== undefined ? (
                <span>{charge.amount.toLocaleString('en-US')} {currency}</span>
              ) : (
                <span className="text-muted-foreground">Included in base rate</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChargesTable;
