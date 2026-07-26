import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Mail,
  RefreshCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListUsers, adminUpdateUserRole, adminUpdateUserStatus } from "../lib/adminApi";
import type { AdminAssignableRole, AdminUserStatus } from "../types/admin";
import type { AuthUser } from "../types/auth";

const roles: AdminAssignableRole[] = ["STUDENT", "TRAINER", "ADMIN"];
const statuses: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING"];
type RoleFilter = "ALL" | AdminAssignableRole;
type StatusFilter = "ALL" | AdminUserStatus;

export function AdminUsersPage() {
  const { sessionToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    void loadUsers();
  }, [sessionToken]);

  async function loadUsers() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await adminListUsers(sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setUsers(response.data.users);
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Users could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: AdminAssignableRole) {
    setSavingUserId(userId);
    setNotice("");

    const response = await adminUpdateUserRole(userId, role, sessionToken);

    setSavingUserId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setUsers((current) => current.map((user) => (user.userId === userId ? response.data.user : user)));
    setNotice("User role updated.");
  }

  async function handleStatusChange(userId: string, status: AdminUserStatus) {
    setSavingUserId(userId);
    setNotice("");

    const response = await adminUpdateUserStatus(userId, status, sessionToken);

    setSavingUserId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setUsers((current) => current.map((user) => (user.userId === userId ? response.data.user : user)));
    setNotice("User status updated.");
  }

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "ACTIVE").length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      suspended: users.filter((user) => user.status === "SUSPENDED").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

        if (!matchesRole || !matchesStatus) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [user.fullName, user.email, user.role, user.status, user.userId]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((first, second) => first.fullName.localeCompare(second.fullName));
  }, [query, roleFilter, statusFilter, users]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge tone="brand">Admin users</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
              User access and role control.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Review accounts, search the directory, assign roles, and manage user status through secure admin-only Apps Script actions.
            </p>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Access posture</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {stats.suspended > 0 ? `${stats.suspended} suspended account${stats.suspended === 1 ? "" : "s"}` : "No suspended accounts"}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  {stats.suspended > 0 ? (
                    <ShieldAlert className="h-8 w-8 text-amber-300" />
                  ) : (
                    <ShieldCheck className="h-8 w-8 text-emerald-300" />
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <DarkStat label="Users" value={stats.total} />
                <DarkStat label="Active" value={stats.active} />
                <DarkStat label="Admins" value={stats.admins} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={<Users className="h-6 w-6" />} label="Total users" value={stats.total} />
          <MetricCard icon={<ShieldCheck className="h-6 w-6" />} label="Active users" value={stats.active} />
          <MetricCard icon={<UserCog className="h-6 w-6" />} label="Admins" value={stats.admins} />
          <MetricCard icon={<ShieldAlert className="h-6 w-6" />} label="Suspended" value={stats.suspended} />
        </div>

        {notice ? (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-700">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} className="rounded-full p-1 transition hover:bg-brand-100">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <Card className="overflow-hidden rounded-[1.5rem]">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-ink">User directory</h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Role and status updates are validated on the backend and written to AuditLogs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadUsers()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, role, status, or user ID"
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="ALL">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="ALL">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="h-4 w-40 rounded-full bg-slate-100" />
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Access</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredUsers.map((user) => {
                    const isSaving = savingUserId === user.userId;
                    const isCurrentUser = currentUser?.userId === user.userId;

                    return (
                      <tr key={user.userId} className="align-top">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-sm font-black text-brand-700">
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-ink">{user.fullName}</p>
                                {isCurrentUser ? <Badge tone="brand">You</Badge> : null}
                              </div>
                              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <StatusBadge status={user.status} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isSaving || isCurrentUser}
                              onChange={(event) =>
                                handleRoleChange(user.userId, event.target.value as AdminAssignableRole)
                              }
                              value={user.role}
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <RoleBadge role={user.role} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isSaving || isCurrentUser}
                              onChange={(event) =>
                                handleStatusChange(user.userId, event.target.value as AdminUserStatus)
                              }
                              value={user.status}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            {isSaving ? <span className="text-xs font-bold text-muted">Saving...</span> : null}
                          </div>
                        </td>
                        <td className="max-w-[14rem] px-5 py-4 font-mono text-xs text-muted">
                          <span className="block truncate">{user.userId}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {!isLoading && filteredUsers.length === 0 ? (
            <div className="border-t border-line p-8 text-center">
              <Search className="mx-auto h-9 w-9 text-slate-400" />
              <h3 className="mt-4 text-lg font-bold text-ink">No users match this view</h3>
              <p className="mt-2 text-sm text-muted">Adjust the search, role filter, or status filter.</p>
            </div>
          ) : null}
        </Card>

        <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted">
          Your own account role and status controls are locked on this screen to reduce the risk of self-lockout.
          Apps Script still validates every protected change before writing to Google Sheets.
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function DarkStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: AdminAssignableRole }) {
  if (role === "ADMIN") {
    return <Badge tone="brand">ADMIN</Badge>;
  }

  if (role === "TRAINER") {
    return <Badge tone="warning">TRAINER</Badge>;
  }

  return <Badge>STUDENT</Badge>;
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  if (status === "ACTIVE") {
    return <Badge tone="success">ACTIVE</Badge>;
  }

  if (status === "SUSPENDED") {
    return <Badge tone="warning">SUSPENDED</Badge>;
  }

  return <Badge>PENDING</Badge>;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
