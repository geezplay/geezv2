"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createEvent,
  deleteEvent,
  listAdminEvents,
  updateEvent,
  uploadEventCover,
} from "@/services/admin-service";
import type { EventStatus, RaceEvent } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/format";
import { assetUrl } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EventStatusBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconArrowRight, IconPlus, IconTrash } from "@/components/ui/icons";

interface Draft {
  id?: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
  description: string;
}

const emptyDraft: Draft = {
  name: "",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  status: "draft",
  description: "",
};

export default function AdminCatalogsPage() {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    listAdminEvents()
      .then((result) => {
        if (active) setEvents(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat event.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setDraft(emptyDraft);
    setError("");
    setCoverFile(null);
    setCoverPreview("");
    setOpen(true);
  };

  const openEdit = (event: RaceEvent) => {
    setDraft({
      id: event.id,
      name: event.name,
      date: event.date.slice(0, 10),
      location: event.location,
      status: event.status,
      description: event.description,
    });
    setError("");
    setCoverFile(null);
    setCoverPreview(event.coverUrl ?? "");
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim() || !draft.location.trim()) {
      setError("Nama event dan lokasi wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      let saved: RaceEvent;
      if (draft.id) {
        saved = await updateEvent(draft.id, {
          name: draft.name.trim(),
          date: draft.date,
          location: draft.location.trim(),
          status: draft.status,
          description: draft.description.trim(),
        });
        notify("Event diperbarui.", "success");
      } else {
        saved = await createEvent({
          name: draft.name.trim(),
          date: draft.date,
          location: draft.location.trim(),
          status: draft.status,
          description: draft.description.trim(),
        });
        notify("Event baru ditambahkan.", "success");
      }

      if (coverFile) {
        saved = await uploadEventCover(saved.id, coverFile);
        notify("Brosur event diunggah.", "success");
      }

      setEvents((current) => {
        const exists = current.some((event) => event.id === saved.id);
        return exists
          ? current.map((event) => (event.id === saved.id ? saved : event))
          : [saved, ...current];
      });
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan event.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (event: RaceEvent) => {
    const nextStatus = event.status === "ready" ? "draft" : "ready";
    try {
      const updated = await updateEvent(event.id, { status: nextStatus });
      setEvents((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal mengubah status.", "error");
    }
  };

  const remove = async (event: RaceEvent) => {
    try {
      await deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      notify(`Event "${event.name}" dihapus.`, "info");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal menghapus event.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Katalog Foto"
        description="Kelola event dan kelas balap di sini. Pilih event untuk melihat kelas dan foto yang sudah diupload."
        action={
          <Button onClick={openCreate} size="sm">
            <IconPlus size={16} />
            Event baru
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm font-medium text-danger">{error}</p>
      ) : events.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Belum ada event. Tambahkan event baru untuk mulai mengunggah foto.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col rounded-xl border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <EventStatusBadge status={event.status} />
              </div>
              {event.coverUrl ? (
                <span
                  aria-hidden="true"
                  className="mt-3 block h-28 w-full rounded-lg bg-slate-900 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${encodeURI(assetUrl(event.coverUrl))})`,
                  }}
                />
              ) : null}
              <Link
                href={`/admin/catalogs/${event.id}`}
                className="mt-3 min-w-0"
                aria-label={`Lihat kelas event ${event.name}`}
              >
                <h2 className="text-base font-bold leading-snug text-ink hover:text-primary-hover">
                  {event.name}
                </h2>
                <p className="mt-1 text-xs text-muted">{formatDate(event.date)}</p>
                <p className="text-xs text-muted">{event.location}</p>
              </Link>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface py-2">
                  <dt className="text-[11px] text-muted">Kelas</dt>
                  <dd className="text-sm font-bold text-ink">{event.classCount}</dd>
                </div>
                <div className="rounded-lg bg-surface py-2">
                  <dt className="text-[11px] text-muted">Katalog</dt>
                  <dd className="text-sm font-bold text-ink">{event.catalogCount}</dd>
                </div>
                <div className="rounded-lg bg-surface py-2">
                  <dt className="text-[11px] text-muted">Foto</dt>
                  <dd className="text-sm font-bold text-ink">
                    {formatNumber(event.photoCount)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <Link
                  href={`/admin/catalogs/${event.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Lihat kelas
                  <IconArrowRight size={16} />
                </Link>
                <div className="ml-auto flex gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleStatus(event)}
                  >
                    {event.status === "ready" ? "Set draft" : "Set siap"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => remove(event)}
                    aria-label={`Hapus event ${event.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={draft.id ? "Edit event" : "Event baru"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field id="catalog-event-name" label="Nama event" required>
            <Input
              id="catalog-event-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Contoh: Kejurnas Road Race Seri 2"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="catalog-event-date" label="Tanggal" required>
              <Input
                id="catalog-event-date"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              />
            </Field>
            <Field id="catalog-event-status" label="Status">
              <Select
                id="catalog-event-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value as EventStatus })
                }
              >
                <option value="draft">Belum siap</option>
                <option value="ready">Siap</option>
              </Select>
            </Field>
          </div>
          <Field id="catalog-event-location" label="Lokasi" required>
            <Input
              id="catalog-event-location"
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              placeholder="Contoh: Sirkuit Sentul, Bogor"
            />
          </Field>
          <Field id="catalog-event-description" label="Deskripsi">
            <Input
              id="catalog-event-description"
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              placeholder="Deskripsi singkat event"
            />
          </Field>
          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-ink">Brosur event</span>
            <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
              <span
                aria-hidden="true"
                className="h-16 w-24 shrink-0 rounded-lg bg-white bg-cover bg-center ring-1 ring-line"
                style={{
                  backgroundImage: coverPreview
                    ? `url(${encodeURI(
                        coverPreview.startsWith("blob:") ||
                          coverPreview.startsWith("data:")
                          ? coverPreview
                          : assetUrl(coverPreview),
                      )})`
                    : undefined,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">
                  {coverFile
                    ? coverFile.name
                    : coverPreview
                      ? "Brosur saat ini"
                      : "Belum ada brosur"}
                </p>
              </div>
            </div>
            <input
              id="event-cover"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setCoverFile(file);
                  setCoverPreview(URL.createObjectURL(file));
                }
                event.target.value = "";
              }}
              className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
            />
            <p className="text-xs text-muted">
              Gambar brosur untuk kartu event di halaman publik. Format PNG/JPG/WebP,
              maks 25 MB.
            </p>
          </div>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
