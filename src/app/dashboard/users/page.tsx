"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { getEmailError, normalizeEmail } from "@/lib/email";
import { getData, saveData, updateUser } from "@/lib/store";
import { AppData, Role, User } from "@/lib/types";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "pass123",
    role: "student" as Role,
    phone: "",
    className: "",
  });

  const reload = async () => setData(await getData());

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    reload();
    window.addEventListener("hrms-data-updated", reload);
    return () => window.removeEventListener("hrms-data-updated", reload);
  }, []);

  if (!user || !data || user.role !== "admin") {
    return <div className="text-slate-500">Loading...</div>;
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    const emailErr = getEmailError(form.email);
    if (emailErr) {
      setMessage(emailErr);
      return;
    }
    const email = normalizeEmail(form.email);
    if (data.users.some((u) => u.email.toLowerCase() === email)) {
      setMessage("Email already exists.");
      return;
    }
    const next: User = {
      id: `u-${Date.now()}`,
      name: form.name.trim(),
      email,
      password: form.password,
      role: form.role,
      phone: form.phone,
      className: form.className || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...data, users: [...data.users, next] };
    await saveData(updated);
    setMessage("User account created.");
    setForm({
      name: "",
      email: "",
      password: "pass123",
      role: "student",
      phone: "",
      className: "",
    });
  };

  return (
    <div>
      <TopBar
        title="User Management"
        subtitle="Create, update, deactivate, and view user accounts"
      />

      <form onSubmit={onCreate} className="card mb-6 grid gap-4 md:grid-cols-3">
        <h2 className="md:col-span-3 text-lg font-bold">Create User Account</h2>
        <input
          className="input-base"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input-base"
          type="text"
          placeholder="yourname@gmail.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          title="Gmail format: letters/numbers/periods, one @, e.g. name@gmail.com"
          required
        />
        <input
          className="input-base"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="input-base"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Administrator</option>
        </select>
        <input
          className="input-base"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="input-base"
          placeholder="Class name (optional)"
          value={form.className}
          onChange={(e) => setForm({ ...form, className: e.target.value })}
        />
        <div className="md:col-span-3">
          {message && <p className="mb-3 text-sm text-primary">{message}</p>}
          <button className="btn-primary" type="submit">
            Create Account
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Class</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="py-3">
                  <div className="font-semibold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="py-3 capitalize text-slate-600">{u.role}</td>
                <td className="py-3 text-slate-600">{u.className || "—"}</td>
                <td className="py-3">
                  <StatusBadge status={u.active ? "active" : "inactive"} />
                </td>
                <td className="py-3">
                  <button
                    disabled={u.id === user.id}
                    onClick={async () => {
                      await updateUser(u.id, { active: !u.active });
                    }}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-40"
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
