"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  listAdminClasses,
  listAdminEvents,
  uploadCatalog,
} from "@/services/admin-service";
import type { RaceClass, RaceEvent } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/toast-context";
import { IconCheck, IconClose, IconImage, IconUpload } from "@/components/ui/icons";

type UploadStatus = "queued" | "uploading" | "processing" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  message?: string;
  bib?: string;
}

const MAX_SIZE = 25 * 1024 * 1024;

function randomBib() {
  return String(1 + Math.floor(Math.random() * 240));
}

let uploadCounter = 0;

function nextUploadId(file: File) {
  uploadCounter += 1;
  return `${file.name}-${file.lastModified}-${uploadCounter}`;
}

export default function AdminUploadPage() {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [classes, setClasses] = useState<RaceClass[]>([]);
  const [eventId, setEventId] = useState("");
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(35000);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<Map<string, number>>(new Map());
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([listAdminEvents(), listAdminClasses()])
      .then(([eventList, classList]) => {
        if (!active) return;
        setEvents(eventList);
        setClasses(classList);
        const firstEvent = eventList[0]?.id ?? "";
        setEventId(firstEvent);
        setClassId(classList.find((item) => item.eventId === firstEvent)?.id ?? "");
      })
      .catch((reason: unknown) => {
        notify(reason instanceof Error ? reason.message : "Gagal memuat data.", "error");
      });
    return () => {
      active = false;
    };
  }, [notify]);

  const eventClasses = useMemo(
    () => classes.filter((item) => item.eventId === eventId),
    [classes, eventId],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearInterval(timer));
      map.clear();
    };
  }, []);

  const startUpload = (id: string) => {
    const existing = timers.current.get(id);
    if (existing) window.clearInterval(existing);
    const timer = window.setInterval(() => {
      setItems((current) =>
        current.map((item) => {
          if (item.id !== id) return item;
          if (item.progress < 70) {
            return {
              ...item,
              status: "uploading",
              progress: Math.min(70, item.progress + 12),
            };
          }
          return {
            ...item,
            status: "processing",
            progress: Math.min(95, item.progress + 7),
          };
        }),
      );
    }, 180);
    timers.current.set(id, timer);

    window.setTimeout(() => {
      window.clearInterval(timer);
      timers.current.delete(id);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "done", progress: 100, bib: randomBib() }
            : item,
        ),
      );
    }, 2600);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: UploadItem[] = [];
    for (const file of Array.from(files)) {
      const id = nextUploadId(file);
      const valid = file.type.startsWith("image/") && file.size <= MAX_SIZE;
      next.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: valid ? URL.createObjectURL(file) : "",
        progress: 0,
        status: valid ? "queued" : "error",
        message: valid
          ? undefined
          : !file.type.startsWith("image/")
            ? "Tipe file bukan gambar."
            : "Ukuran melebihi 25 MB.",
      });
    }
    setItems((current) => [...next, ...current]);
    next.filter((item) => item.status === "queued").forEach((item) => startUpload(item.id));
    notify(`${next.length} file ditambahkan ke antrean.`, "info");
  };

  const retry = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: "queued", progress: 0, message: undefined }
          : item,
      ),
    );
    startUpload(id);
  };

  const remove = (id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearInterval(timer);
      timers.current.delete(id);
    }
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const doneItems = items.filter((item) => item.status === "done");
  const errorCount = items.filter((item) => item.status === "error").length;
  const allDone = items.length > 0 && doneItems.length === items.length;

  const publish = async () => {
    if (!eventId || !classId) {
      notify("Pilih event dan kelas terlebih dahulu.", "error");
      return;
    }
    setPublishing(true);
    try {
      const catalog = await uploadCatalog({
        eventId,
        classId,
        title:
          title.trim() ||
          `Katalog ${new Date().toLocaleDateString("id-ID")} - ${eventClasses.find(
            (item) => item.id === classId,
          )?.name ?? ""}`,
        price,
        files: doneItems.map((item) => item.file),
      });
      notify(`Katalog "${catalog.title}" dipublish (${catalog.photoCount} foto).`, "success");
      setItems([]);
      setTitle("");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal publish katalog.", "error");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Upload Foto"
        description="Unggah banyak foto sekaligus. Sistem membuat thumbnail, preview ber-watermark, dan membaca nomor bib via OCR."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Berkas"
          description="Format JPG/PNG/WebP, maksimal 25 MB per file."
          action={
            <div className="flex gap-2">
              {errorCount > 0 ? <Badge tone="danger">{errorCount} gagal</Badge> : null}
              {doneItems.length > 0 ? (
                <Badge tone="primary">{doneItems.length} selesai</Badge>
              ) : null}
            </div>
          }
        >
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-primary bg-primary-soft" : "border-line bg-surface"
            }`}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
              <IconUpload size={24} />
            </span>
            <p className="mt-3 text-sm font-bold text-ink">Tarik & lepas foto ke sini</p>
            <p className="mt-1 text-xs text-muted">atau pilih file dari perangkat kamu</p>
            <input
              ref={inputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              Pilih file
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-center text-sm text-muted">
              Belum ada file. Foto akan tampil di sini setelah dipilih.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-line p-3"
                >
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface text-muted">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={`Preview ${item.name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IconImage size={20} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    {item.status === "error" ? (
                      <p className="text-xs font-medium text-danger">{item.message}</p>
                    ) : item.status === "done" ? (
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary-hover">
                        <IconCheck size={13} />
                        Selesai · Bib {item.bib}
                      </p>
                    ) : (
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-muted">
                      {(item.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                      {item.status === "processing"
                        ? "Memproses OCR & watermark…"
                        : item.status === "uploading"
                          ? "Mengunggah…"
                          : item.status === "queued"
                            ? "Menunggu…"
                            : item.status === "done"
                              ? "Terunggah"
                              : "Gagal"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.status === "error" ? (
                      <Button variant="secondary" size="sm" onClick={() => retry(item.id)}>
                        Ulangi
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Hapus ${item.name} dari antrean`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-danger"
                    >
                      <IconClose size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Target katalog">
            <div className="space-y-4">
              <Field id="upload-event" label="Event" required>
                <Select
                  id="upload-event"
                  value={eventId}
                  onChange={(event) => {
                    setEventId(event.target.value);
                    const first = classes.find(
                      (item) => item.eventId === event.target.value,
                    );
                    setClassId(first?.id ?? "");
                  }}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="upload-class" label="Kelas balap" required>
                <Select
                  id="upload-class"
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                >
                  {eventClasses.map((raceClass) => (
                    <option key={raceClass.id} value={raceClass.id}>
                      {raceClass.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="upload-title" label="Judul katalog">
                <Input
                  id="upload-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Start Grid 1"
                />
              </Field>
              <Field id="upload-price" label="Harga per foto">
                <Input
                  id="upload-price"
                  type="number"
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value) || 0)}
                />
              </Field>
              <p className="text-xs text-muted">
                Preview publik menampilkan {formatRupiah(price)} per foto.
              </p>
              <p className="rounded-lg border border-line bg-surface p-3 text-xs text-muted">
                Sistem menyimpan foto original secara privat dan hanya menampilkan
                preview ber-watermark pada katalog.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Publish">
            <p className="text-sm text-muted">
              {items.length === 0
                ? "Tambahkan foto terlebih dahulu."
                : allDone
                  ? "Semua foto selesai diproses dan siap dipublish."
                  : "Publish aktif setelah semua foto selesai diproses."}
            </p>
            <Button
              fullWidth
              className="mt-3"
              disabled={!allDone || publishing}
              onClick={publish}
            >
              {publishing ? "Mempublish…" : `Publish (${doneItems.length})`}
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
