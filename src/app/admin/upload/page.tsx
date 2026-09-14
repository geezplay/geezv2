"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createCatalog,
  generatePreviewSheet,
  listAdminCatalogs,
  listAdminClasses,
  listAdminEvents,
  uploadSinglePhoto,
} from "@/services/admin-service";
import type { Catalog, RaceClass, RaceEvent } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/toast-context";
import { IconCheck, IconClose, IconImage, IconUpload } from "@/components/ui/icons";

type UploadStatus = "queued" | "uploading" | "done";

interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  status: UploadStatus;
  bib?: string;
}

const MAX_SIZE = 25 * 1024 * 1024;
let uploadCounter = 0;

function nextUploadId(file: File) {
  uploadCounter += 1;
  return `${file.name}-${file.lastModified}-${uploadCounter}`;
}

export default function AdminUploadPage() {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [classes, setClasses] = useState<RaceClass[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  // Selection states
  const [eventId, setEventId] = useState("");
  const [classId, setClassId] = useState("");
  const [catalogMode, setCatalogMode] = useState<"existing" | "new">("new");
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [newCatalogTitle, setNewCatalogTitle] = useState("");
  const [newCatalogPrice, setNewCatalogPrice] = useState(35000);

  // Upload queue states
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyUploadingId, setCurrentlyUploadingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const { notify } = useToast();

  // Load events and classes on mount
  useEffect(() => {
    let active = true;
    Promise.all([listAdminEvents(), listAdminClasses()])
      .then(([eventList, classList]) => {
        if (!active) return;
        setEvents(eventList);
        setClasses(classList);
        if (eventList.length > 0) {
          const firstEvt = eventList[0].id;
          setEventId(firstEvt);
          const relatedClasses = classList.filter((item) => item.eventId === firstEvt);
          if (relatedClasses.length > 0) {
            setClassId(relatedClasses[0].id);
          }
        }
      })
      .catch((reason: unknown) => {
        notify(reason instanceof Error ? reason.message : "Gagal memuat data awal.", "error");
      });
    return () => {
      active = false;
    };
  }, [notify]);

  // Filter classes by selected event
  const eventClasses = useMemo(
    () => classes.filter((item) => item.eventId === eventId),
    [classes, eventId],
  );

  // Fetch catalogs whenever classId changes
  useEffect(() => {
    if (!classId) {
      setCatalogs([]);
      setSelectedCatalogId("");
      setCatalogMode("new");
      return;
    }
    let active = true;
    listAdminCatalogs({ classId })
      .then((catList) => {
        if (!active) return;
        setCatalogs(catList);
        if (catList.length > 0) {
          setSelectedCatalogId(catList[0].id);
          setCatalogMode("existing");
        } else {
          setSelectedCatalogId("");
          setCatalogMode("new");
        }
      })
      .catch(() => {
        if (active) {
          setCatalogs([]);
          setCatalogMode("new");
        }
      });
    return () => {
      active = false;
    };
  }, [classId]);

  // Check if target is completely ready
  const isTargetReady = Boolean(
    eventId &&
      classId &&
      (catalogMode === "existing"
        ? Boolean(selectedCatalogId)
        : Boolean(newCatalogTitle.trim() && newCatalogPrice >= 0)),
  );

  const activeEvent = events.find((e) => e.id === eventId);
  const activeClass = eventClasses.find((c) => c.id === classId);
  const activeCatalog =
    catalogMode === "existing"
      ? catalogs.find((c) => c.id === selectedCatalogId)
      : null;

  // Add multiple files to queue
  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!isTargetReady) {
      notify("Pilih Event, Kelas balap, dan Katalog terlebih dahulu.", "error");
      return;
    }

    const next: QueueItem[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} (bukan gambar)`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} (ukuran > 25MB)`);
        continue;
      }
      next.push({
        id: nextUploadId(file),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
        status: "queued",
      });
    }

    if (rejected.length > 0) {
      notify(`${rejected.length} file diabaikan karena tidak sesuai syarat.`, "error");
    }

    if (next.length > 0) {
      setItems((current) => [...current, ...next]);
      notify(`${next.length} foto ditambahkan ke antrean upload.`, "info");
    }
  };

  const removeItem = (id: string) => {
    if (isProcessing && currentlyUploadingId === id) {
      notify("Foto ini sedang dalam proses upload, tidak dapat dihapus sekarang.", "error");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearDone = () => {
    setItems((current) => current.filter((item) => item.status !== "done"));
  };

  // Start sequential queue upload
  const startSequentialUpload = async () => {
    if (!isTargetReady) {
      notify("Tentukan Event, Kelas, dan Katalog terlebih dahulu.", "error");
      return;
    }

    const pendingItems = items.filter((item) => item.status === "queued");
    if (pendingItems.length === 0) {
      notify("Tidak ada foto dalam antrean untuk diunggah.", "info");
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;

    try {
      let targetCatId = selectedCatalogId;

      // 1. If in "new" mode, create the catalog first!
      if (catalogMode === "new") {
        notify("Membuat katalog baru…", "info");
        const created = await createCatalog({
          eventId,
          classId,
          title: newCatalogTitle.trim(),
          price: newCatalogPrice,
        });
        targetCatId = created.id;
        setSelectedCatalogId(created.id);
        setCatalogs((curr) => [created, ...curr]);
        setCatalogMode("existing");
        notify(`Katalog "${created.title}" berhasil dibuat.`, "success");
      }

      // 2. Sequential upload one by one
      for (const item of pendingItems) {
        if (!isProcessingRef.current) break;

        setCurrentlyUploadingId(item.id);
        setItems((current) =>
          current.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)),
        );

        try {
          const uploadedPhoto = await uploadSinglePhoto(targetCatId, item.file);
          // Berhasil langsung ditandai hijau seketika!
          setItems((current) =>
            current.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: "done",
                    bib: uploadedPhoto.bibNumber,
                  }
                : i,
            ),
          );
        } catch (error) {
          // Permintaan user: "jika gagal akan terhapus di antrean upload foto"
          const errorMsg = error instanceof Error ? error.message : "Gagal mengunggah foto.";
          notify(`Foto "${item.name}" gagal (${errorMsg}) dan dihapus dari antrean.`, "error");
          setItems((current) => current.filter((i) => i.id !== item.id));
        }
      }

      // Regenerate the catalog preview sheet after all uploads
      notify("Membuat Preview Sheet katalog…", "info");
      try {
        await generatePreviewSheet(targetCatId);
        notify("Preview Sheet berhasil dibuat! Semua foto selesai diproses.", "success");
      } catch (sheetErr) {
        notify(
          sheetErr instanceof Error
            ? `Preview Sheet gagal: ${sheetErr.message}`
            : "Gagal membuat Preview Sheet.",
          "error",
        );
      }
    } catch (catError) {
      notify(
        catError instanceof Error ? catError.message : "Gagal menyiapkan katalog.",
        "error",
      );
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      setCurrentlyUploadingId(null);
    }
  };

  const queuedCount = items.filter((item) => item.status === "queued").length;
  const doneCount = items.filter((item) => item.status === "done").length;

  return (
    <div>
      <AdminPageHeader
        title="Upload Foto"
        description="Pilih Event, Kelas, dan Katalog terlebih dahulu, lalu unggah foto secara berurutan ke antrean."
      />

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* PANEL KIRI: Guided Selection (Event -> Kelas -> Katalog) */}
        <div className="space-y-4">
          <SectionCard
            title="1. Target Katalog"
            description="Tentukan tujuan penyimpanan foto terlebih dahulu."
          >
            <div className="space-y-4">
              {/* Langkah 1: Pilih Event */}
              <Field id="select-event" label="Langkah 1: Pilih Event" required>
                <Select
                  id="select-event"
                  value={eventId}
                  disabled={isProcessing}
                  onChange={(e) => {
                    const nextEvt = e.target.value;
                    setEventId(nextEvt);
                    const matchedClasses = classes.filter((item) => item.eventId === nextEvt);
                    setClassId(matchedClasses[0]?.id ?? "");
                  }}
                >
                  <option value="">-- Pilih Event --</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Langkah 2: Pilih Kelas Balap */}
              <Field id="select-class" label="Langkah 2: Pilih Kelas Balap" required>
                <Select
                  id="select-class"
                  value={classId}
                  disabled={isProcessing || !eventId || eventClasses.length === 0}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  <option value="">
                    {!eventId
                      ? "-- Pilih Event Terlebih Dahulu --"
                      : eventClasses.length === 0
                        ? "-- Belum Ada Kelas Pada Event Ini --"
                        : "-- Pilih Kelas Balap --"}
                  </option>
                  {eventClasses.map((raceClass) => (
                    <option key={raceClass.id} value={raceClass.id}>
                      {raceClass.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Langkah 3: Pilih Katalog atau Buat Baru */}
              <div className="border-t border-line pt-3">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Langkah 3: Target Katalog
                </label>

                <div className="mb-3 flex rounded-lg bg-surface p-1">
                  <button
                    type="button"
                    disabled={isProcessing || !classId}
                    onClick={() => setCatalogMode("existing")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      catalogMode === "existing"
                        ? "bg-white font-semibold text-ink shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Katalog Ada ({catalogs.length})
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || !classId}
                    onClick={() => setCatalogMode("new")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      catalogMode === "new"
                        ? "bg-white font-semibold text-ink shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    + Buat Baru
                  </button>
                </div>

                {catalogMode === "existing" ? (
                  <Field id="select-catalog" label="Pilih Katalog Yang Sudah Ada" required>
                    <Select
                      id="select-catalog"
                      value={selectedCatalogId}
                      disabled={isProcessing || catalogs.length === 0}
                      onChange={(e) => setSelectedCatalogId(e.target.value)}
                    >
                      {catalogs.length === 0 ? (
                        <option value="">-- Belum ada katalog, pilih "+ Buat Baru" --</option>
                      ) : (
                        catalogs.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.title} ({cat.photoCount} foto) - {formatRupiah(cat.price)}
                          </option>
                        ))
                      )}
                    </Select>
                  </Field>
                ) : (
                  <div className="space-y-3 rounded-lg border border-line bg-surface/50 p-3">
                    <Field id="new-cat-title" label="Judul Katalog Baru" required>
                      <Input
                        id="new-cat-title"
                        disabled={isProcessing || !classId}
                        value={newCatalogTitle}
                        onChange={(e) => setNewCatalogTitle(e.target.value)}
                        placeholder="Contoh: Start Grid Seri 1"
                      />
                    </Field>
                    <Field id="new-cat-price" label="Harga per Foto (Rp)" required>
                      <Input
                        id="new-cat-price"
                        type="number"
                        min={0}
                        step={1000}
                        disabled={isProcessing || !classId}
                        value={newCatalogPrice}
                        onChange={(e) => setNewCatalogPrice(Number(e.target.value) || 0)}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Ringkasan Target */}
              <div className="rounded-lg border border-line bg-surface p-3 text-xs">
                <p className="font-semibold text-ink">Status Target:</p>
                {isTargetReady ? (
                  <div className="mt-1.5 space-y-1 text-muted">
                    <p className="flex items-center gap-1 font-medium text-primary-hover">
                      <IconCheck size={14} /> Siap untuk upload foto
                    </p>
                    <p>
                      <strong>Event:</strong> {activeEvent?.name}
                    </p>
                    <p>
                      <strong>Kelas:</strong> {activeClass?.name}
                    </p>
                    <p>
                      <strong>Katalog:</strong>{" "}
                      {catalogMode === "existing"
                        ? activeCatalog?.title
                        : `${newCatalogTitle || "(Judul belum diisi)"} [Baru]`}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-muted">
                    Lengkapi pilihan Event, Kelas balap, dan Katalog di atas untuk membuka form
                    upload foto.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* PANEL KANAN: Antrean Upload Berurutan */}
        <div className="space-y-4">
          <SectionCard
            title="2. Berkas & Antrean Upload"
            description="Format JPG/PNG/WebP, maksimal 25 MB per file. Diupload berurutan satu per satu."
            action={
              <div className="flex items-center gap-2">
                {doneCount > 0 && (
                  <Badge tone="primary">{doneCount} Selesai</Badge>
                )}
                {queuedCount > 0 && (
                  <Badge tone="neutral">{queuedCount} Antrean</Badge>
                )}
                {doneCount > 0 && !isProcessing && (
                  <Button variant="ghost" size="sm" onClick={clearDone}>
                    Bersihkan Selesai
                  </Button>
                )}
              </div>
            }
          >
            {/* Dropzone (Terkunci jika belum pilih target) */}
            {!isTargetReady ? (
              <div className="rounded-xl border-2 border-dashed border-line bg-surface/40 p-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">
                  <IconUpload size={24} />
                </span>
                <p className="mt-3 text-sm font-bold text-muted">Area Upload Terkunci</p>
                <p className="mt-1 text-xs text-muted">
                  Silakan tentukan <strong>Event</strong>, <strong>Kelas balap</strong>, dan{" "}
                  <strong>Katalog</strong> di panel sebelah kiri terlebih dahulu.
                </p>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isProcessing) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (!isProcessing) addFiles(e.dataTransfer.files);
                }}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  isProcessing
                    ? "opacity-50 cursor-not-allowed border-line bg-surface"
                    : dragging
                      ? "border-primary bg-primary-soft"
                      : "border-line bg-surface"
                }`}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <IconUpload size={24} />
                </span>
                <p className="mt-3 text-sm font-bold text-ink">
                  Tarik & lepas banyak foto ke sini
                </p>
                <p className="mt-1 text-xs text-muted">
                  atau klik tombol di bawah untuk memilih banyak file dari perangkat
                </p>
                <input
                  ref={inputRef}
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isProcessing}
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isProcessing}
                  className="mt-4"
                  onClick={() => inputRef.current?.click()}
                >
                  Pilih File Foto Sekaligus
                </Button>
              </div>
            )}

            {/* Tombol Eksekusi Upload Antrean Berurutan */}
            {queuedCount > 0 && isTargetReady && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-soft p-4 border border-primary/20">
                <div>
                  <p className="text-sm font-bold text-ink">
                    {isProcessing
                      ? "Sedang Mengunggah Foto Berurutan…"
                      : `Siap Mengunggah ${queuedCount} Foto`}
                  </p>
                  <p className="text-xs text-muted">
                    {isProcessing
                      ? "Foto diupload satu per satu. Jika berhasil akan langsung bercentang hijau, jika gagal akan otomatis dikeluarkan dari antrean."
                      : "Foto akan diproses secara berurutan agar server tidak kelebihan beban."}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isProcessing}
                  onClick={startSequentialUpload}
                >
                  {isProcessing
                    ? `Mengunggah (${items.findIndex((i) => i.id === currentlyUploadingId) + 1}/${items.length})…`
                    : `Mulai Upload (${queuedCount} Foto)`}
                </Button>
              </div>
            )}

            {/* Daftar Antrean Foto */}
            {items.length === 0 ? (
              <p className="mt-6 text-center text-xs text-muted">
                Belum ada foto dalam antrean.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted px-1">
                  <span>Daftar Foto ({items.length})</span>
                  <span>
                    {doneCount} Berhasil · {queuedCount} Menunggu
                  </span>
                </div>

                <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const isCurrent = currentlyUploadingId === item.id;
                    return (
                      <li
                        key={item.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          item.status === "done"
                            ? "border-primary/30 bg-primary-soft/30"
                            : isCurrent
                              ? "border-primary bg-primary-soft"
                              : "border-line bg-surface"
                        }`}
                      >
                        <span className="text-xs font-bold text-muted w-5 text-right">
                          {index + 1}.
                        </span>

                        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface text-muted">
                          {item.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <IconImage size={20} />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="text-muted">
                              {(item.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span>•</span>
                            {item.status === "done" ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-primary-hover">
                                <IconCheck size={14} /> Berhasil diunggah (Bib: {item.bib || "-"})
                              </span>
                            ) : isCurrent ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-primary animate-pulse">
                                Mengunggah & membuat watermark…
                              </span>
                            ) : (
                              <span className="text-muted">Menunggu antrean…</span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {item.status !== "done" && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={isProcessing}
                              aria-label={`Hapus ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-danger transition-colors disabled:opacity-30"
                            >
                              <IconClose size={16} />
                            </button>
                          )}
                          {item.status === "done" && (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <IconCheck size={16} />
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
