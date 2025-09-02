import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchPlans,
  fetchCurrentSubscription,
  createSubscription,
  cancelSubscription,
  resumeSubscription,
  changePlan,
  clearClientSecret,
} from '../store/slices/subscriptionSlice';
import PaymentModal from '../components/PaymentModal';

const Subscription: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, current, loading, error, clientSecret, processingPayment } = useAppSelector((s) => s.subscription);
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  console.log('Subscription state:', { 
    plans: plans?.length, 
    current: current ? { planType: current.planType, status: current.status } : null, 
    loading, 
    error 
  });

  const handleSelectPlan = async (planType: string) => {
    console.log('Plan selected:', planType);
    setSelectedPlan(planType);
    
    try {
      const result = await dispatch(createSubscription(planType));
      if (createSubscription.fulfilled.match(result)) {
        setPaymentModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    dispatch(clearClientSecret());
    dispatch(fetchCurrentSubscription());
  };

  const handleCancel = async () => {
    await dispatch(cancelSubscription());
    dispatch(fetchCurrentSubscription());
  };

  const handleResume = async () => {
    await dispatch(resumeSubscription());
    dispatch(fetchCurrentSubscription());
  };

  const handleChangePlan = async (planType: string) => {
    await dispatch(changePlan(planType));
    dispatch(fetchCurrentSubscription());
  };

  console.log('Subscription state:', { plans, current, loading, error });

  if (loading && (!plans || plans.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const selectedPlanData = plans.find(p => p.planType === selectedPlan);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Subscription</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {current && current.planType && current.status && (
        <Alert severity={current.status === 'active' ? 'success' : 'warning'} sx={{ mb: 3 }}>
          Current plan: <b>{current.planType}</b> — Status: <Chip size="small" label={current.status} sx={{ ml: 1 }} />
          {current.cancelAtPeriodEnd && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Will be cancelled on {new Date(current.currentPeriodEnd).toLocaleDateString()}
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((p) => (
            <Grid item xs={12} md={4} key={p.id || p.planType}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>{p.name || `${p.planType} Plan`}</Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>
                    ${p.price?.toFixed(2) || '0.00'} / {p.interval || 'month'}
                  </Typography>
                  <List dense>
                    {(p.features || ['Access to courses', 'Customer support']).map((f, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={f} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {/* FIXED: Better condition checking for current subscription */}
                  {!current || !current.planType ? (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      disabled={processingPayment} 
                      onClick={() => handleSelectPlan(p.planType)}
                    >
                      {processingPayment ? <CircularProgress size={24} /> : `Choose ${p.planType || 'Plan'}`}
                    </Button>
                  ) : current.planType === p.planType ? (
                    current.status === 'active' && !current.cancelAtPeriodEnd ? (
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        color="warning" 
                        disabled={loading} 
                        onClick={handleCancel}
                      >
                        Cancel at period end
                      </Button>
                    ) : current.cancelAtPeriodEnd ? (
                      <Button 
                        fullWidth 
                        variant="contained" 
                        disabled={loading} 
                        onClick={handleResume}
                      >
                        Resume
                      </Button>
                    ) : (
                      <Chip label={`Current Plan (${current.status})`} variant="outlined" />
                    )
                  ) : (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      disabled={loading || current.status !== 'active'} 
                      onClick={() => handleChangePlan(p.planType)}
                    >
                      Switch to {p.planType || 'Plan'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No subscription plans available at the moment. Please try again later.
            </Alert>
          </Grid>
        )}
      </Grid>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        planName={selectedPlanData?.name || 'Plan'}
        error={error || undefined}
      />
    </Box>
  );
};

export default Subscription;