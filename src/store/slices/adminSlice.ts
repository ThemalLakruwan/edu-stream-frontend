// frontend/src/store/slices/adminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

interface AdminUser { _id: string; email: string; name?: string; avatar?: string; role: string; }
interface AdminState {
  admins: AdminUser[];
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}
const initial: AdminState = { admins: [], users: [], loading: false, error: null };

export const fetchAdmins = createAsyncThunk('admin/fetchAdmins', async () => {
  const { data } = await adminAPI.listAdmins({ limit: 100 });
  return data.admins as AdminUser[];
});
export const grantAdmin = createAsyncThunk('admin/grant', async (email: string) => {
  await adminAPI.grantAdmin(email);
  const { data } = await adminAPI.listAdmins({ limit: 100 });
  return data.admins as AdminUser[];
});
export const revokeAdmin = createAsyncThunk('admin/revoke', async (userId: string) => {
  await adminAPI.revokeAdmin(userId);
  const { data } = await adminAPI.listAdmins({ limit: 100 });
  return data.admins as AdminUser[];
});
export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (q?: string) => {
  const { data } = await adminAPI.listUsers({ q, limit: 100 });
  return data.users as AdminUser[];
});

const slice = createSlice({
  name: 'admin',
  initialState: initial,
  reducers: { clearAdminError(s){s.error=null;} },
  extraReducers: b => {
    b.addCase(fetchAdmins.pending, s=>{s.loading=true; s.error=null;})
     .addCase(fetchAdmins.fulfilled, (s,a)=>{s.loading=false; s.admins=a.payload;})
     .addCase(fetchAdmins.rejected, (s,a)=>{s.loading=false; s.error=String(a.error.message||'Failed');})
     .addCase(grantAdmin.fulfilled, (s,a)=>{s.admins=a.payload;})
     .addCase(revokeAdmin.fulfilled, (s,a)=>{s.admins=a.payload;})
     .addCase(fetchUsers.fulfilled, (s,a)=>{s.users=a.payload;});
  }
});

export const { clearAdminError } = slice.actions;
export default slice.reducer;
