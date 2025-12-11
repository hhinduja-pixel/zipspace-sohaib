import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, User, Phone, Mail, Package, Upload, CreditCard, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const storagePlans = [
  { id: "economy", name: "Economy", price: 1499, display: "₹1,499/mo" },
  { id: "walk_in_closet", name: "Walk-In Closet", price: 2499, display: "₹2,499/mo" },
  { id: "store_room", name: "Store Room", price: 4999, display: "₹4,999/mo" },
  { id: "premium", name: "Premium", price: 12999, display: "₹12,999/mo" },
];

const servicePlans = [
  { id: "basic", name: "Basic", price: 0, display: "Free" },
  { id: "elite", name: "Elite", price: 1799, display: "₹1,799/mo" },
];

const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

const BookPickup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    storagePlan: "",
    servicePlan: "basic",
    pickupDate: "",
    pickupTimeSlot: "",
  });

  const calculateTotal = () => {
    const storage = storagePlans.find((p) => p.id === formData.storagePlan);
    const service = servicePlans.find((p) => p.id === formData.servicePlan);
    const subtotal = (storage?.price || 0) + (service?.price || 0);
    // 15% first-time discount
    const discount = subtotal * 0.15;
    return Math.round(subtotal - discount);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storagePlan) {
      toast({ title: "Please select a storage plan", variant: "destructive" });
      return;
    }

    if (!formData.pickupTimeSlot) {
      toast({ title: "Please select a pickup time slot", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;

      // Upload payment screenshot if provided
      if (paymentScreenshot) {
        const fileExt = paymentScreenshot.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("payment-screenshots")
          .upload(fileName, paymentScreenshot);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl.publicUrl;
      }

      const totalAmount = calculateTotal();

      // Insert booking into database
      const { error: bookingError } = await supabase.from("bookings").insert({
        customer_name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        storage_plan: formData.storagePlan as "economy" | "walk_in_closet" | "store_room" | "premium",
        service_plan: formData.servicePlan as "basic" | "elite",
        pickup_date: formData.pickupDate,
        pickup_time_slot: formData.pickupTimeSlot,
        payment_screenshot_url: screenshotUrl,
        total_amount: totalAmount,
        is_first_time: true,
      });

      if (bookingError) throw bookingError;

      // Send notification emails
      await supabase.functions.invoke("send-booking-notification", {
        body: {
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          storagePlan: formData.storagePlan,
          servicePlan: formData.servicePlan,
          pickupDate: formData.pickupDate,
          pickupTimeSlot: formData.pickupTimeSlot,
          totalAmount,
          isFirstTime: true,
        },
      });

      // Navigate to thank you page
      navigate("/thank-you", {
        state: {
          booking: {
            customerName: formData.name,
            email: formData.email,
            pickupDate: formData.pickupDate,
            pickupTimeSlot: formData.pickupTimeSlot,
            address: formData.address,
            totalAmount,
          },
        },
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setFormData((prev) => ({
            ...prev,
            address: "Location detected - We'll confirm the exact address",
          }));
          toast({
            title: "Location Detected",
            description: "We'll confirm your exact address during the call.",
          });
        },
        () => {
          toast({
            title: "Location Access Denied",
            description: "Please enter your address manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <section id="book-pickup" className="section-padding bg-background">
      <div className="container-tight mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Pickup</h2>
            <p className="text-muted-foreground text-lg">
              Fill in your details and we'll pick up your items at your convenience.
              <span className="block mt-2 text-primary font-semibold">
                15% off + Free pickup for first-time customers!
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-10 shadow-soft border border-border">
            {/* Personal Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Pickup Address
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <Button type="button" variant="outline" size="sm" onClick={handleUseLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>
              </div>
            </div>

            {/* Storage Plan Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Select Storage Plan
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {storagePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, storagePlan: plan.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.storagePlan === plan.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-secondary text-sm">{plan.name}</p>
                    <p className="text-primary text-sm font-medium">{plan.display}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Plan Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4">Select Service Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                {servicePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, servicePlan: plan.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.servicePlan === plan.id
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-secondary">{plan.name}</p>
                    <p className="text-primary font-medium">{plan.display}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Pickup Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, pickupTimeSlot: slot })}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          formData.pickupTimeSlot === slot
                            ? "border-primary bg-accent text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment
              </h3>
              
              {formData.storagePlan && (
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(storagePlans.find(p => p.id === formData.storagePlan)?.price || 0) + (servicePlans.find(p => p.id === formData.servicePlan)?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>First-time discount (15%)</span>
                    <span>-₹{Math.round(((storagePlans.find(p => p.id === formData.storagePlan)?.price || 0) + (servicePlans.find(p => p.id === formData.servicePlan)?.price || 0)) * 0.15)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Free Pickup</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-accent/50 rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Pay via UPI/QR Code and upload screenshot:
                </p>
                <p className="font-mono text-primary font-semibold">UPI: zipspace@upi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-screenshot">Upload Payment Screenshot (Optional)</Label>
                <div className="relative">
                  <Input
                    id="payment-screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {paymentScreenshot && (
                    <p className="text-sm text-green-600 mt-1">✓ {paymentScreenshot.name}</p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Book Pickup Now"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookPickup;
