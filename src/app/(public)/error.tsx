"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconAlert } from "@/components/ui/icons";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <IconAlert size={30} />
      </span>
      <h1 className="mt-4 text-2xl font-black tracking-tight text-ink">
        Terjadi kesalahan
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Maaf, halaman ini gagal dimuat. Coba muat ulang sebentar lagi.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Coba lagi</Button>
        <ButtonLink href="/" variant="secondary">
          Kembali ke beranda
        </ButtonLink>
      </div>
    </div>
  );
}
