
import { Button } from "@/components/ui/button";
import { Anime } from "@/types/anime";

interface HeroSliderProps {
  slides: Anime[];
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
}

const HeroSlider = ({ slides, currentSlide, setCurrentSlide }: HeroSliderProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden mb-10">
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`transition-opacity duration-1000 absolute inset-0 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-[60vh] md:h-[80vh]">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl z-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6">{slide.title}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {slide.genre?.map((genre) => (
                  <span key={genre} className="text-xs px-2 py-1 bg-red-500 bg-opacity-70 rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-3 md:line-clamp-4">
                {slide.description}
              </p>
              <div className="flex space-x-4 mb-6">
                <div className="flex items-center text-sm">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{slide.rating}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 mr-1">Серий:</span>
                  <span>{slide.episodes}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 mr-1">Год:</span>
                  <span>{slide.year}</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button className="bg-red-500 hover:bg-red-600 transition-colors">
                  Смотреть
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-colors">
                  В избранное
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center z-20">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? "bg-red-500" : "bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
