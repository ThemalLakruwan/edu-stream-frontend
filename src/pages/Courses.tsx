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
    <Box>
      <Typography variant="h4" gutterBottom>
        Browse Courses
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search"
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
          fullWidth
        />
        <TextField
          label="Category"
          select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
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
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {difficulties.map((d) => (
            <MenuItem key={d} value={d}>
              {d[0].toUpperCase() + d.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={() => { setQuery(''); setCategory(''); setDifficulty(''); setPage(1); }}>
          Reset
        </Button>
      </Stack>

      {loading ? (
        <Typography>Loading courses…</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card>
                  <CardMedia component="img" height="180" image={course.thumbnail} alt={course.title} />
                  <CardContent>
                    <Typography variant="h6">{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      By {course.instructor?.name} • {Math.floor(course.duration / 60)}h {course.duration % 60}m
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip size="small" label={course.category} />
                      <Chip size="small" label={course.difficulty} />
                      <Chip size="small" label={`${course.enrolledCount} enrolled`} />
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" variant="outlined" href={`/courses/${course._id}`}>
                        View details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination page={page} count={totalPages} onChange={(_, val) => setPage(val)} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Courses;
