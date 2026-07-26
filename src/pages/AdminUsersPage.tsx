import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListUsers } from "../lib/adminApi";
import type { AuthUser } from "../types/auth";

export function AdminUsersPage() {
  const { sessionToken } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin users</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">User directory.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review registered accounts, current roles, and user statuses from the secure backend.
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
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading users...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && !notice ? (
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
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td className="px-5 py-3 font-semibold text-ink">{user.fullName}</td>
                    <td className="px-5 py-3 text-muted">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={user.status === "ACTIVE" ? "success" : "warning"}>{user.status}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{user.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTable>
        ) : null}
      </section>
    </main>
  );
}
