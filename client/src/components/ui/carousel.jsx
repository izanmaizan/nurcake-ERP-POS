// carousel.jsx
import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "../../lib/tailwind-utils";
import { Button } from "../../components/ui/button";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"]; // Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const CarouselContext = React.createContext(null);

function useCarousel() {
    const context = React.useContext(CarouselContext);

    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }

    return context;
}

const Carousel = React.forwardRef(
    (
        {
            orientation = "horizontal",
            opts,
            setApi,
            plugins,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const [carouselRef, api] = useEmblaCarousel(
            {
                ...opts,
                axis: orientation === "horizontal" ? "x" : "y",
            },
            plugins
        );
        const [canScrollPrev, setCanScrollPrev] = React.useState(false);
        const [canScrollNext, setCanScrollNext] = React.useState(false);

        const onSelect = React.useCallback((api) => {
            if (!api) {
                return;
            }

            setCanScrollPrev(api.canScrollPrev());
            setCanScrollNext(api.canScrollNext());
        }, []);

        const scrollPrev = React.useCallback(() => {
            api?.scrollPrev();
        }, [api]);

        const scrollNext = React.useCallback(() => {
            api?.scrollNext();
        }, [api]);

        const handleKeyDown = React.useCallback(
            (event) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    scrollPrev();
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    scrollNext();
                }
            },
            [scrollPrev, scrollNext]
        );

        React.useEffect(() => {
            if (!api || !setApi) {
                return;
            }

            setApi(api);
        }, [api, setApi]);

        React.useEffect(() => {
            if (!api) {
                return;
            }

            onSelect(api);
            api.on("reInit", onSelect);
            api.on("select", onSelect);

            return () => {
                api?.off("select", onSelect);
            };
        }, [api, onSelect]);

        return (
            <CarouselContext.Provider
                value={{
                    carouselRef,
                    api: api,
                    opts,
                    orientation:
                        orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
                    scrollPrev,
                    scrollNext,
                    canScrollPrev,
                    canScrollNext,
                }}>
                <div
                    ref={ref}
                    onKeyDownCapture={handleKeyDown}
                    className={cn("relative", className)}
                    role="region"
                    aria-roledescription="carousel"
                    {...props}
                    style={{ backgroundColor: bgColor }}>
                    {children}
                </div>
            </CarouselContext.Provider>
        );
    }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
        <div ref={carouselRef} className="overflow-hidden">
            <div
                ref={ref}
                className={cn(
                    "flex",
                    orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
                    className
                )}
                {...props}
            />
        </div>
    );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            className={cn(
                "min-w-0 shrink-0 grow-0 basis-full",
                orientation === "horizontal" ? "pl-4" : "pt-4",
                className
            )}
            {...props}
            style={{ color: textColor }}
        />
    );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(
    ({ className, variant = "outline", size = "icon", ...props }, ref) => {
        const { orientation, scrollPrev, canScrollPrev } = useCarousel();

        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn(
                    "absolute h-8 w-8 rounded-full border-[#D4AF37] bg-[#FFF8E7] text-[#8B7D3F]",
                    orientation === "horizontal"
                        ? "md:-left-12 md:top-1/2 md:-translate-y-1/2 top-full -translate-y-full left-0"
                        : "md:-top-12 md:left-1/2 md:-translate-x-1/2 md:rotate-90 -top-8 left-0",
                    className
                )}
                disabled={!canScrollPrev}
                onClick={scrollPrev}
                {...props}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
            </Button>
        );
    }
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(
    ({ className, variant = "outline", size = "icon", ...props }, ref) => {
        const { orientation, scrollNext, canScrollNext } = useCarousel();

        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn(
                    "absolute h-8 w-8 rounded-full border-[#D4AF37] bg-[#FFF8E7] text-[#8B7D3F]",
                    orientation === "horizontal"
                        ? "md:-right-12 md:top-1/2 md:-translate-y-1/2 top-full -translate-y-full right-0"
                        : "md:-bottom-12 md:left-1/2 md:-translate-x-1/2 md:rotate-90 -bottom-8 right-0",
                    className
                )}
                disabled={!canScrollNext}
                onClick={scrollNext}
                {...props}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
            </Button>
        );
    }
);
CarouselNext.displayName = "CarouselNext";

export {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
};