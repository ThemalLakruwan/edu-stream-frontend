import React, { useEffect } from 'react';
import Grid from '@mui/material/GridLegacy';
import { Typography, Box, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCourses } from '../store/slices/coursesSlice';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { courses, loading } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 6, sortBy: 'popular' }));
  }, [dispatch]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
          borderRadius: 2,
          mb: 6
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Learn Without Limits
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 4 }}>
          Access thousands of courses from top instructors worldwide
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          href="/courses"
        >
          Explore Courses
        </Button>
      </Box>

      {/* Featured Courses */}
      <Typography variant="h4" component="h2" gutterBottom>
        Popular Courses
      </Typography>
      
      {loading ? (
        <Typography>Loading courses...</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.slice(0, 6).map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnail}
                  alt={course.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {course.instructor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.enrolledCount} students • {Math.floor(course.duration / 60)}h {course.duration % 60}m
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" href={`/courses/${course._id}`}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Home;