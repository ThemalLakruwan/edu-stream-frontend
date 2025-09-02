// frontend/src/components/PaymentModal.tsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Alert, Box
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements
} from '@stripe/react-stripe-js';
import { subscriptionAPI } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  planType: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ planType, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError(null);

    try {
      // 1) Create a PaymentMethod from the card input
      const { error: pmErr, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmErr || !paymentMethod) {
        const msg = pmErr?.message || 'Failed to create payment method.';
        setError(msg); onError(msg); setProcessing(false); return;
      }

      // 2) Create the subscription (server attaches PM and may return a clientSecret)
      const resp = await subscriptionAPI.createSubscription({
        planType,
        paymentMethodId: paymentMethod.id,
      });

      const { clientSecret, status } = resp.data || {};

      // 3) If Stripe needs confirmation (incomplete + invoice PI), confirm it here
      if (clientSecret) {
        const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
        if (confirmErr) {
          const msg = confirmErr.message || 'Payment confirmation failed.';
          setError(msg); onError(msg); setProcessing(false); return;
        }
        if (paymentIntent?.status !== 'succeeded') {
          const msg = 'Payment not completed. Please try again.';
          setError(msg); onError(msg); setProcessing(false); return;
        }
      } else {
        // Trial flow: no immediate charge; PM is saved for future billing
        // status is typically 'trialing'
      }

      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Payment failed.';
      setError(msg); onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </Box>
      <DialogActions>
        <Button type="submit" variant="contained" disabled={!stripe || processing} fullWidth>
          {processing ? <CircularProgress size={24} /> : 'Start Subscription'}
        </Button>
      </DialogActions>
    </form>
  );
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planType: string;
  planName: string;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open, onClose, planType, planName, onSuccess
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Subscribe to {planName}</DialogTitle>
      <DialogContent>
        <Elements stripe={stripePromise}>
          <PaymentForm
            planType={planType}
            onSuccess={() => { onSuccess(); onClose(); }}
            onError={() => {}}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
