import { useEffect, useRef } from "react";
import carouselPickup from "@/assets/carousel-pickup.png";
import carouselStorage from "@/assets/carousel-storage.png";
import carouselReturn from "@/assets/carousel-return.png";

const images = [
  { src: carouselPickup, alt: "Doorstep Pick Up, Made Easy" },
  { src: carouselStorage, alt: "Your Storage. Safe and Monitored." },
  { src: carouselReturn, alt: "Need It Back? Just Tap." },
];

const ImageCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= scrollContainer.scrollWidth / 2) {
        scrollPos = 0;
      }
      scrollContainer.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="py-12 bg-muted/30 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden"
        style={{ scrollBehavior: "auto" }}
      >
        {/* Duplicate images for seamless loop */}
        {[...images, ...images].map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[400px] md:w-[600px] lg:w-[700px] rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageCarousel;
