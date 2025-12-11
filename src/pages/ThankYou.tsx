import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking;

  useEffect(() => {
    // Redirect to home if accessed directly without booking data
    if (!bookingData) {
      navigate("/");
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const phoneNumber = "919920714625";
  const message = encodeURIComponent("Hi! I just made a booking and have a question.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-medium p-8 md:p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              Thank you, <span className="text-primary font-semibold">{bookingData.customerName}</span>! 
              Your pickup has been scheduled successfully.
            </p>

            <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-foreground mb-4">Booking Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Date:</span>
                  <span className="font-medium text-foreground">{bookingData.pickupDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Slot:</span>
                  <span className="font-medium text-foreground">{bookingData.pickupTimeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium text-foreground text-right max-w-[60%]">{bookingData.address}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Total Amount:</span>
                    <span className="font-bold text-primary text-lg">₹{bookingData.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-xl p-4 mb-8">
              <p className="text-sm text-foreground">
                📧 A confirmation email has been sent to <strong>{bookingData.email}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
              <Button asChild className="gap-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
