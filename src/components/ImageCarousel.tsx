import { useEffect, useState } from "react";
import carouselPickup from "@/assets/carousel-pickup.png";
import carouselStorage from "@/assets/carousel-storage.png";
import carouselReturn from "@/assets/carousel-return.png";

const images = [
  { src: carouselPickup, alt: "Doorstep Pick Up, Made Easy" },
  { src: carouselStorage, alt: "Your Storage. Safe and Monitored." },
  { src: carouselReturn, alt: "Need It Back? Just Tap." },
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20 pb-4 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl shadow-lg max-w-5xl mx-auto">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover max-h-[450px]"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-primary scale-110" : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;
