// frontend/src/pages/CourseDetail.tsx - FIXED VERSION
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

  // FIXED: Create a copy of the lessons array before sorting
  const sortedLessons = course.lessons ? [...course.lessons].sort((a, b) => a.order - b.order) : [];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card sx={{ flex: 2 }}>
          <CardMedia 
            component="img" 
            height="340" 
            image={course.thumbnail} 
            alt={course.title}
            onError={(e) => {
              // Fallback image if thumbnail fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x340/cccccc/666666?text=Course+Image';
            }}
          />
          <CardContent>
            <Typography variant="h4" gutterBottom>{course.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{course.description}</Typography>
            
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label={course.category} color="primary" variant="outlined" />
              <Chip label={course.difficulty} color="secondary" variant="outlined" />
              <Chip 
                label={`${Math.floor(course.duration / 60)}h ${course.duration % 60}m`} 
                variant="outlined" 
              />
              <Chip 
                label={`${course.enrolledCount} students`} 
                variant="outlined" 
              />
              <Chip 
                label={`⭐ ${course.rating} (${course.ratingCount})`} 
                variant="outlined" 
              />
            </Stack>

            {/* Requirements Section */}
            {course.requirements && course.requirements.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Requirements</Typography>
                <List dense>
                  {course.requirements.map((req: string, index: number) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={`• ${req}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Materials Section */}
            {course.materials && course.materials.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Course Materials</Typography>
                <List dense>
                  {course.materials.map((material: string, index: number) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={`• ${material}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Course Curriculum</Typography>
            
            {sortedLessons.length > 0 ? (
              <List dense>
                {sortedLessons.map((lesson, index) => (
                  <ListItem key={lesson.id || index} sx={{ py: 1, px: 0 }}>
                    <ListItemText 
                      primary={`${lesson.order}. ${lesson.title}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                          </Typography>
                          {lesson.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {lesson.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No lessons available for this course.
              </Typography>
            )}

                {/* Tags Section */}
            {course.tags && course.tags.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Topics Covered</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {course.tags.map((tag: string, index: number) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Instructor</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {course.instructor?.avatar && (
                <img 
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    marginRight: 16,
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=1976d2&color=fff`;
                  }}
                />
              )}
              <Typography variant="body1">{course.instructor?.name}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            {/* Pricing Information */}
            <Typography variant="h6" gutterBottom>Course Access</Typography>
            {course.price > 0 ? (
              <Typography variant="h5" color="primary" gutterBottom>
                ${course.price}
              </Typography>
            ) : (
              <Typography variant="h6" color="success.main" gutterBottom>
                Free Course
              </Typography>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get access with an active subscription or enroll directly.
            </Typography>
            
            <Stack spacing={2}>
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                href="/subscription"
                sx={{ py: 1.5 }}
              >
                View Subscription Plans
              </Button>
              
              <Button 
                fullWidth 
                variant="outlined" 
                size="large"
                sx={{ py: 1.5 }}
                disabled // Enable when enrollment system is implemented
              >
                Enroll Now
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            
            {/* Course Stats */}
            <Typography variant="h6" gutterBottom>Course Statistics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Students:</strong> {course.enrolledCount?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Rating:</strong> {course.rating}/5 ({course.ratingCount} reviews)
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {Math.floor(course.duration / 60)}h {course.duration % 60}m
              </Typography>
              <Typography variant="body2">
                <strong>Level:</strong> {course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CourseDetail;