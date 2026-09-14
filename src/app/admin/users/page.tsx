"use client";

import { useEffect, useState } from "react";
import { createAdmin, listAdmins, updateAdmin } from "@/services/admin-service";
import type { AdminRole, AdminUser } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconPlus } from "@/components/ui/icons";

const PERMISSIONS: Array<{ feature: string; owner: string; editor: string; staff: string }> = [
  { feature: "Dashboard", owner: "✓", editor: "✓", staff: "✓" },
  { feature: "Event", owner: "CRUD", editor: "CRUD", staff: "Read" },
  { feature: "Kelas Balap", owner: "CRUD", editor: "CRUD", staff: "Read" },
  { feature: "Upload Foto", owner: "✓", editor: "✓", staff: "✓" },
  { feature: "Publish Katalog", owner: "✓", editor: "✓", staff: "—" },
  { feature: "Order", owner: "CRUD", editor: "Read/Update", staff: "Read" },
  { feature: "Voucher", owner: "CRUD", editor: "Read", staff: "—" },
  { feature: "Laporan", owner: "✓", editor: "✓", staff: "Read" },
  { feature: "Export PDF", owner: "✓", editor: "✓", staff: "—" },
  { feature: "Admin/Role", owner: "✓", editor: "—", staff: "—" },
  { feature: "Pengaturan", owner: "✓", editor: "—", staff: "—" },
];

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [error, setError] = useState("");
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    listAdmins()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat admin.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const invite = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    try {
      const created = await createAdmin({ name: name.trim(), email: email.trim(), role });
      setItems((current) => [...current, created]);
      notify(`Undangan dikirim ke ${email.trim()}.`, "success");
      setOpen(false);
      setName("");
      setEmail("");
      setRole("staff");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menambah admin.");
    }
  };

  const toggleActive = async (admin: AdminUser) => {
    try {
      const updated = await updateAdmin(admin.id, { active: !admin.active });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal mengubah status.", "error");
    }
  };

  const changeRole = async (id: string, nextRole: AdminRole) => {
    try {
      const updated = await updateAdmin(id, { role: nextRole });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      notify("Role diperbarui.", "success");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal mengubah role.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Admin & Role"
        description="Kelola akun admin dan hak akses sesuai peran."
        action={
          <Button
            size="sm"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <IconPlus size={16} />
            Undang admin
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Login terakhir</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-4 py-3 font-semibold text-ink">{admin.name}</td>
                    <td className="px-4 py-3 text-muted">{admin.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        aria-label={`Role untuk ${admin.name}`}
                        value={admin.role}
                        onChange={(event) =>
                          changeRole(admin.id, event.target.value as AdminRole)
                        }
                        className="w-32"
                      >
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="staff">Staff</option>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {admin.lastLogin === "-" ? "-" : formatDateTime(admin.lastLogin)}
                    </td>
                    <td className="px-4 py-3">
                      {admin.active ? (
                        <Badge tone="primary">Aktif</Badge>
                      ) : (
                        <Badge tone="neutral">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleActive(admin)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-primary hover:text-primary-hover"
                      >
                        {admin.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SectionCard
        title="Matriks hak akses"
        description="Ringkasan permission per role (sesuai PRD)."
        className="mt-4"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2 font-semibold">Fitur</th>
                <th className="px-3 py-2 font-semibold">Owner</th>
                <th className="px-3 py-2 font-semibold">Editor</th>
                <th className="px-3 py-2 font-semibold">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PERMISSIONS.map((row) => (
                <tr key={row.feature}>
                  <td className="px-3 py-2 font-medium text-ink">{row.feature}</td>
                  <td className="px-3 py-2 text-muted">{row.owner}</td>
                  <td className="px-3 py-2 text-muted">{row.editor}</td>
                  <td className="px-3 py-2 text-muted">{row.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Undang admin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={invite}>Kirim undangan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field id="admin-name" label="Nama" required>
            <Input
              id="admin-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama lengkap"
            />
          </Field>
          <Field id="admin-email" label="Email" required>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@geezplay.id"
            />
          </Field>
          <Field id="admin-role" label="Role">
            <Select
              id="admin-role"
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
            >
              <option value="owner">Owner</option>
              <option value="editor">Editor</option>
              <option value="staff">Staff</option>
            </Select>
          </Field>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
