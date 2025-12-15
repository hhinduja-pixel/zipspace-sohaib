import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Mail, ArrowRight, MapPin, Loader2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface StoredItem {
  id: string;
  item_name: string;
  description: string | null;
  quantity: number;
  booking_id: string;
}
interface Booking {
  id: string;
  customer_name: string;
  address: string;
  pickup_date: string;
  status: string;
}
const ReturnItems = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storedItems, setStoredItems] = useState<StoredItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnAddress, setReturnAddress] = useState("");
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.functions.invoke("send-otp", {
        body: {
          email
        }
      });
      if (error) throw error;
      setIsOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code."
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("verify-otp", {
        body: {
          email,
          code: otp
        }
      });
      if (error || !data?.success) {
        throw new Error(data?.error || "Invalid OTP");
      }

      // Fetch user's bookings and stored items
      const {
        data: bookingsData,
        error: bookingsError
      } = await supabase.from("bookings").select("*").eq("email", email).in("status", ["stored", "picked_up"]);
      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
      if (bookingsData && bookingsData.length > 0) {
        const bookingIds = bookingsData.map(b => b.id);
        const {
          data: itemsData
        } = await supabase.from("stored_items").select("*").in("booking_id", bookingIds);
        setStoredItems(itemsData || []);
        setReturnAddress(bookingsData[0].address);
      }
      setIsVerified(true);
      toast({
        title: "Email Verified",
        description: "You can now view and request returns for your stored items."
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  const handleReturnRequest = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to return.",
        variant: "destructive"
      });
      return;
    }
    if (!returnAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter a return address.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Group items by booking
      const itemsByBooking = selectedItems.reduce((acc, itemId) => {
        const item = storedItems.find(i => i.id === itemId);
        if (item) {
          if (!acc[item.booking_id]) acc[item.booking_id] = [];
          acc[item.booking_id].push(itemId);
        }
        return acc;
      }, {} as Record<string, string[]>);

      // Create return requests for each booking
      for (const [bookingId, itemIds] of Object.entries(itemsByBooking)) {
        const {
          data: returnRequest,
          error: requestError
        } = await supabase.from("return_requests").insert({
          booking_id: bookingId,
          return_address: returnAddress
        }).select().single();
        if (requestError) throw requestError;

        // Add return items
        const returnItems = itemIds.map(itemId => ({
          return_request_id: returnRequest.id,
          stored_item_id: itemId
        }));
        const {
          error: itemsError
        } = await supabase.from("return_items").insert(returnItems);
        if (itemsError) throw itemsError;
      }
      toast({
        title: "Return Request Submitted!",
        description: "We'll deliver your items within 48 hours. Check your email for updates."
      });

      // Reset state
      setSelectedItems([]);
      setStoredItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    } catch (error: any) {
      console.error("Error creating return request:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <section id="return-items" className="section-padding bg-muted/30">
      <div className="container-tight mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">Return My Items</h2>
          <p className="text-muted-foreground text-lg mb-10">Need your items back? Verify your email and select items for delivery. Items are typically delivered within 24 hours.</p>

          {!isVerified ? <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
              <form onSubmit={(e) => {
                e.preventDefault();
                navigate("/return-thank-you");
              }}>
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="return-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="return-email" type="email" placeholder="Enter your registered email" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label htmlFor="return-mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="return-mobile" type="tel" placeholder="Enter your mobile number" className="pl-10" value={mobileNumber} onChange={e => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={!email || mobileNumber.length !== 10}>
                    Submit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div> : <div className="bg-card rounded-2xl p-8 shadow-soft border border-border text-left">
              <h3 className="text-xl font-bold text-secondary mb-4">Your Stored Items</h3>

              {storedItems.length === 0 ? <div>
                  <p className="text-muted-foreground mb-6">
                    No items found. Once you store items with us, they'll appear here for easy return requests.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="#book-pickup">Book Your First Pickup</a>
                  </Button>
                </div> : <div className="space-y-6">
                  <div className="space-y-3">
                    {storedItems.map(item => <div key={item.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${selectedItems.includes(item.id) ? "border-primary bg-accent/50" : "border-border"}`}>
                        <Checkbox id={item.id} checked={selectedItems.includes(item.id)} onCheckedChange={() => handleItemToggle(item.id)} />
                        <label htmlFor={item.id} className="flex-1 cursor-pointer">
                          <p className="font-medium text-secondary">{item.item_name}</p>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </label>
                      </div>)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="return-address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Return Address
                    </Label>
                    <Input id="return-address" placeholder="Enter delivery address" value={returnAddress} onChange={e => setReturnAddress(e.target.value)} />
                  </div>

                  <Button onClick={handleReturnRequest} className="w-full" disabled={selectedItems.length === 0 || isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Request Return ({selectedItems.length} items)
                  </Button>
                </div>}
            </div>}
        </div>
      </div>
    </section>;
};
export default ReturnItems;