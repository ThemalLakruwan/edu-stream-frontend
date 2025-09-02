import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </Box>
      <DialogActions>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!stripe || processing}
          fullWidth
        >
          {processing ? <CircularProgress size={24} /> : 'Complete Payment'}
        </Button>
      </DialogActions>
    </form>
  );
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  clientSecret: string | null;
  onSuccess: () => void;
  planName: string;
  error?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  clientSecret,
  onSuccess,
  planName,
  error,
}) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Your {planName} Subscription</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {clientSecret && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={handleSuccess}
              onError={(err) => console.error('Payment error:', err)}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;