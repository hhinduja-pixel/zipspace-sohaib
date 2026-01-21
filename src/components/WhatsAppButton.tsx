import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "919920714625";
  const message = encodeURIComponent("Hey, I'm interested.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-medium hover:scale-110 transition-transform duration-200 animate-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" fill="white" />
    </a>
  );
};

export default WhatsAppButton;
