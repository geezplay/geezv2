import type { Metadata } from "next";
import { getOrder } from "@/services/order-service";
import { DownloadView } from "@/components/payment/download-view";

export const metadata: Metadata = {
  title: "Unduh Foto",
  robots: { index: false, follow: false },
};

export default async function DownloadPage(
  props: PageProps<"/download/[orderId]">,
) {
  const { orderId } = await props.params;
  const order = await getOrder(orderId);

  return (
    <div className="container-page py-8">
      <DownloadView serverOrder={order} />
    </div>
  );
}
