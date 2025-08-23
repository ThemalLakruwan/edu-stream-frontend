import React, { useEffect } from 'react';
import Grid from '@mui/material/GridLegacy';
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchCurrentSubscription } from '../store/slices/subscriptionSlice';
import { fetchCourses } from '../store/slices/coursesSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { current } = useAppSelector((s) => s.subscription);
  const { courses } = useAppSelector((s) => s.courses);

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchCourses({ limit: 4, sortBy: 'new' }));
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {user?.name || 'Learner'} 👋</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Subscription</Typography>
              {current ? (
                <>
                  <Typography>Plan: <b>{current.planType}</b></Typography>
                  <Typography>Status: <Chip size="small" label={current.status} sx={{ ml: 1 }} /></Typography>
                  <Typography sx={{ mt: 1 }}>
                    Period: {new Date(current.currentPeriodStart).toLocaleDateString()} →{' '}
                    {new Date(current.currentPeriodEnd).toLocaleDateString()}
                  </Typography>
                  <Button href="/subscription" variant="outlined" sx={{ mt: 2 }}>
                    Manage
                  </Button>
                </>
              ) : (
                <>
                  <Typography>No active subscription.</Typography>
                  <Button href="/subscription" variant="contained" sx={{ mt: 2 }}>
                    Choose a plan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Suggested for you</Typography>
              {courses.map((c) => (
                <Box key={c._id} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1">{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.category} • {c.difficulty}
                  </Typography>
                  <Button size="small" href={`/courses/${c._id}`} sx={{ mt: 0.5 }}>
                    View
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
