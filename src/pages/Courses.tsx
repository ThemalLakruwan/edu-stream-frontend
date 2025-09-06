import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  Button,
  alpha,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCategories, fetchCourses } from '../store/slices/coursesSlice';

const difficulties = ['beginner', 'intermediate', 'advanced'];

const Courses: React.FC = () => {
  const dispatch = useAppDispatch();
  const { courses, loading, categories, pagination } = useAppSelector((s) => s.courses);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCourses({
        q: query || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        page,
        limit: 12,
      })
    );
  }, [dispatch, query, category, difficulty, page]);

  const totalPages = useMemo(() => pagination?.pages || 1, [pagination]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 4,
        p: 4,
        mb: 4,
        border: '1px solid #e2e8f0',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Find Your Perfect Course
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search courses..."
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: 'white',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
              },
            },
          }}
        />
        <TextField
          label="Category"
          select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c: any) => (
            <MenuItem key={c._id || c.name} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Difficulty"
          select
          value={difficulty}
          onChange={(e) => {
            setPage(1);
            setDifficulty(e.target.value);
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem value="">All Levels</MenuItem>
          {difficulties.map((d) => (
            <MenuItem key={d} value={d}>
              {d[0].toUpperCase() + d.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          onClick={() => { setQuery(''); setCategory(''); setDifficulty(''); setPage(1); }}
          sx={{
            borderRadius: 4,
            px: 3,
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': {
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
            },
          }}
        >
          Reset
        </Button>
      </Stack>

      {loading ? (
        <Typography>Loading courses…</Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
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
                      height="200"
                      image={course.thumbnail}
                      alt={course.title}
                      className="course-image"
                      sx={{
                        transition: 'transform 0.3s ease',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/e2e8f0/64748b?text=Course+Image';
                      }}
                    />

                    {/* Overlay on hover */}
                    <Box
                      className="course-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.9), rgba(6, 182, 212, 0.9))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Button
                        variant="contained"
                        href={`/courses/${course._id}`}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: '#2563eb',
                          fontWeight: 600,
                          borderRadius: 4,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            background: 'white',
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </Box>

                    {/* Price badge */}
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
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
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
                        lineHeight: 1.3,
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
                      By {course.instructor?.name} • {Math.floor(course.duration / 60)}h {course.duration % 60}m
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
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
                        sx={{
                          backgroundColor: alpha('#06b6d4', 0.1),
                          color: '#0891b2',
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${course.enrolledCount} enrolled`}
                        variant="outlined"
                        sx={{
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                        }}
                      />
                    </Stack>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        href={`/courses/${course._id}`}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 600,
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                          '&:hover': {
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.05)',
                            color: '#2563eb',
                          },
                        }}
                      >
                        Learn More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Courses;
