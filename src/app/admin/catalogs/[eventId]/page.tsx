"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  createClass,
  deleteClass,
  listAdminClasses,
  listAdminEvents,
  updateClass,
} from "@/services/admin-service";
import type { EventStatus, RaceClass, RaceEvent } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EventStatusBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconArrowLeft, IconArrowRight, IconPlus, IconTrash } from "@/components/ui/icons";

interface Draft {
  id?: string;
  name: string;
  order: number;
  status: EventStatus;
}

export default function AdminEventCatalogsPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<RaceEvent | null>(null);
  const [classes, setClasses] = useState<RaceClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: "", order: 1, status: "ready" });
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([listAdminEvents(), listAdminClasses()])
      .then(([events, classList]) => {
        if (!active) return;
        setEvent(events.find((item) => item.id === eventId) ?? null);
        setClasses(
          classList
            .filter((item) => item.eventId === eventId)
            .sort((a, b) => a.order - b.order),
        );
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat kelas.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  const openCreate = () => {
    setDraft({ name: "", order: classes.length + 1, status: "ready" });
    setError("");
    setOpen(true);
  };

  const openEdit = (raceClass: RaceClass) => {
    setDraft({
      id: raceClass.id,
      name: raceClass.name,
      order: raceClass.order,
      status: raceClass.status,
    });
    setError("");
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }
    try {
      if (draft.id) {
        const updated = await updateClass(draft.id, {
          name: draft.name.trim(),
          order: draft.order,
          status: draft.status,
        });
        setClasses((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        notify("Kelas diperbarui.", "success");
      } else {
        const created = await createClass({
          eventId,
          name: draft.name.trim(),
          order: draft.order,
          status: draft.status,
        });
        setClasses((current) =>
          [...current, created].sort((a, b) => a.order - b.order),
        );
        notify("Kelas baru ditambahkan.", "success");
      }
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan kelas.");
    }
  };

  const remove = async (raceClass: RaceClass) => {
    try {
      await deleteClass(raceClass.id);
      setClasses((current) => current.filter((item) => item.id !== raceClass.id));
      notify(`Kelas "${raceClass.name}" dihapus.`, "info");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal menghapus kelas.", "error");
    }
  };

  return (
    <div>
      <Link
        href="/admin/catalogs"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary-hover"
      >
        <IconArrowLeft size={16} />
        Semua event
      </Link>
      <AdminPageHeader
        title={event?.name ?? "Kelas Balap"}
        description="Kelola kelas balap dan pilih kelas untuk melihat foto yang sudah diupload."
        action={
          <Button onClick={openCreate} size="sm">
            <IconPlus size={16} />
            Kelas baru
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm font-medium text-danger">{error}</p>
      ) : classes.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Event ini belum memiliki kelas. Tambahkan kelas baru.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((raceClass) => (
            <li
              key={raceClass.id}
              className="flex flex-col rounded-xl border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <EventStatusBadge status={raceClass.status} />
                <span className="text-xs text-muted">Urutan {raceClass.order}</span>
              </div>
              <Link
                href={`/admin/catalogs/${eventId}/${raceClass.id}`}
                className="mt-3"
                aria-label={`Lihat foto kelas ${raceClass.name}`}
              >
                <h2 className="text-base font-bold leading-snug text-ink hover:text-primary-hover">
                  {raceClass.name}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {raceClass.catalogCount} katalog
                </p>
              </Link>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                <Link
                  href={`/admin/catalogs/${eventId}/${raceClass.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Lihat foto
                  <IconArrowRight size={16} />
                </Link>
                <div className="ml-auto flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(raceClass)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => remove(raceClass)}
                    aria-label={`Hapus kelas ${raceClass.name}`}
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
        title={draft.id ? "Edit kelas" : "Kelas baru"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field id="catalog-class-name" label="Nama kelas" required>
            <Input
              id="catalog-class-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Contoh: Matic 150cc Open"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="catalog-class-order" label="Urutan tampil">
              <Input
                id="catalog-class-order"
                type="number"
                min={1}
                value={draft.order}
                onChange={(event) =>
                  setDraft({ ...draft, order: Number(event.target.value) || 1 })
                }
              />
            </Field>
            <Field id="catalog-class-status" label="Status">
              <Select
                id="catalog-class-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value as EventStatus })
                }
              >
                <option value="ready">Siap</option>
                <option value="draft">Belum siap</option>
              </Select>
            </Field>
          </div>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
