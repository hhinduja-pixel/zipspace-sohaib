import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, User, Phone, Mail, Package, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const storagePlans = [
  { id: "economy", name: "Economy Plan", description: "Up to 10 medium boxes", price: "₹1,499" },
  { id: "walk_in_closet", name: "Walk-In Closet", description: "5×5×8.8 ft", price: "₹2,499" },
  { id: "store_room", name: "Store Room", description: "5×10×8.8 ft", price: "₹4,999" },
  { id: "premium", name: "Premium Plan", description: "10×10×8.8 ft", price: "₹12,999" },
  { id: "custom", name: "Custom Plans for Businesses", description: "Contact us for pricing", price: "" },
];

const boxTypes = [
  { id: "medium", name: "Medium Box" },
  { id: "large", name: "Large Box" },
];

const BookPickup = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    serviceType: "",
    numberOfBoxes: "",
    boxType: "",
    storagePlan: "",
    servicePlan: "basic",
    storageDuration: "",
    floorNumber: "",
    insurance: "", // Yes or No
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    const query = new URLSearchParams({
      format: "jsonv2",
      lat: latitude.toString(),
      lon: longitude.toString(),
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    const address = data?.address ?? {};
    const houseNumber = address.house_number as string | undefined;
    const road = (address.road || address.pedestrian || address.residential || address.footway) as string | undefined;
    const neighbourhood = (address.neighbourhood || address.suburb || address.city_district) as string | undefined;
    const city = (address.city || address.town || address.village || address.municipality) as string | undefined;
    const state = address.state as string | undefined;
    const postcode = address.postcode as string | undefined;

    const streetLine = [houseNumber, road].filter(Boolean).join(" ").trim();
    const localityLine = [neighbourhood, city, state, postcode].filter(Boolean).join(", ").trim();
    const formattedAddress = [streetLine, localityLine].filter(Boolean).join(", ").trim();

    return {
      displayName: (data?.display_name as string | undefined) ?? "",
      formattedAddress,
      hasStreetLevel: Boolean(road || houseNumber),
    };
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10;
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Contact number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit number";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.serviceType) {
      newErrors.serviceType = "Please select a service type";
    }

    if (formData.serviceType === "store_boxes") {
      if (!formData.numberOfBoxes) {
        newErrors.numberOfBoxes = "Please select number of boxes";
      }
      if (!formData.boxType) {
        newErrors.boxType = "Please select box type";
      }
    }

    if (formData.serviceType === "storage_plan" && !formData.storagePlan) {
      newErrors.storagePlan = "Please select a storage plan";
    }

    if (!formData.insurance) {
      newErrors.insurance = "Please select insurance option";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your address manually.",
        variant: "destructive",
      });
      return;
    }

    if (!window.isSecureContext) {
      toast({
        title: "Secure connection required",
        description: "Location access works only on HTTPS or localhost. Please open the site in a secure context.",
        variant: "destructive",
      });
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        if (permissionStatus.state === "denied") {
          toast({
            title: "Location Permission Denied",
            description: "Please enable location access for this site in your browser settings and try again.",
            variant: "destructive",
          });
          return;
        }
      } catch {
        // Continue with geolocation request even if permission query is unavailable
      }
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const accuracy = position.coords.accuracy;

        let locationText = `Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        let description = "We couldn't fetch the full address, but coordinates were added.";

        try {
          const resolvedAddress = await getAddressFromCoordinates(latitude, longitude);
          if (resolvedAddress.formattedAddress) {
            if (resolvedAddress.hasStreetLevel) {
              locationText = resolvedAddress.formattedAddress;
              description = "Address detected and filled automatically.";
            } else {
              locationText = resolvedAddress.displayName || resolvedAddress.formattedAddress;
              description = "Only approximate location was detected. Please add house/flat details manually.";
            }
          } else if (resolvedAddress.displayName) {
            locationText = resolvedAddress.displayName;
          }

          if (accuracy > 200) {
            description = "Location appears approximate. Please add house/flat details manually.";
          }
        } catch {
          // Keep coordinate fallback when reverse geocoding fails
        }

        setFormData((prev) => ({
          ...prev,
          location: locationText,
        }));
        setErrors((prev) => ({ ...prev, location: "" }));
        setIsLocating(false);
        toast({
          title: "Location Detected",
          description,
        });
      },
      (error) => {
        setIsLocating(false);

        let title = "Unable to Detect Location";
        let description = "Please enter your address manually.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            title = "Location Permission Denied";
            description = "Please allow location permission in browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            title = "Location Unavailable";
            description = "Your device couldn't determine location. Please check GPS/network and try again.";
            break;
          case error.TIMEOUT:
            title = "Location Request Timed Out";
            description = "It took too long to get location. Please try again.";
            break;
        }

        toast({
          title,
          description,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For store boxes, we use economy plan as default
      const storagePlanValue = formData.serviceType === "store_boxes" || formData.serviceType === "office_documents" ? "economy" : 
        (formData.storagePlan === "custom" ? "premium" : formData.storagePlan);

      // Insert booking into database
      const { error: bookingError } = await supabase.from("bookings").insert({
        customer_name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        email: formData.email.trim() || "not-provided@zipspace.in",
        address: formData.location.trim(),
        storage_plan: storagePlanValue as "economy" | "walk_in_closet" | "store_room" | "premium",
        service_plan: formData.servicePlan as "basic" | "elite",
        pickup_date: new Date().toISOString().split("T")[0],
        pickup_time_slot: "To be scheduled",
        total_amount: 0, // Will be confirmed by team
        is_first_time: true,
        insurance: formData.insurance, // Store insurance value
      });

      if (bookingError) throw bookingError;

      // Send notification email
      const { error: notificationError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          customerName: formData.name,
          email: formData.email || "not-provided@zipspace.in",
          phone: formData.phone,
          address: formData.location,
          serviceType: formData.serviceType,
          storagePlan: formData.storagePlan,
          numberOfBoxes: formData.numberOfBoxes,
          boxType: formData.boxType,
          servicePlan: formData.servicePlan,
          storageDuration: formData.storageDuration,
          floorNumber: formData.floorNumber,
                  insurance: formData.insurance,
        },
      });

      if (notificationError) throw notificationError;

      // Send WhatsApp message
      try {
        // Only send if phone is valid
        if (formData.phone && formData.phone.replace(/\D/g, "").length === 10) {
          await fetch("/functions/v1/send-whatsapp-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: formData.phone.replace(/\D/g, ""),
              message: "Thank you for choosing ZipSpace. One of representatives will connect with you shortly",
            }),
          });
        }
      } catch (waErr) {
        // Optionally log or toast WhatsApp error, but do not block submission
        console.error("WhatsApp message error", waErr);
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="book-pickup" className="section-padding bg-background">
        <div className="container-tight mx-auto">
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-soft border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Thank You!</h2>
              <p className="text-muted-foreground text-lg">
                Our team will call you shortly to confirm your storage request.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    location: "",
                    serviceType: "",
                    numberOfBoxes: "",
                    boxType: "",
                    storagePlan: "",
                    servicePlan: "basic",
                    storageDuration: "",
                    floorNumber: "",
                    insurance: "",
                  });
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book-pickup" className="section-padding bg-background">
      <div className="container-tight mx-auto">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">Book Your Pickup</h2>
            <p className="text-muted-foreground">
              Fill in your details and we'll get back to you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: value });
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                <Input
                  id="location"
                  placeholder="Enter your address"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    setErrors((prev) => ({ ...prev, location: "" }));
                  }}
                  className={errors.location ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className="w-full sm:w-auto"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  {isLocating ? "Detecting..." : "Use Current Location"}
                </Button>
              </div>
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Type of Service */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Type of Service <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.serviceType}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    serviceType: value,
                    numberOfBoxes: "",
                    boxType: "",
                    storagePlan: "",
                  });
                  setErrors((prev) => ({ ...prev, serviceType: "", numberOfBoxes: "", boxType: "", storagePlan: "" }));
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="store_boxes" id="store_boxes" />
                  <Label htmlFor="store_boxes" className="cursor-pointer font-normal">Store Boxes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="storage_plan" id="storage_plan" />
                  <Label htmlFor="storage_plan" className="cursor-pointer font-normal">Storage Plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="office_documents" id="office_documents" />
                  <Label htmlFor="office_documents" className="cursor-pointer font-normal">Office Documents</Label>
                </div>
              </RadioGroup>
              {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType}</p>}
            </div>

            {/* Conditional: Store Boxes Fields */}
            {formData.serviceType === "store_boxes" && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-2">
                  <Label htmlFor="numberOfBoxes">
                    Number of Boxes <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.numberOfBoxes}
                    onValueChange={(value) => {
                      setFormData({ ...formData, numberOfBoxes: value });
                      setErrors((prev) => ({ ...prev, numberOfBoxes: "" }));
                    }}
                  >
                    <SelectTrigger className={errors.numberOfBoxes ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select number of boxes" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "box" : "boxes"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.numberOfBoxes && <p className="text-sm text-destructive">{errors.numberOfBoxes}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boxType">
                    Box Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.boxType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, boxType: value });
                      setErrors((prev) => ({ ...prev, boxType: "" }));
                    }}
                  >
                    <SelectTrigger className={errors.boxType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select box type" />
                    </SelectTrigger>
                    <SelectContent>
                      {boxTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.boxType && <p className="text-sm text-destructive">{errors.boxType}</p>}
                </div>
              </div>
            )}

            {/* Conditional: Storage Plan Selection */}
            {formData.serviceType === "storage_plan" && (
              <div className="space-y-2">
                <Label htmlFor="storagePlan">
                  Select Plan <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.storagePlan}
                  onValueChange={(value) => {
                    setFormData({ ...formData, storagePlan: value });
                    setErrors((prev) => ({ ...prev, storagePlan: "" }));
                  }}
                >
                  <SelectTrigger className={errors.storagePlan ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a storage plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {storagePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {plan.name} {plan.price && `— ${plan.price}`}
                          </span>
                          <span className="text-xs text-muted-foreground">{plan.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              {errors.storagePlan && <p className="text-sm text-destructive">{errors.storagePlan}</p>}
              </div>
            )}

            {/* Service Plan Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Service Plan
              </Label>
              <RadioGroup
                value={formData.servicePlan}
                onValueChange={(value) => {
                  setFormData({ ...formData, servicePlan: value });
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className={`relative flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.servicePlan === "basic" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <RadioGroupItem value="basic" id="plan_basic" className="mt-1" />
                  <Label htmlFor="plan_basic" className="cursor-pointer flex-1">
                    <span className="font-semibold block">Basic Plan</span>
                    <span className="text-sm text-muted-foreground block">Free - Standard pickup & support</span>
                  </Label>
                </div>
                <div className={`relative flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.servicePlan === "elite" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <RadioGroupItem value="elite" id="plan_elite" className="mt-1" />
                  <Label htmlFor="plan_elite" className="cursor-pointer flex-1">
                    <span className="font-semibold block">Elite Plan</span>
                    <span className="text-sm text-muted-foreground block">₹1,799/month - Priority pickup, photo inventory, climate control</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Storage Duration */}
            <div className="space-y-2">
              <Label htmlFor="storageDuration" className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Storage Duration
              </Label>
              <Select
                value={formData.storageDuration}
                onValueChange={(value) => {
                  setFormData({ ...formData, storageDuration: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="2_months">2 Months</SelectItem>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="1_year">1 Year</SelectItem>
                  <SelectItem value="more_than_1_year">More than 1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorNumber" className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Select Floor Number
              </Label>
              <Select
                value={formData.floorNumber}
                onValueChange={(value) => {
                  setFormData({ ...formData, floorNumber: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select floor number" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      {floor}
                    </SelectItem>
                  ))}
                  <SelectItem value="10_plus">10+</SelectItem>
                </SelectContent>
              </Select>
            </div>

              {/* Insurance Field */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Insurance starting from ₹149 <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value="Yes"
                      checked={formData.insurance === "Yes"}
                      onChange={() => {
                        setFormData({ ...formData, insurance: "Yes" });
                        setErrors((prev) => ({ ...prev, insurance: "" }));
                      }}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value="No"
                      checked={formData.insurance === "No"}
                      onChange={() => {
                        setFormData({ ...formData, insurance: "No" });
                        setErrors((prev) => ({ ...prev, insurance: "" }));
                      }}
                    />
                    No
                  </label>
                </div>
                {errors.insurance && <p className="text-sm text-destructive">{errors.insurance}</p>}
              </div>

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookPickup;
