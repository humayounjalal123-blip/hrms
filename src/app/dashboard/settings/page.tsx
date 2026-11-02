"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { getData, resetData, updateUser } from "@/lib/store";
import { User } from "@/lib/types";

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [current, setCurrent] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    getData()
      .then((d) => {
        const u = d.users.find((x) => x.id === user.id) || null;
        setCurrent(u);
        setPhone(u?.phone || "");
      })
      .catch(console.error);
  }, [user]);

  if (!user) return null;

  const roleLabel =
    user.role === "student"
      ? t.roles.student
      : user.role === "teacher"
        ? t.roles.teacher
        : t.roles.admin;

  const saveProfile = async () => {
    await updateUser(user.id, {
      name: name.trim() || user.name,
      phone: phone || current?.phone,
    });
    refresh();
    setMessage(t.settings.profileUpdated);
  };

  return (
    <div>
      <TopBar title={t.settings.title} subtitle={t.settings.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">{t.settings.profile}</h2>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t.settings.fullName}</span>
            <input
              className="input-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t.settings.email}</span>
            <input className="input-base bg-slate-50" value={user.email} disabled />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t.settings.phone}</span>
            <input
              className="input-base"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 ..."
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t.settings.role}</span>
            <input
              className="input-base bg-slate-50"
              value={roleLabel}
              disabled
            />
          </label>
          {message && <p className="text-sm text-primary">{message}</p>}
          <button className="btn-primary" onClick={saveProfile}>
            {t.common.save}
          </button>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <LanguageSwitcher variant="panel" />
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-bold">{t.settings.system}</h2>
            <p className="text-sm text-slate-600">{t.settings.systemHint}</p>
            <button
              className="btn-secondary"
              onClick={async () => {
                await resetData();
                setMessage(t.settings.resetDone);
              }}
            >
              {t.settings.reset}
            </button>
            <button
              className="btn-primary bg-rose-700 hover:bg-rose-800"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              {t.common.logout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
