import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import testimonialPriya from "@/assets/testimonial-priya.png";
import testimonialRahul from "@/assets/testimonial-rahul.png";
import testimonialAnjali from "@/assets/testimonial-anjali.png";
import testimonialVikram from "@/assets/testimonial-vikram.png";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Working Professional",
    content: "ZipSpace made relocating so easy! Their pickup was on time, and my belongings were stored safely for 6 months. Highly recommend their Elite service.",
    rating: 5,
    image: testimonialPriya,
  },
  {
    name: "Rahul Mehta",
    role: "Student",
    content: "Perfect for students! I stored my room items during summer break. The Economy plan was affordable and the staff was very helpful.",
    rating: 5,
    image: testimonialRahul,
  },
  {
    name: "Anjali Kapoor",
    role: "Business Owner",
    content: "We use ZipSpace for storing our seasonal inventory. The Premium plan with climate control keeps everything in perfect condition.",
    rating: 5,
    image: testimonialAnjali,
  },
  {
    name: "Vikram Singh",
    role: "Home Owner",
    content: "During our home renovation, ZipSpace stored all our furniture. The 48-hour delivery when we needed items back was impressive!",
    rating: 5,
    image: testimonialVikram,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-tight mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by hundreds of customers across Mumbai for secure storage solutions.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-soft border border-border relative overflow-hidden">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/10" />
            
            <div className="relative z-10">
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>

              <p className="text-lg md:text-xl text-center text-muted-foreground mb-8 italic">
                "{testimonials[currentIndex].content}"
              </p>

              <div className="flex flex-col items-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-primary/20 shadow-md"
                />
                <p className="font-semibold text-secondary text-lg">
                  {testimonials[currentIndex].name}
                </p>
                <p className="text-muted-foreground">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goToPrev}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-secondary" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 bg-primary"
                      : "bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;