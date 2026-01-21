import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/zipspace-icon.png";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [{
    href: "#subscriptions",
    label: "Plans"
  }, {
    href: "#pricing",
    label: "Pricing"
  }, {
    href: "#book-pickup",
    label: "Book Pickup"
  }, {
    href: "#return-items",
    label: "Return Items"
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-tight mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ZipSpace Logo" className="h-12 md:h-14 w-auto" />
            <span className="text-xl md:text-2xl font-bold text-secondary">ZipSpace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <a key={link.href} href={link.href} className="text-muted-foreground hover:text-secondary transition-colors duration-200 font-medium">
                {link.label}
              </a>)}
          </div>

          <div className="hidden md:block">
            <Button variant="default" size="default" asChild>
              <a href="#book-pickup">Book a Pickup</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-secondary" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-medium animate-fade-in">
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map(link => <a key={link.href} href={link.href} className="text-muted-foreground hover:text-secondary transition-colors duration-200 font-medium py-2" onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>)}
              <Button variant="default" size="default" asChild>
                <a href="#book-pickup" onClick={() => setIsOpen(false)}>
                  Book a Pickup
                </a>
              </Button>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;