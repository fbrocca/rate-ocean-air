import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

const HowToPlay: React.FC<{ triggerClassName?: string }> = ({ triggerClassName }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className={triggerClassName}>
        <HelpCircle className="h-4 w-4 mr-1" /> How to play
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>How to play Box &amp; Bust</DialogTitle>
        <DialogDescription>
          Run a container line through a full boom-and-bust market cycle.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          You are the boss of <strong>Blue Anchor Line</strong> on the Asia–Europe
          trade for 24 rounds. Each round you make three kinds of decisions, then the
          market resolves.
        </p>
        <div>
          <h4 className="font-semibold">1. Price</h4>
          <p>
            Set your freight rate. Price below the market rate and shippers flock to
            you; price above and bookings shrink but margins fatten.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">2. Capacity — the heart of the game</h4>
          <p>
            Charter ships (arrive <em>next</em> round, 4-round commitment, hire priced
            at today&apos;s market — expensive in a boom!) or order newbuilds (cheap
            per slot, but they arrive <em>6 rounds later</em>). Capacity you order in
            a boom may deliver into a bust. That delay between decision and effect is
            exactly what breaks real-world supply chains.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">3. Service</h4>
          <p>
            If more cargo books with you than your ships can carry, the excess is
            &ldquo;rolled&rdquo;. Rolled cargo enrages customers and erodes your
            loyalty, shrinking future bookings. Idle ships burn money instead.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Watch out for</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Demand shocks — booms, slumps, port congestion, canal closures.</li>
            <li>
              Competitors add and cut capacity with a lag, so freight rates swing in
              cycles. Ride the cycle; don&apos;t chase it.
            </li>
            <li>
              Bankruptcy: if cash falls below −$50M, the banks take your ships.
            </li>
          </ul>
        </div>
        <p>
          <strong>Goal:</strong> maximize profit over 24 rounds while keeping
          customers served. At the end you get a debrief showing whether you amplified
          the market cycle — the famous <em>bullwhip effect</em>.
        </p>
      </div>
    </DialogContent>
  </Dialog>
);

export default HowToPlay;
