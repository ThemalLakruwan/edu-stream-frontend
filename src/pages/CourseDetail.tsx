import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCourseById } from '../store/slices/coursesSlice';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentCourse: course, loading, error } = useAppSelector((s) => s.courses);

  useEffect(() => {
    if (id) dispatch(fetchCourseById(id));
  }, [dispatch, id]);

  if (loading || !course) return <Typography>{loading ? 'Loading…' : error || 'Course not found.'}</Typography>;

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card sx={{ flex: 2 }}>
          <CardMedia component="img" height="340" image={course.thumbnail} alt={course.title} />
          <CardContent>
            <Typography variant="h4" gutterBottom>{course.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{course.description}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label={course.category} />
              <Chip label={course.difficulty} />
              <Chip label={`${Math.floor(course.duration / 60)}h ${course.duration % 60}m`} />
              <Chip label={`${course.enrolledCount} students`} />
              <Chip label={`⭐ ${course.rating} (${course.ratingCount})`} />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Curriculum</Typography>
            <List dense>
              {course.lessons?.sort((a, b) => a.order - b.order).map((l) => (
                <ListItem key={l.id}>
                  <ListItemText primary={l.title} secondary={`${Math.floor(l.duration / 60)}m ${l.duration % 60}s`} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Instructor</Typography>
            <Typography>{course.instructor?.name}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Enroll</Typography>
            <Typography variant="body2" color="text.secondary">
              Get access with an active subscription.
            </Typography>
            <Button fullWidth variant="contained" sx={{ mt: 2 }} href="/subscription">
              View Plans
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CourseDetail;
