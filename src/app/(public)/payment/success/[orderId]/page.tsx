import type { Metadata } from "next";
import { getOrder } from "@/services/order-service";
import { PaymentSuccessView } from "@/components/payment/payment-success-view";

export const metadata: Metadata = {
  title: "Pembayaran Berhasil",
  robots: { index: false, follow: false },
};

export default async function PaymentSuccessPage(
  props: PageProps<"/payment/success/[orderId]">,
) {
  const { orderId } = await props.params;
  const order = await getOrder(orderId);

  return (
    <div className="container-page py-8">
      <PaymentSuccessView orderId={orderId} serverOrder={order} />
    </div>
  );
}
