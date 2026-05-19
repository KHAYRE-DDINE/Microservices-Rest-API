"use client";

import { CheckCircle2, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { useState, Suspense, useEffect, useRef, Component, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

type PaypalPublicSettings = {
  clientId: string;
  environment: string;
};

class PaymentErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("PayPal Script Loading Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const PayPalCardButtonWrapper = ({
  product,
  isProcessing,
  setIsProcessing,
  recordFullTransaction,
  recordFailedTransaction,
  setTransactionId,
  setIsSuccess,
  prod,
  aff,
  camp
}: {
  product: any;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  recordFullTransaction: (method: string, externalRef: string) => Promise<string>;
  recordFailedTransaction: (method: string, reason: string, gatewayRef?: string) => Promise<void>;
  setTransactionId: (v: string) => void;
  setIsSuccess: (v: boolean) => void;
  prod: string;
  aff: string;
  camp: string;
}) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 bg-gray-50/50 rounded-2xl border border-gray-100 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">Initializing secure payment gateway...</p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-100 min-h-[200px] flex flex-col justify-center">
        <h3 className="font-bold text-base flex items-center gap-2">
          <span>⚠️ Payment Gateway Unavailable</span>
        </h3>
        <p className="text-sm text-red-600 leading-relaxed">
          Failed to load PayPal secure scripts. Please refresh the page or try a different connection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Debit or Credit Card</span>
          <div className="flex gap-1">
            <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-400 font-bold">VISA</span>
            <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-400 font-bold">MC</span>
            <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-400 font-bold">AMEX</span>
            <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-400 font-bold">DISC</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Safe and secure card payments processed instantly via PayPal checkout.
        </p>
      </div>

      <PayPalButtons
        fundingSource={FUNDING.CARD}
        style={{ layout: "vertical", shape: "rect", height: 48 }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{
              amount: { value: product.price.toString(), currency_code: "USD" },
              description: product.name
            }],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        }}
        onApprove={async (data, actions) => {
          if (!actions.order) return;
          setIsProcessing(true);
          try {
            const capture = await actions.order.capture();
            const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;
            if (capture.status !== "COMPLETED") {
              await recordFailedTransaction("CREDIT_CARD_DECLINED", "Card was declined. Status: " + capture.status, captureId);
              toast.error("Payment was declined. Please try again.");
              return;
            }
            if (!captureId) throw new Error("Transaction ID missing");
            const txId = await recordFullTransaction("CREDIT_CARD", captureId);
            setTransactionId(txId);
            setIsSuccess(true);
            toast.success("Card Payment Captured Successfully!");
          } catch (err: any) {
            await recordFailedTransaction("CREDIT_CARD_DECLINED", err?.message || "Card Declined");
            if (err?.name === "INSTRUMENT_DECLINED" || err?.message?.includes("INSTRUMENT_DECLINED")) {
              toast.warning("Payment declined. Please try a different card.");
              return actions.restart();
            }
            toast.error("Capture failed.");
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={async (err) => {
          const errMsg = (err as any)?.message || String(err) || "Card Checkout Error";
          await recordFailedTransaction("CREDIT_CARD_FAILED", errMsg);
          toast.error("An error occurred during card checkout.");
          setIsProcessing(false);
        }}
      />
    </div>
  );
};


function CheckoutForm() {
  const searchParams = useSearchParams();
  const aff = searchParams.get("aff") || "1";
  const camp = searchParams.get("camp") || "1";
  const prod = searchParams.get("prod") || "1";

  const [product, setProduct] = useState<{ name: string; category?: string; price: number; description?: string } | null>(null);
  const [paypalSettings, setPaypalSettings] = useState<PaypalPublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('paypal');
  const [transactionId, setTransactionId] = useState("");
  const orderIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function initCheckout() {
      try {
        const [prodRes, settingsRes] = await Promise.all([
          fetch(`/api/backend/product/api/products/${prod}`),
          fetch(`/api/backend/payment/api/settings/paypal/public`)
        ]);

        if (prodRes.ok) setProduct(await prodRes.json());
        if (settingsRes.ok) setPaypalSettings(await settingsRes.json());
      } catch (error) {
        toast.error("Initialization error. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    initCheckout();
  }, [prod]);



  const recordFullTransaction = async (method: string, externalRef: string) => {
    if (!product) throw new Error("No product");

    // 1. Record Conversion
    const convRes = await fetch("/api/backend/conversion/api/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateId: Number(aff),
        campaignId: Number(camp),
        productId: Number(prod),
        saleAmount: product.price
      }),
    });
    const convData = await convRes.json();

    // 2. Record Payment in our DB
    const idempotencyKey = "pay-" + externalRef;
    const payRes = await fetch("/api/backend/payment/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idempotencyKey,
        affiliateId: Number(aff),
        campaignId: Number(camp),
        conversionId: convData.id,
        amount: product.price,
        currency: "USD",
        paymentMethod: method,
        gatewayReference: externalRef
      }),
    });

    if (!payRes.ok) throw new Error("Backend synchronization failed");
    return idempotencyKey.toUpperCase();
  };

  const recordFailedTransaction = async (method: string, reason: string, gatewayRef?: string) => {
    if (!product) return;
    try {
      const idempotencyKey = "fail-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
      const res = await fetch("/api/backend/payment/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          affiliateId: Number(aff) || 1,
          campaignId: Number(camp) || 1,
          conversionId: null,
          amount: product.price,
          currency: "USD",
          paymentMethod: method,
          gatewayReference: gatewayRef || reason.substring(0, 50)
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend rejected failed transaction:", res.status, errText);
      }
    } catch (e) {
      console.error("Error recording failed transaction", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center border border-gray-100">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your order has been processed. The transaction is now visible in the PayPal dashboard.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 text-left">
            <div className="flex justify-between mb-2">
              <span>Amount Paid:</span>
              <span className="font-bold">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono text-xs text-gray-500 break-all ml-4">{transactionId}</span>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium cursor-pointer" onClick={() => window.close()}>
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="bg-gray-50 p-8 border-r border-gray-100 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4 uppercase">
              {product.category || "Premium"}
            </div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-6">{product.description || "Secure checkout for your digital product."}</p>
            <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-4 mt-6">
              <span>Total</span>
              <span>${product.price.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-5 h-5 text-green-500" /> Real-time PayPal Integration
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold mb-6">Payment Details</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              onClick={() => setPaymentMethod('card')}
              className={`rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer border-2 transition ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold">CARD</span>
            </div>
            <div
              onClick={() => setPaymentMethod('paypal')}
              className={`rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer border-2 transition ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
              <div className="font-bold italic text-sm">
                <span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span>
              </div>
              <span className="text-xs font-bold">CHECKOUT</span>
            </div>
          </div>

          {paypalSettings?.clientId ? (
            <PaymentErrorBoundary
              key={paymentMethod}
              fallback={
                <div className="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-100 space-y-3 min-h-[200px] flex flex-col justify-center">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span>⚠️ Payment Gateway Error</span>
                  </h3>
                  <p className="text-sm text-red-600 leading-relaxed">
                    Could not initialize secure payment scripts. Please verify your client ID in the settings or check your connection.
                  </p>
                </div>
              }
            >
              <PayPalScriptProvider options={{
                clientId: paypalSettings.clientId,
                currency: "USD",
                components: "buttons"
              }}>
                {paymentMethod === 'card' ? (
                  <div className="space-y-4 min-h-[150px]">
                    <PayPalCardButtonWrapper
                      product={product}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      recordFullTransaction={recordFullTransaction}
                      recordFailedTransaction={recordFailedTransaction}
                      setTransactionId={setTransactionId}
                      setIsSuccess={setIsSuccess}
                      prod={prod}
                      aff={aff}
                      camp={camp}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 min-h-[150px]">
                    <PayPalButtons
                      fundingSource={FUNDING.PAYPAL}
                      style={{ layout: "vertical", shape: "rect", label: "pay" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: { value: product.price.toString(), currency_code: "USD" },
                            description: product.name
                          }],
                          application_context: {
                            shipping_preference: "NO_SHIPPING"
                          }
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (!actions.order) return;
                        setIsProcessing(true);
                        try {
                          const capture = await actions.order.capture();
                          const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;

                          // 1. Check if the payment status is indeed COMPLETED
                          if (capture.status !== "COMPLETED") {
                            await recordFailedTransaction("PAYPAL_DECLINED", "Payment declined. Status: " + capture.status, captureId);
                            toast.error("Payment was declined. Please try again.");
                            return;
                          }

                          // Extract actual PayPal Capture ID (Transaction ID) matching Webhook Resource ID
                          if (!captureId) throw new Error("Transaction ID missing");
                          const txId = await recordFullTransaction("PAYPAL", captureId);
                          setTransactionId(txId);
                          setIsSuccess(true);
                          toast.success("PayPal Payment Captured!");
                        } catch (err: any) {
                          await recordFailedTransaction("PAYPAL_DECLINED", err?.message || "Decline");
                          // Handle recoverable declination (INSTRUMENT_DECLINED)
                          if (err?.name === "INSTRUMENT_DECLINED" || err?.message?.includes("INSTRUMENT_DECLINED")) {
                            toast.warning("Payment declined. Please try a different method.");
                            return actions.restart();
                          }
                          toast.error("Capture failed.");
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      onError={async (err) => {
                        const errMsg = (err as any)?.message || String(err) || "PayPal Checkout Error";
                        await recordFailedTransaction("PAYPAL_FAILED", errMsg);
                        toast.error("An error occurred during PayPal checkout.");
                        setIsProcessing(false);
                      }}
                    />
                  </div>
                )}
              </PayPalScriptProvider>
            </PaymentErrorBoundary>
          ) : (
            <div className="p-4 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-100">
              PayPal is not configured. Please add your Client ID in the dashboard settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
