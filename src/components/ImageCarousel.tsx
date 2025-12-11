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
    <section className="py-12 bg-muted/30 overflow-hidden">
      <div className="container-tight mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
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
