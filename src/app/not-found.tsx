import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { IconSearch } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-bold text-primary-hover">404</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Halaman yang kamu cari mungkin sudah dipindahkan atau tidak pernah ada. Coba
        telusuri event atau cari lewat nomor start.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/events">Lihat daftar event</ButtonLink>
        <ButtonLink href="/search" variant="secondary">
          <IconSearch size={18} />
          Cari foto
        </ButtonLink>
      </div>
      <Link href="/" className="mt-4 text-sm font-semibold text-muted hover:text-primary-hover">
        Kembali ke beranda
      </Link>
    </div>
  );
}
