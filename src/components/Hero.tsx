import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Clock } from "lucide-react";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden" style={{
    background: "var(--gradient-hero)"
  }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container-tight mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/50 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-secondary">15% off for first-time customers</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-delay-1">
            More Space,{" "}
            <span className="gradient-text">Less Stress.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-delay-2">
            Premium storage solutions with free pickup. Secure, climate-controlled spaces for your belongings. Pay only for what you need.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-delay-3">
            <Button variant="hero" size="lg" asChild>
              <a href="#book-pickup" className="gap-2">
                Book a Pickup
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-delay-3">
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-xl shadow-soft">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-secondary">Free Pickup</p>
                <p className="text-sm text-muted-foreground">First pickup free</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-xl shadow-soft">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-secondary">100% Secure</p>
                <p className="text-sm text-muted-foreground">24/7 surveillance</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-xl shadow-soft">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-secondary">24 hr Delivery</p>
                <p className="text-sm text-muted-foreground">Items returned fast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;