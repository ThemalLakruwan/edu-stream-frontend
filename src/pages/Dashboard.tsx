// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
  Box, Typography, Card, CardContent, Chip, Button,
  TextField, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
// ✅ NEW
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCurrentSubscription } from '../store/slices/subscriptionSlice';
import { fetchCourses } from '../store/slices/coursesSlice';
import { fetchAdmins, grantAdmin, revokeAdmin } from '../store/slices/adminSlice';
import { fetchMyEnrollments, fetchEnrollmentSummary } from '../store/slices/enrollmentSlice';
import { adminCoursesAPI } from '../services/api';

type AdminCourse = {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  enrolledCount?: number;
  isPublished?: boolean;
  createdAt?: string;
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { current } = useAppSelector((s) => s.subscription);
  const { courses } = useAppSelector((s) => s.courses);
  const { admins } = useAppSelector((s) => s.admin);
  const { mine, summary } = useAppSelector((s) => s.enrollments);
  const isAdmin = user?.role === 'admin';

  const [tab, setTab] = useState(0);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Course form dialog
  const [openCourseDlg, setOpenCourseDlg] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<any>({
    title: '', description: '', category: 'General', difficulty: 'beginner', duration: 60, price: 0, thumbnailFile: null
  });

  // ✅ NEW: Admin course list (includes drafts)
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [loadingAdminCourses, setLoadingAdminCourses] = useState(false);

  // ✅ NEW: track publish/unpublish action per course
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success'
  });

  const loadAdminCourses = async () => {
    if (!isAdmin) return;
    try {
      setLoadingAdminCourses(true);
      const { data } = await adminCoursesAPI.listAll({ includeDrafts: true, limit: 100, sortBy: 'new' });
      setAdminCourses(data.courses || []);
    } catch (e: any) {
      setSnack({ open: true, message: e?.response?.data?.error || 'Failed to load courses', severity: 'error' });
    } finally {
      setLoadingAdminCourses(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchCourses({ limit: 4, sortBy: 'new' }));   // public list
    dispatch(fetchMyEnrollments());
    if (isAdmin) {
      dispatch(fetchAdmins());
      dispatch(fetchEnrollmentSummary());
      loadAdminCourses();                                   // ✅ load drafts too
    }
  }, [dispatch, isAdmin]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    await dispatch(grantAdmin(newAdminEmail)).unwrap();
    setNewAdminEmail('');
    setSnack({ open: true, message: 'Admin granted', severity: 'success' });
  };

  const handleRevokeAdmin = async (id: string) => {
    await dispatch(revokeAdmin(id)).unwrap();
    setSnack({ open: true, message: 'Admin revoked', severity: 'success' });
  };

  const validateCourseForm = () => {
    const errs: string[] = [];
    if (!courseForm.title || courseForm.title.trim().length < 3) errs.push('Title (min 3 chars)');
    if (!courseForm.description || courseForm.description.trim().length < 10) errs.push('Description (min 10 chars)');
    if (!courseForm.category) errs.push('Category');
    if (!['beginner', 'intermediate', 'advanced'].includes(String(courseForm.difficulty))) errs.push('Difficulty');
    if (!(Number(courseForm.duration) > 0)) errs.push('Duration > 0');
    if (!(Number(courseForm.price) >= 0)) errs.push('Price >= 0');
    return errs;
  };

  const submitCourse = async () => {
    try {
      const errs = validateCourseForm();
      if (errs.length) {
        setSnack({ open: true, message: `Please fix: ${errs.join(', ')}`, severity: 'error' });
        return;
      }

      if (editingCourseId) {
        await adminCoursesAPI.update(editingCourseId, {
          title: courseForm.title,
          description: courseForm.description,
          category: courseForm.category,
          difficulty: courseForm.difficulty,
          duration: Number(courseForm.duration),
          price: Number(courseForm.price)
        });
        setSnack({ open: true, message: 'Course updated', severity: 'success' });
      } else {
        const fd = new FormData();
        ['title', 'description', 'category', 'difficulty', 'duration', 'price'].forEach(k => fd.append(k, String(courseForm[k])));
        if (courseForm.thumbnailFile) fd.append('thumbnail', courseForm.thumbnailFile);
        await adminCoursesAPI.create(fd);
        setSnack({ open: true, message: 'Course created (draft)', severity: 'success' });
      }

      setOpenCourseDlg(false);
      setEditingCourseId(null);
      setCourseForm({ title: '', description: '', category: 'General', difficulty: 'beginner', duration: 60, price: 0, thumbnailFile: null });

      await loadAdminCourses();                   // ✅ refresh drafts+published table
      dispatch(fetchCourses({ limit: 10 }));      // refresh public list
      dispatch(fetchEnrollmentSummary());
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to submit course';
      setSnack({ open: true, message: msg, severity: 'error' });
    }
  };

  const startEditCourse = (c: any) => {
    setEditingCourseId(c._id);
    setCourseForm({
      title: c.title, description: c.description, category: c.category, difficulty: c.difficulty,
      duration: c.duration, price: c.price, thumbnailFile: null
    });
    setOpenCourseDlg(true);
  };

  const removeCourse = async (id: string) => {
    try {
      await adminCoursesAPI.remove(id);
      setSnack({ open: true, message: 'Course deleted', severity: 'success' });
      await loadAdminCourses();
      dispatch(fetchCourses({ limit: 10 }));
      dispatch(fetchEnrollmentSummary());
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to delete';
      setSnack({ open: true, message: msg, severity: 'error' });
    }
  };

  // ✅ NEW: Publish/Unpublish
  const togglePublish = async (c: AdminCourse) => {
    try {
      setPublishingId(c._id);
      if (c.isPublished) {
        await adminCoursesAPI.unpublish(c._id);
        setSnack({ open: true, message: 'Course unpublished', severity: 'success' });
      } else {
        await adminCoursesAPI.publish(c._id);
        setSnack({ open: true, message: 'Course published', severity: 'success' });
      }
      await loadAdminCourses();                 // reload admin table (status & badge)
      dispatch(fetchCourses({ limit: 10 }));    // reload public list (visibility changes)
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to change publish state';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {user?.name || 'Learner'} 👋</Typography>

      {!isAdmin && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Subscription</Typography>
                {current ? (
                  <>
                    <Typography>Plan: <b>{current.planType}</b></Typography>
                    <Typography> Status: <Chip size="small" label={current.status} sx={{ ml: 1 }} /></Typography>
                    <Typography sx={{ mt: 1 }}>
                      Period: {new Date(current.currentPeriodStart).toLocaleDateString()} → {new Date(current.currentPeriodEnd).toLocaleDateString()}
                    </Typography>
                    <Button href="/subscription" variant="outlined" sx={{ mt: 2 }}>Manage</Button>
                  </>
                ) : (
                  <>
                    <Typography>No active subscription.</Typography>
                    <Button href="/subscription" variant="contained" sx={{ mt: 2 }}>Choose a plan</Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>My Enrolled Courses</Typography>
                {mine.length === 0 && <Typography variant="body2">You’re not enrolled in any courses yet.</Typography>}
                {mine.map((e, idx) => (
                  <Box key={idx} sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1">{e.course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {e.course.category} • {e.course.difficulty} • Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                    </Typography>
                    <Button size="small" href={`/courses/${(e as any).course._id}`} sx={{ mt: 0.5 }}>Open</Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {isAdmin && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Admins" />
              <Tab label="Courses" />
              <Tab label="Enrollments Summary" />
            </Tabs>

            {/* Admins */}
            {tab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="Admin email" size="small" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAdmin}>Grant</Button>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map(a => (
                      <TableRow key={a._id}>
                        <TableCell>{a.email}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{a.role}</TableCell>
                        <TableCell align="right">
                          <IconButton color="error" onClick={() => handleRevokeAdmin(a._id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {/* Courses */}
            {/* Courses tab */}
            {tab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="subtitle1">All Courses (drafts included)</Typography>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setEditingCourseId(null); setOpenCourseDlg(true); }}>
                    Add Course
                  </Button>
                </Box>

                {loadingAdminCourses ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} /><span>Loading…</span>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Difficulty</TableCell>
                        <TableCell>Enrolled</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminCourses.map(c => (
                        <TableRow key={c._id}>
                          <TableCell>{c.title}</TableCell>
                          <TableCell>{c.category}</TableCell>
                          <TableCell>{c.difficulty}</TableCell>
                          <TableCell>{c.enrolledCount ?? 0}</TableCell>
                          <TableCell>
                            <Chip label={c.isPublished ? 'Published' : 'Draft'} size="small" color={c.isPublished ? 'success' : 'default'} />
                          </TableCell>
                          <TableCell align="right" style={{ whiteSpace: 'nowrap' }}>
                            {/* ✅ NEW: Publish/Unpublish button */}
                            <Button
                              size="small"
                              variant={c.isPublished ? 'outlined' : 'contained'}
                              startIcon={c.isPublished ? <PublicOffIcon /> : <PublicIcon />}
                              onClick={() => togglePublish(c)}
                              disabled={publishingId === c._id}
                              sx={{ mr: 1 }}
                            >
                              {c.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>

                            <IconButton onClick={() => startEditCourse(c)}><EditIcon /></IconButton>
                            <IconButton color="error" onClick={() => removeCourse(c._id)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <Dialog open={openCourseDlg} onClose={() => setOpenCourseDlg(false)} fullWidth maxWidth="sm">
                  <DialogTitle>{editingCourseId ? 'Edit Course' : 'Add Course'}</DialogTitle>
                  <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                      <TextField label="Title" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
                      <TextField label="Description" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} multiline minRows={3} />
                      <TextField label="Category" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} />
                      <TextField label="Difficulty" value={courseForm.difficulty} onChange={e => setCourseForm({ ...courseForm, difficulty: e.target.value })} />
                      <TextField label="Duration (min)" type="number" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} />
                      <TextField label="Price" type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} />
                      {!editingCourseId && <input type="file" accept="image/*" onChange={e => setCourseForm({ ...courseForm, thumbnailFile: e.target.files?.[0] || null })} />}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenCourseDlg(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submitCourse}>{editingCourseId ? 'Save' : 'Create'}</Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {/* Enrollment Summary */}
            {tab === 2 && (
              <Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell align="right">Students</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.map((row) => (
                      <TableRow key={row.courseId}>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.difficulty}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
