// frontend/src/pages/Home.tsx - ENHANCED VERSION
import React, { useEffect } from 'react';
import Grid from '@mui/material/GridLegacy';
import { 
  Typography, 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Container,
  Chip,
  Stack,
  IconButton,
  alpha,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon 
} from '@mui/icons-material';
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
      {/* Hero Section - Travel/Flight Inspired */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #1e40af 100%)',
          borderRadius: 6,
          overflow: 'hidden',
          mb: 8,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white' }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2,
                  }}
                >
                  Experience The Magic Of
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'block',
                      background: 'linear-gradient(135deg, #d5ff01ff 0%, #e0ffa2ff 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Learning!
                  </Box>
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.9,
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Embark on a journey of knowledge with our premium courses. 
                  From beginner to expert, we'll help you soar to new heights.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    href="/courses"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffffff 0%, #fffefdff 100%)',
                      color: '#0f172a',
                      fontWeight: 600,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d5ff01ff 0%, #e0ffa2ff 100%)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Start Your Journey
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Floating Cards */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    p: 3,
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-20px)' },
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    50K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Happy Students
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: 20,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    p: 3,
                    animation: 'float 3s ease-in-out infinite 1s',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    1000+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Courses
                  </Typography>
                </Box>

                {/* Central Play Button */}
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    p: 3,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <IconButton
                    sx={{
                      backgroundColor: 'white',
                      color: '#2563eb',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        backgroundColor: 'white',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <PlayIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Popular Destinations (Courses) */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: '#0f172a',
            }}
          >
            Popular Learning Destinations
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
            Discover the most loved courses by our community
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#64748b' }}>
              Loading amazing courses...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {courses.slice(0, 6).map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      '& .course-image': {
                        transform: 'scale(1.05)',
                      },
                      '& .course-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="220"
                      image={course.thumbnail}
                      alt={course.title}
                      className="course-image"
                      sx={{
                        transition: 'transform 0.3s ease',
                      }}
                    />
                    <Box
                      className="course-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.8), rgba(6, 182, 212, 0.8))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        href={`/courses/${course._id}`}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#2563eb',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            background: 'white',
                          },
                        }}
                      >
                        Explore Course
                      </Button>
                    </Box>
                    
                    {/* Price Badge */}
                    <Chip
                      label={course.price > 0 ? `$${course.price}` : 'FREE'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: course.price > 0 
                          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b', 
                        mb: 2,
                        fontWeight: 500,
                      }}
                    >
                      By {course.instructor.name}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {course.rating}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {course.enrolledCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {Math.floor(course.duration / 60)}h {course.duration % 60}m
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        size="small" 
                        label={course.category} 
                        sx={{ 
                          backgroundColor: alpha('#2563eb', 0.1),
                          color: '#2563eb',
                          fontWeight: 500,
                        }}
                      />
                      <Chip 
                        size="small" 
                        label={course.difficulty} 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* CTA Section */}
        <Box
          sx={{
            mt: 8,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: 6,
            py: 8,
            px: 4,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: '#0f172a',
            }}
          >
            Ready to Take Flight?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              mb: 4,
              fontWeight: 400,
            }}
          >
            Join thousands of learners who have already started their journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/courses"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            View All Courses
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;