import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutCancel = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="glass-card max-w-md w-full p-8 text-center rounded-6 border-t-4 border-error">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-error text-[40px]">cancel</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Payment Cancelled</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Your payment was not completed. Your appointment request remains in the "Awaiting Payment" state. You can try paying again from your dashboard.
        </p>
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-surface-container-highest text-on-surface font-label-md text-label-md px-6 py-3 rounded-full hover:bg-surface-variant transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CheckoutCancel;
