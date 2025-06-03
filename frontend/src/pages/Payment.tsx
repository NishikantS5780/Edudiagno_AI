import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LandingLayout from "@/components/layout/RegularLayout"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  CreditCard, 
  Zap, 
  AlertTriangle,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock plan type
interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  image?: string; 
}

type BillingCycle = "monthly" | "yearly";

interface PaymentGateway {
  id: string;
  name: string;
  description?: string;
  icon?: React.ElementType;
}

const availableGateways: PaymentGateway[] = [
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Pay with Credit/Debit Card, Netbanking, Wallets, UPI",
    icon: CreditCard,
  },
  {
    id: "upi",
    name: "UPI",
    description: "Pay with any UPI app (Google Pay, PhonePe, etc.)",
    icon: Zap,
  },
];

const GST_RATE = 0.18; 

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPlanFromState = location.state?.plan as Plan | undefined;
  const billingCycleFromState = location.state?.billingCycle as
    | BillingCycle
    | undefined;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const [basePrice, setBasePrice] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);


  const [selectedGateway, setSelectedGateway] = useState<string>(
    availableGateways[0]?.id || ""
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const defaultPlan: Plan = {
      id: "pro",
      name: "Professional",
      monthlyPrice: 99,
      yearlyPrice: 79,
      description: "Ideal for growing companies.",
    };

    const planToUse = selectedPlanFromState || defaultPlan;
    const cycleToUse = billingCycleFromState || "monthly";

    setSelectedPlan(planToUse);
    setBillingCycle(cycleToUse);

    const currentBasePrice =
      cycleToUse === "yearly"
        ? planToUse.yearlyPrice
        : planToUse.monthlyPrice;

    setBasePrice(currentBasePrice);

  }, [selectedPlanFromState, billingCycleFromState]);

  useEffect(() => {
    const priceAfterDiscount = basePrice - discountAmount;
    const currentGst = priceAfterDiscount * GST_RATE;
    const currentTotal = priceAfterDiscount + currentGst;

    setGstAmount(currentGst);
    setTotalPrice(currentTotal);
  }, [basePrice, discountAmount]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(formData.phone))
      errors.phone = "Phone number must be 10 digits.";
    if (!selectedGateway) errors.gateway = "Please select a payment method.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE20") {
      const calculatedDiscount = basePrice * 0.20;
      setDiscountAmount(calculatedDiscount);
      setCouponApplied(true);
      setPaymentError(null);
    } else if (couponCode.toUpperCase() === "WELCOME10") {
      const calculatedDiscount = basePrice * 0.10;
      setDiscountAmount(calculatedDiscount);
      setCouponApplied(true);
      setPaymentError(null);
    }
    else if (couponCode === "") {
      setDiscountAmount(0);
      setCouponApplied(false);
      setPaymentError(null);
    }
    else {
      setDiscountAmount(0);
      setCouponApplied(false);
      setPaymentError("Invalid coupon code.");
    }
  };


  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    if (!validateForm()) {
      return;
    }
    setIsProcessing(true);
    const paymentData = {
      planId: selectedPlan?.id,
      planName: selectedPlan?.name,
      billingCycle,
      basePrice,
      gstAmount,
      discountAmount,
      totalPrice,
      currency: "INR",
      userDetails: formData,
      gateway: selectedGateway,
    };

    console.log("Initiating payment with:", paymentData);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    navigate("/payment-success", { 
      state: {
        planName: selectedPlan?.name,
        totalAmount: totalPrice,
        email: formData.email,
      },
    });
  };

  if (!selectedPlan) {
    return (
      <LandingLayout>
        <div className="container mx-auto py-20 lg:py-28 px-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">Plan Not Selected</h1>
          <p className="text-muted-foreground mb-8">
            Please select a plan before proceeding to payment.
          </p>
          <Link to="/pricing">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Pricing
            </Button>
          </Link>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <section className="py-12 lg:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-left mb-10 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              EduDiagno
            </h1> 
            <p className="text-muted-foreground text-lg">
              Complete your payment for the{" "}
              <span className="font-semibold text-foreground">
                {selectedPlan.name}
              </span>{" "}
              plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmitPayment} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>
                      Please provide your details for the invoice.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Enter your name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="text-xs text-destructive">
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-xs text-destructive">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="flex">
                         <div className="relative flex-shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">IN (+91)</span>
                            <Input className="pl-14 pr-2 w-24 bg-muted/50" readOnly value=""/>
                        </div>
                        <div className="relative flex-grow">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-10" 
                            required
                          />
                        </div>
                      </div>
                       {formErrors.phone && (
                        <p className="text-xs text-destructive mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                    <CardDescription>
                      All transactions are secure and encrypted. Select your
                      preferred payment method.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedGateway}
                      onValueChange={setSelectedGateway}
                      className="space-y-3"
                    >
                      {availableGateways.map((gateway) => {
                        const Icon = gateway.icon;
                        return (
                          <Label
                            key={gateway.id}
                            htmlFor={gateway.id}
                            className={`flex flex-col p-4 border rounded-md cursor-pointer hover:border-brand transition-all
                                                    ${
                                                      selectedGateway ===
                                                      gateway.id
                                                        ? "border-brand ring-2 ring-brand bg-brand/5"
                                                        : "border-border"
                                                    }`}
                          >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {Icon && (
                                    <Icon className="h-6 w-6 mr-3 text-brand" />
                                    )}
                                    <span className="font-semibold">
                                    {gateway.name}
                                    </span>
                                </div>
                                <RadioGroupItem
                                    value={gateway.id}
                                    id={gateway.id}
                                    className="h-5 w-5"
                                />
                            </div>
                            {gateway.description && (
                              <p className="text-sm text-muted-foreground mt-1 pl-9">
                                {gateway.description}
                              </p>
                            )}
                          </Label>
                        );
                      })}
                    </RadioGroup>
                    {formErrors.gateway && (
                      <p className="text-xs text-destructive mt-2">
                        {formErrors.gateway}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {paymentError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Order`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Copyright EduDiagno © {new Date().getFullYear()}. All rights reserved by EduDiagno.
                </p>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                   {selectedPlan.image && (
                     <img
                        src={selectedPlan.image}
                        alt={selectedPlan.name}
                        className="w-full h-32 object-cover rounded-t-md mb-4"
                      />
                   )}
                  <CardTitle className="flex justify-between items-center">
                    <span>{selectedPlan.name}</span>
                    <Badge variant="outline" className="capitalize">{billingCycle}</Badge>
                  </CardTitle>
                  {selectedPlan.description && (
                    <CardDescription>
                      {selectedPlan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="space-y-1">
                        <Label htmlFor="couponCode">Coupon Code</Label>
                        <div className="flex space-x-2">
                            <Input
                            id="couponCode"
                            placeholder="Enter coupon"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value);
                                if(couponApplied && e.target.value === "") { 
                                    setDiscountAmount(0);
                                    setCouponApplied(false);
                                }
                            }}
                            className="h-9"
                            />
                            <Button
                                type="button"
                                variant={couponApplied ? "secondary" : "default"}
                                onClick={handleApplyCoupon}
                                size="sm"
                                className="h-9 text-xs"
                                disabled={couponApplied && couponCode !== ""}
                            >
                                {couponApplied && couponCode !== "" ? <><ShieldCheck className="h-3 w-3 mr-1"/>Applied</> : "Apply"}
                            </Button>
                        </div>
                        {couponApplied && discountAmount > 0 && (
                           <p className="text-xs text-green-600">Coupon applied! You saved ₹{discountAmount.toFixed(2)}.</p>
                        )}
                    </div>

                  <Separator />
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span>Price</span>
                      <span>₹{basePrice.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>- ₹{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST ({GST_RATE * 100}%)</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                        <span>Secure and Encrypted Payment</span>
                    </div>
                  <Link to="/pricing" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-8">
                      <ArrowLeft className="mr-1.5 h-3 w-3" /> Back to Plans
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Payment;

