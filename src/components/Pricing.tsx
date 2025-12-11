import { Check, Package, Home, Building, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const storagePlans = [
  {
    icon: Package,
    name: "Economy",
    price: "₹1,499",
    period: "/month",
    size: "Up to 50 kg",
    description: "Perfect for seasonal items and small boxes",
    features: ["Up to 5 boxes", "Climate protection", "Photo inventory"],
  },
  {
    icon: Home,
    name: "Walk-In Closet",
    price: "₹2,499",
    period: "/month",
    size: "Up to 100 kg",
    description: "Ideal for wardrobes and medium furniture",
    features: ["Up to 15 boxes", "Climate controlled", "Priority support"],
    popular: true,
  },
  {
    icon: Building,
    name: "Store Room",
    price: "₹4,999",
    period: "/month",
    size: "Up to 250 kg",
    description: "Great for households and office storage",
    features: ["Up to 30 boxes", "Full insurance", "Free returns"],
  },
  {
    icon: Crown,
    name: "Premium",
    price: "₹12,999",
    period: "/month",
    size: "Up to 500 kg",
    description: "Complete storage solution for everything",
    features: ["Unlimited boxes", "White-glove service", "Dedicated manager"],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding bg-muted/30">
      <div className="container-tight mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Storage Plans That Fit Your Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flexible pricing for every requirement. All plans include free first pickup.
          </p>
          {/* Box Pricing */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2 shadow-soft">
              <span className="font-semibold text-secondary">Medium Box</span>
              <span className="text-primary font-bold">₹299/box</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2 shadow-soft">
              <span className="font-semibold text-secondary">Large Box</span>
              <span className="text-primary font-bold">₹349/box</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storagePlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl p-6 transition-all duration-300 hover:shadow-medium hover:-translate-y-1 ${
                  plan.popular
                    ? "border-2 border-primary shadow-glow"
                    : "border border-border shadow-soft"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}

                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-secondary mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.size}</p>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-secondary">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  size="default"
                  className="w-full"
                  asChild
                >
                  <a href="#book-pickup">Select Plan</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
