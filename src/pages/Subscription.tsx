// frontend/src/pages/Subscription.tsx
import React, { useEffect, useState, useMemo } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
  Box, Typography, Card, CardContent, CardActions, Button,
  List, ListItem, ListItemIcon, ListItemText, Chip, Alert,
  CircularProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchPlans,
  fetchCurrentSubscription,
  cancelSubscription,
  resumeSubscription,
  changePlan
} from '../store/slices/subscriptionSlice';
import PaymentModal from '../components/PaymentModal';

const ALLOW_SWITCH_STATES = new Set(['active', 'trialing', 'past_due']);

const Subscription: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, current, loading, error } = useAppSelector((s) => s.subscription);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  const selectedPlanData = useMemo(
    () => plans.find(p => p.planType === selectedPlan),
    [plans, selectedPlan]
  );

  const handleSelectPlan = (planType: string) => {
    setSelectedPlan(planType);
    setPaymentModalOpen(true);   // open card form first (no subscription yet)
  };

  const handlePaymentSuccess = () => {
    dispatch(fetchCurrentSubscription());
  };

  const handleCancel = async () => {
    setLocalLoading(true);
    await dispatch(cancelSubscription());
    await dispatch(fetchCurrentSubscription());
    setLocalLoading(false);
  };

  const handleResume = async () => {
    setLocalLoading(true);
    await dispatch(resumeSubscription());
    await dispatch(fetchCurrentSubscription());
    setLocalLoading(false);
  };

  const handleChangePlan = async (planType: string) => {
    setLocalLoading(true);
    await dispatch(changePlan(planType));
    await dispatch(fetchCurrentSubscription());
    setLocalLoading(false);
  };

  if (loading && (!plans || plans.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Subscription</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {current && current.planType && current.status && (
        <Alert
          severity={current.status === 'active' ? 'success' : (current.status === 'trialing' ? 'info' : 'warning')}
          sx={{ mb: 3 }}
        >
          Current plan: <b>{current.planType}</b> — Status:
          <Chip size="small" label={current.status} sx={{ ml: 1 }} />
          {current.cancelAtPeriodEnd && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Will be cancelled on {new Date(current.currentPeriodEnd).toLocaleDateString()}
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((p) => {
            const isCurrent = current?.planType === p.planType;
            const canSwitch = current && ALLOW_SWITCH_STATES.has(current.status);
            return (
              <Grid item xs={12} md={4} key={p.id || p.planType}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderWidth: 2,
                    borderColor: isCurrent ? 'primary.main' : 'divider',
                    position: 'relative'
                  }}
                >
                  {isCurrent && (
                    <Chip
                      label="Current plan"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12 }}
                    />
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>{p.name || `${p.planType} Plan`}</Typography>
                    <Typography variant="h4" sx={{ my: 2 }}>
                      ${p.price?.toFixed(2) || '0.00'} / {p.interval || 'month'}
                    </Typography>
                    <List dense>
                      {(p.features || ['Access to courses', 'Customer support']).map((f, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText primary={f} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {!current ? (
                      // No subscription yet → choose plan
                      <Button fullWidth variant="contained" onClick={() => handleSelectPlan(p.planType)}>
                        Choose {p.planType}
                      </Button>
                    ) : isCurrent ? (
                      // Current plan → cancel/resume
                      current.status !== 'canceled' && !current.cancelAtPeriodEnd ? (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="warning"
                          disabled={localLoading}
                          onClick={handleCancel}
                        >
                          Cancel at period end
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={localLoading}
                          onClick={handleResume}
                        >
                          Resume
                        </Button>
                      )
                    ) : (
                      // Other plans → allow switch for active/trialing/past_due
                      <Button
                        fullWidth
                        variant="outlined"
                        disabled={localLoading || !canSwitch}
                        onClick={() => handleChangePlan(p.planType)}
                      >
                        Switch to {p.planType}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No subscription plans available at the moment. Please try again later.</Alert>
          </Grid>
        )}
      </Grid>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planType={selectedPlan}
        planName={selectedPlanData?.name || 'Plan'}
        onSuccess={handlePaymentSuccess}
      />
    </Box>
  );
};

export default Subscription;
