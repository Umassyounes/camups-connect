'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminUserRow {
  id: number;
  name: string | null;
  email: string | null;
  role: 'admin' | 'moderator' | 'user';
  isSuspended: boolean;
  isAdmin: boolean;
  createdAt: string;
  listingsCount: number;
  transactionsCount: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

const SEARCH_DEBOUNCE_MS = 300;
const USERS_PER_PAGE = 25;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: USERS_PER_PAGE });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (roleFilter) params.set('role', roleFilter);
        if (statusFilter) params.set('status', statusFilter);
        params.set('page', currentPage.toString());
        params.set('limit', USERS_PER_PAGE.toString());

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.status === 403) {
          router.push('/');
          return;
        }

        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || 'Failed to load users');
        }

        if (!isMounted) return;
        setUsers(body.data || []);
        setCurrentAdminId(body.currentAdminId ?? null);
        if (body.pagination) {
          setPagination(body.pagination);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load admin users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, roleFilter, statusFilter, refreshKey, router, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const setUserUpdating = (userId: number, isUpdating: boolean) => {
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      if (isUpdating) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const handleRoleChange = async (user: AdminUserRow, targetRole: 'admin' | 'moderator' | 'user') => {
    setUserUpdating(user.id, true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to update role');
      }

      setUsers((prev) =>
        prev.map((row) =>
          row.id === user.id
            ? { ...row, role: body.data.role, isAdmin: body.data.isAdmin }
            : row
        )
      );
    } catch (err) {
      console.error('Failed to update role:', err);
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUserUpdating(user.id, false);
    }
  };

  const handleRoleToggle = async (user: AdminUserRow) => {
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    await handleRoleChange(user, targetRole);
  };

  const handleSuspensionToggle = async (user: AdminUserRow) => {
    const nextStatus = user.isSuspended ? 'active' : 'suspended';
    setUserUpdating(user.id, true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to update status');
      }

      setUsers((prev) =>
        prev.map((row) =>
          row.id === user.id
            ? { ...row, isSuspended: body.data.isSuspended }
            : row
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUserUpdating(user.id, false);
    }
  };

  const isUpdating = (userId: number) => updatingIds.has(userId);

  const totalAdmins = useMemo(
    () => users.filter((user) => user.role === 'admin').length,
    [users]
  );

  const totalModerators = useMemo(
    () => users.filter((user) => user.role === 'moderator').length,
    [users]
  );

  const totalSuspended = useMemo(
    () => users.filter((user) => user.isSuspended).length,
    [users]
  );

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">👥 User Management</h1>
          <p className="text-foreground-secondary">
            Manage user roles, suspensions, and review platform activity.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="px-4 py-2 border border-border rounded-md hover:bg-background-secondary transition-colors text-foreground"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-card p-4 border border-border shadow-sm">
          <div className="text-sm text-foreground-secondary">Total Visible Users</div>
          <div className="text-2xl font-semibold text-foreground mt-1">{users.length}</div>
        </div>
        <div className="rounded-lg bg-card p-4 border border-border shadow-sm">
          <div className="text-sm text-foreground-secondary">Admins</div>
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">{totalAdmins}</div>
        </div>
        <div className="rounded-lg bg-card p-4 border border-border shadow-sm">
          <div className="text-sm text-foreground-secondary">Moderators</div>
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">{totalModerators}</div>
        </div>
        <div className="rounded-lg bg-card p-4 border border-border shadow-sm">
          <div className="text-sm text-foreground-secondary">Suspended Users</div>
          <div className={`text-2xl font-semibold mt-1 ${totalSuspended > 0 ? 'text-red-500' : 'text-foreground'}`}>
            {totalSuspended}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-foreground">Search</label>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Role</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        {(debouncedSearch || roleFilter || statusFilter) && (
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => {
              setRoleFilter('');
              setStatusFilter('');
              setSearchTerm('');
              setDebouncedSearch('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Users</h2>
          <span className="text-sm text-foreground-secondary">Showing {users.length} result(s)</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-foreground-secondary">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-foreground-secondary">
            No users found. Adjust filters or try a different search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-background-secondary text-left text-sm uppercase tracking-wide text-foreground-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Listings</th>
                  <th className="px-4 py-3 font-medium">Transactions</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {users.map((user) => {
                  const disabling = isUpdating(user.id);
                  const isSelf = currentAdminId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-background-secondary/60">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {user.name || 'Unnamed User'}
                          {isSelf && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-foreground-secondary">{user.email || 'No email on file'}</div>
                        <div className="text-xs text-foreground-secondary">User ID: {user.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wide ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : user.role === 'moderator'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-background-secondary text-foreground-secondary'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.isSuspended
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-foreground font-medium">{user.listingsCount}</td>
                      <td className="px-4 py-4 text-foreground font-medium">{user.transactionsCount}</td>
                      <td className="px-4 py-4 text-foreground-secondary">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* Role Management Dropdown */}
                          <select
                            value={user.role}
                            disabled={disabling || isSelf}
                            onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'moderator' | 'user')}
                            className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors bg-background ${
                              disabling || isSelf
                                ? 'cursor-not-allowed border-border text-foreground-secondary'
                                : 'border-border text-foreground hover:border-primary cursor-pointer'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleSuspensionToggle(user)}
                            disabled={disabling || isSelf}
                            className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                              disabling || isSelf
                                ? 'cursor-not-allowed border-border text-foreground-secondary'
                                : user.isSuspended
                                  ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/20'
                                  : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20'
                            }`}
                          >
                            {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-foreground-secondary">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 rounded-md border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary text-foreground"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-background-secondary text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 rounded-md border border-border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary text-foreground"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
