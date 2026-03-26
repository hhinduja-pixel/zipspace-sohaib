import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/zipspace-logo.png";

const Footer = () => {
  return <footer className="bg-secondary text-secondary-foreground">
      <div className="container-tight mx-auto section-padding">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logo} alt="ZipSpace" className="h-12 md:h-14 w-auto" />
            <p className="text-secondary-foreground/70 text-sm">
              Premium storage solutions for your belongings. Secure, accessible, and affordable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#subscriptions" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Service Plans
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Storage Pricing
                </a>
              </li>
              <li>
                <a href="#book-pickup" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Book a Pickup
                </a>
              </li>
              <li>
                <a href="#return-items" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Return Items
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+919920714625" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  +91 9920714625
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:support@zipspace.in" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  support@zipspace.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-secondary-foreground/70">
                  Mumbai, Maharashtra, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-10 pt-8 text-center text-sm text-secondary-foreground/50">
          <p>© {new Date().getFullYear()} ZipSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;