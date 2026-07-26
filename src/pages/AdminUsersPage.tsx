import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListUsers, adminUpdateUserRole, adminUpdateUserStatus } from "../lib/adminApi";
import type { AdminAssignableRole, AdminUserStatus } from "../types/admin";
import type { AuthUser } from "../types/auth";

const roles: AdminAssignableRole[] = ["STUDENT", "TRAINER", "ADMIN"];
const statuses: AdminUserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING"];

export function AdminUsersPage() {
  const { sessionToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    adminListUsers(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setUsers(response.data.users);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

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

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin users</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">User directory.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review accounts, assign roles, and update user status through secure admin-only backend actions.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <UserCircle className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{users.length}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Total users</p>
            </Card>
            <Card className="p-5">
              <ShieldCheck className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">
                {users.filter((user) => user.status === "ACTIVE").length}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted">Active users</p>
            </Card>
            <Card className="p-5">
              <Mail className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">
                {users.filter((user) => user.role === "ADMIN").length}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted">Admins</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {notice ? (
          <div className="mb-5 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
            {notice}
          </div>
        ) : null}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading users...</p>
          </Card>
        ) : null}

        {!isLoading ? (
          <AdminTable title="All users">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => {
                  const isSaving = savingUserId === user.userId;
                  const isCurrentUser = currentUser?.userId === user.userId;

                  return (
                    <tr key={user.userId}>
                      <td className="px-5 py-3 font-semibold text-ink">{user.fullName}</td>
                      <td className="px-5 py-3 text-muted">{user.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                            disabled={isSaving}
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
                          <Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>{user.role}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
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
                          <Badge tone={user.status === "ACTIVE" ? "success" : "warning"}>{user.status}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{user.userId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminTable>
        ) : null}

        {!isLoading ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted">
            Role and status changes are validated in Apps Script and written to AuditLogs. Your own account cannot
            be suspended from this screen.
          </div>
        ) : null}
      </section>
    </main>
  );
}
