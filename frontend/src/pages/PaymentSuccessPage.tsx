import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import LandingLayout from '@/components/layout/RegularLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { planName, totalAmount, email } = location.state || {};

  return (
    <LandingLayout>
      <div className="container mx-auto py-20 lg:py-28 px-4 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-gradient">Payment Successful!</h1>
        {planName && totalAmount && (
          <p className="text-muted-foreground text-lg mb-2">
            Thank you for subscribing to the{' '}
            <span className="font-semibold text-foreground">{planName}</span> plan.
          </p>
        )}
        <p className="text-muted-foreground text-lg mb-8">
          Total amount paid: <span className="font-semibold text-foreground">₹{Number(totalAmount || 0).toFixed(2)}</span>.
          {email && <> An email confirmation has been sent to <span className="font-semibold text-foreground">{email}</span>.</>}
        </p>
        <Link to="/dashboard"> 
          <Button size="lg" className="bg-brand hover:bg-brand/90">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </LandingLayout>
  );
};

export default PaymentSuccessPage;