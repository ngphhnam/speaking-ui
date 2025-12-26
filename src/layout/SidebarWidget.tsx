import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/modal";
import { useCreatePremiumCheckoutMutation } from "@/store/api/paymentApi";
import * as signalR from "@microsoft/signalr";
import { useAppSelector } from "@/store/hooks";

export default function SidebarWidget() {
  const router = useRouter();
  const [createPremiumCheckout] = useCreatePremiumCheckoutMutation();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  const subscriptionType = (user as any)?.subscriptionType as
    | string
    | undefined;
  const isPremium = (subscriptionType || "").toLowerCase() === "premium";
  const plans = [
    { code: "premium_1m", label: "1 tháng", amount: 10000 },
    { code: "premium_3m", label: "3 tháng", amount: 27000 },
    { code: "premium_6m", label: "6 tháng", amount: 48000 },
    { code: "premium_12m", label: "12 tháng", amount: 84000 },
  ];
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<
    ReturnType<typeof useCreatePremiumCheckoutMutation> extends readonly [
      any,
      ...any[]
    ]
      ? Awaited<ReturnType<
          ReturnType<typeof useCreatePremiumCheckoutMutation>[0]
        >>
      : null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  // Using any to avoid type issues with signalR typings in this setup
  const connectionRef = useRef<any>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  const handleUpgradeClick = () => {
    if (isPremium) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    try {
      setIsLoading(true);
      const data = await createPremiumCheckout({
        planCode: selectedPlan.code,
        clientReference: `order-${selectedPlan.code}-${Date.now()}`,
        amount: selectedPlan.amount,
      }).unwrap();

      if (!data?.qrImageUrl) {
        throw new Error("Missing QR image URL");
      }

      setPaymentData(data);
      setIsConfirmOpen(false);
      setIsQrOpen(true);
      setPaymentStatus("pending");
      if (data.expiredAt) {
        const diff =
          new Date(data.expiredAt).getTime() - new Date().getTime();
        setExpiresIn(diff > 0 ? Math.floor(diff / 1000) : 0);
      } else {
        setExpiresIn(null);
      }
    } catch (error) {
      console.error("Error while upgrading to premium:", error);
      alert("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const shouldConnect = isQrOpen && paymentData?.orderCode;
    if (!shouldConnect) return;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
    const hubUrl = `${baseUrl.replace(/\/+$/, "")}/hubs/payments`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const handlePaymentUpdated = (payload: any) => {
      const matchOrder =
        payload?.orderCode &&
        payload.orderCode.toString() === paymentData.orderCode?.toString();
      const matchLink =
        payload?.paymentLinkId &&
        payload.paymentLinkId.toString() ===
          paymentData.paymentLinkId?.toString();

      if (!matchOrder && !matchLink) return;

      const status = payload?.status || payload?.PaymentStatus;
      if (status) {
        setPaymentStatus(status.toString().toLowerCase());
      }
    };

    connection.on("paymentUpdated", handlePaymentUpdated);

    connection
      .start()
      .catch((err: unknown) => console.error("SignalR connection error:", err));

    return () => {
      connection.off("paymentUpdated", handlePaymentUpdated);
      connection
        .stop()
        .catch((err: unknown) =>
          console.error("SignalR stop error:", err)
        );
      connectionRef.current = null;
    };
  }, [
    isQrOpen,
    paymentData?.orderCode,
    paymentData?.paymentLinkId,
    accessToken,
  ]);

  useEffect(() => {
    if (expiresIn === null) return;
    if (expiresIn <= 0) {
      setPaymentStatus((prev) => prev ?? "expired");
      return;
    }
    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev === null) return prev;
        const next = prev - 1;
        return next >= 0 ? next : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  const formattedExpire = useMemo(() => {
    if (expiresIn === null) return "";
    if (expiresIn <= 0) return "Đã hết hạn";
    const m = Math.floor(expiresIn / 60);
    const s = expiresIn % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, [expiresIn]);

  useEffect(() => {
    if (paymentStatus !== "paid") {
      setRedirectCountdown(null);
      return;
    }
    setRedirectCountdown(10);
  }, [paymentStatus]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push("/user-profile");
      return;
    }
    const timer = setInterval(
      () => setRedirectCountdown((prev) => (prev ?? 1) - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [redirectCountdown, router]);

  return (
    <>
      <div
        className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
      >
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          #1 Speaking Practice
        </h3>
        <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
          Leading Speaking Practice with 100+ Topics and Mock Tests.
        </p>
        {subscriptionType && (
          <p className="mb-3 text-xs font-semibold uppercase text-brand-600 dark:text-brand-300">
            Plan: {subscriptionType}
          </p>
        )}
        {!isPremium && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {plans.map((plan) => (
              <button
                key={plan.code}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`rounded-lg border p-3 text-sm font-semibold transition ${
                  selectedPlan.code === plan.code
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-200"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-200"
                }`}
              >
                <div>{plan.label}</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {plan.amount.toLocaleString("vi-VN")}đ
                </div>
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleUpgradeClick}
          disabled={isPremium}
          className="flex w-full items-center justify-center rounded-lg bg-brand-500 p-3 text-theme-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPremium ? "Bạn đang là Premium" : "Upgrade To Pro"}
        </button>
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <div className="w-full max-w-md px-6 py-6 sm:px-8 sm:py-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Xác nhận nâng cấp Premium
          </h2>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Bạn sẽ nâng cấp tài khoản lên gói Premium ({selectedPlan.label}) với
            giá{" "}
            <span className="font-semibold text-brand-600">
              {selectedPlan.amount.toLocaleString("vi-VN")}đ
            </span>
            . Xác nhận để tiếp tục tạo mã QR thanh toán.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirmUpgrade}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isLoading ? "Đang tạo mã QR..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        className="max-w-lg"
      >
        <div className="w-full px-6 py-6 pb-7 sm:px-8 sm:py-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Quét mã QR để thanh toán
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR bên dưới và
            thanh toán số tiền{" "}
            <span className="font-semibold text-brand-600">
              {selectedPlan.amount.toLocaleString("vi-VN")}đ
            </span>
            .
          </p>

          {paymentData && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
              <div className="relative h-56 w-56">
                {paymentData.qrImageUrl ? (
                  <Image
                    src={paymentData.qrImageUrl}
                    alt="Mã QR thanh toán Premium"
                    fill
                    className="rounded-xl object-contain bg-white"
                  />
                ) : (
                  <QRCodeSVG
                    value={paymentData.qrCode}
                    size={224}
                    level="M"
                    includeMargin
                    className="rounded-xl bg-white p-2"
                  />
                )}
              </div>
              <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                Mã đơn hàng:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {paymentData.orderCode}
                </span>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Chủ TK:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {paymentData.bankAccountName ?? "—"}
                </span>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Số TK:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {paymentData.bankAccountNumber ?? "—"}
                </span>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Nội dung:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {paymentData.description ?? "—"}
                </span>
              </div>
              {paymentData.expiredAt && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Hết hạn lúc:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {new Date(paymentData.expiredAt).toLocaleString()}
                  </span>
                </div>
              )}
              {expiresIn !== null && (
                <div className="text-center text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {expiresIn <= 0
                    ? "QR đã hết hạn, vui lòng tạo lại"
                    : `Còn lại: ${formattedExpire}`}
                </div>
              )}
              <div className="mt-1 text-center text-xs font-medium">
                {paymentStatus === "paid" ? (
                  <span className="text-emerald-600">
                    Thanh toán thành công! Đang nâng cấp tài khoản...
                  </span>
                ) : (
                  <span className="text-amber-600">
                    {paymentStatus === "expired"
                      ? "QR đã hết hạn, vui lòng tạo lại"
                      : "Đang chờ thanh toán..."}
                  </span>
                )}
              </div>
            </div>
          )}

          {paymentData?.checkoutUrl && (
            <button
              type="button"
              onClick={() => window.open(paymentData.checkoutUrl, "_blank")}
              className="mt-5 w-full rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-950"
            >
              Mở trang thanh toán
            </button>
          )}

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Sau khi thanh toán thành công, hệ thống sẽ tự động nâng cấp tài
            khoản của bạn lên Premium. Nếu có vấn đề, vui lòng liên hệ hỗ trợ.
          </p>
        </div>
      </Modal>
    </>
  );
}