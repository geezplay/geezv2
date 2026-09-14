import type { Metadata } from "next";
import { getOrder } from "@/services/order-service";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PaymentStatusView } from "@/components/payment/payment-status-view";

export const metadata: Metadata = {
  title: "Status Pembayaran",
  robots: { index: false, follow: false },
};

export default async function PaymentStatusPage(
  props: PageProps<"/payment/status/[orderId]">,
) {
  const { orderId } = await props.params;
  const order = await getOrder(orderId);

  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Status Pembayaran" },
        ]}
      />
      <PaymentStatusView serverOrder={order} />
    </div>
  );
}
