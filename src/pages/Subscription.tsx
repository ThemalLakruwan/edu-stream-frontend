import React, { useEffect } from 'react';
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
} from '../store/slices/subscriptionSlice';

const Subscription: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, current, loading, error } = useAppSelector((s) => s.subscription);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  const handleSelect = (planType: string) => dispatch(createSubscription(planType));
  const handleCancel = () => dispatch(cancelSubscription()).then(() => dispatch(fetchCurrentSubscription()));
  const handleResume = () => dispatch(resumeSubscription()).then(() => dispatch(fetchCurrentSubscription()));
  const handleChange = (planType: string) => dispatch(changePlan(planType)).then(() => dispatch(fetchCurrentSubscription()));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Manage Subscription</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {current && (
        <Alert severity={current.status === 'active' ? 'success' : 'warning'} sx={{ mb: 3 }}>
          Current plan: <b>{current.planType}</b> — Status: <Chip size="small" label={current.status} sx={{ ml: 1 }} />
        </Alert>
      )}

      <Grid container spacing={3}>
        {plans.map((p) => (
          <Grid item xs={12} md={4} key={p.id || p.planType}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{p.name || p.planType}</Typography>
                <Typography variant="h4" sx={{ my: 1 }}>
                  {Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'USD' }).format(p.price)} / {p.interval}
                </Typography>
                <List dense>
                  {(p.features || ['Access all courses', 'Offline materials', 'Certificate of completion']).map((f, idx) => (
                    <ListItem key={idx} disableGutters>
                      <ListItemIcon>
                        <CheckIcon />
                      </ListItemIcon>
                      <ListItemText primary={f} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                {!current ? (
                  <Button fullWidth variant="contained" disabled={loading} onClick={() => handleSelect(p.planType)}>
                    Choose {p.planType}
                  </Button>
                ) : current.planType === p.planType ? (
                  current.status === 'active' ? (
                    <Button fullWidth variant="outlined" color="warning" disabled={loading} onClick={handleCancel}>
                      Cancel at period end
                    </Button>
                  ) : (
                    <Button fullWidth variant="contained" disabled={loading} onClick={handleResume}>
                      Resume
                    </Button>
                  )
                ) : (
                  <Button fullWidth variant="outlined" disabled={loading} onClick={() => handleChange(p.planType)}>
                    Switch to {p.planType}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Subscription;
