"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { PaintStoryFeature } from "@/components/home/PaintStoryFeature";
import { PaintStoryHero } from "@/components/home/PaintStoryHero";
import { PaintStoryProducts } from "@/components/home/PaintStoryProducts";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Product } from "@/types/product";
import type { HeroSlide, StorefrontConfiguration } from "@/types/storefront";

const PAINT_COLORS = ["#2050c8", "#d1482f", "#ff5a0a", "#315d4c", "#176796", "#70496f"] as const;

const FALLBACK_SLIDE: HeroSlide = {
  id: -1,
  key: "catalogue-story",
  eyebrow: "Professional paints and tools",
  title: "Colour in motion",
  description: "Materials chosen for careful preparation, confident colour and a finish that lasts.",
  cta: { label: "Explore the catalogue", url: "/products" },
  image: null,
};

function visitPaintColor(): string {
  const randomValue = new Uint32Array(1);
  window.crypto.getRandomValues(randomValue);

  return PAINT_COLORS[randomValue[0] % PAINT_COLORS.length];
}

export function PaintStory({
  configuration,
  slides,
  products,
}: {
  configuration: StorefrontConfiguration;
  slides: HeroSlide[];
  products: Product[];
}) {
  const storySlides = useMemo(() => slides.length > 0 ? slides : [FALLBACK_SLIDE], [slides]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const brushVisualRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorValueRef = useRef<HTMLOutputElement>(null);

  const featureProducts = products.slice(0, 3);
  const finaleProducts = products.slice(3, 6);

  useEffect(() => {
    if (carouselPaused || storySlides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % storySlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [carouselPaused, storySlides.length]);

  const handleColorInput = (event: FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;
    rootRef.current?.style.setProperty("--paint-color", color);

    if (colorValueRef.current) {
      colorValueRef.current.textContent = color.toUpperCase();
    }
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const stage = stageRef.current;
    const brush = brushRef.current;
    const brushVisual = brushVisualRef.current;

    if (!root || !stage || !brush || !brushVisual) {
      return;
    }

    const initialColor = visitPaintColor();
    root.style.setProperty("--paint-color", initialColor);

    if (colorInputRef.current) {
      colorInputRef.current.value = initialColor;
    }

    if (colorValueRef.current) {
      colorValueRef.current.textContent = initialColor.toUpperCase();
    }

    const context = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>(".paint-story__panel--hero");
      const homeHeader = root.querySelector<HTMLElement>(".paint-story__home-header");
      const feature = root.querySelector<HTMLElement>(".paint-story__panel--feature");
      const finale = root.querySelector<HTMLElement>(".paint-story__panel--products");
      const heroCharacters = gsap.utils.toArray<HTMLElement>(".paint-story__hero-char");
      const heroAction = root.querySelector<HTMLElement>(".paint-story__hero-action");
      const carouselControls = root.querySelector<HTMLElement>(".paint-story__carousel-controls");
      const featureCopy = root.querySelector<HTMLElement>(".paint-story__feature-copy");
      const featureProductsElements = gsap.utils.toArray<HTMLElement>(".paint-story__product-slices--feature .story-product");
      const finaleProductsElements = gsap.utils.toArray<HTMLElement>(".paint-story__product-slices--finale .story-product");
      const finaleAction = root.querySelector<HTMLElement>(".paint-story__finale-action");
      const trailPaths = gsap.utils.toArray<SVGPathElement>(".paint-story__trail-path");
      const media = gsap.matchMedia();

      trailPaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set([feature, finale], { autoAlpha: 0 });
        gsap.set(brush, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: 0, y: 4, scale: 1, rotation: -10 });
        gsap.set(featureCopy, { autoAlpha: 0, x: -70 });
        gsap.set(featureProductsElements, { autoAlpha: 0, y: 44, scale: 0.9 });
        gsap.set(finaleProductsElements, { autoAlpha: 0, y: 48, scale: 0.88 });
        gsap.set(finaleAction, { autoAlpha: 0, y: 30 });

        gsap.timeline({ defaults: { ease: "power3.out" } })
          .fromTo(heroCharacters, { autoAlpha: 0, scale: 0.8, y: 34 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.85, stagger: 0.05 })
          .fromTo(brushVisual, { autoAlpha: 0, scale: 0.7, rotation: -10 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.15 }, 0.28)
          .fromTo(heroAction, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.72)
          .fromTo(carouselControls, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 0.8);

        const storyTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            pin: stage,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 2.9, 2200)}`,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!progressRef.current) return;
              const chapter = self.progress < 0.32 ? 1 : self.progress < 0.68 ? 2 : 3;
              const nextProgress = `${String(chapter).padStart(2, "0")} / 03`;

              if (progressRef.current.textContent !== nextProgress) {
                progressRef.current.textContent = nextProgress;
              }
            },
          },
        });

        storyTimeline
          .to(homeHeader, { autoAlpha: 0, yPercent: -125, duration: 0.92, ease: "power2.inOut" }, 0.12)
          .to(hero, { autoAlpha: 0, scale: 0.965, duration: 1.15 }, 0.45)
          .to(feature, { autoAlpha: 1, duration: 0.85 }, 0.76)
          .to(brush, {
            x: () => Math.min(window.innerWidth * 0.31, 470),
            y: -28,
            scale: 1.68,
            rotation: 34,
            duration: 2.05,
            ease: "power2.inOut",
          }, 0.22)
          .to(trailPaths, { strokeDashoffset: 0, duration: 5.7, stagger: 0.035 }, 0.3)
          .to(featureCopy, { autoAlpha: 1, x: 0, duration: 0.82, ease: "power3.out" }, 1.0)
          .to(featureProductsElements, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.14, ease: "power3.out" }, 1.14)
          .to(feature, { autoAlpha: 0, scale: 0.98, duration: 0.92 }, 3.18)
          .to(finale, { autoAlpha: 1, duration: 0.88 }, 3.38)
          .to(brush, { x: 0, y: 50, scale: 0.56, rotation: 0, duration: 2.1, ease: "power2.inOut" }, 3.12)
          .to(finaleProductsElements, { autoAlpha: 1, y: 0, scale: 1, duration: 0.82, stagger: 0.16, ease: "power3.out" }, 4.05)
          .to(finaleAction, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 4.7);

        return () => storyTimeline.scrollTrigger?.kill();
      });

      media.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
        gsap.set([hero, feature, finale], { autoAlpha: 1, scale: 1 });
        gsap.set([featureCopy, ...featureProductsElements, ...finaleProductsElements, finaleAction], { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        gsap.set(trailPaths, { strokeDashoffset: 0 });
        gsap.set(brush, { autoAlpha: 0 });
      });

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, []);

  const currentSlide = storySlides[activeSlide] ?? storySlides[0];

  return (
    <section className="paint-story" ref={rootRef}>
      <div className="paint-story__stage" ref={stageRef}>
        <div className="paint-story__home-header">
          <SiteHeader configuration={configuration} />
        </div>

        <PaintStoryHero
          onNext={() => setActiveSlide((activeSlide + 1) % storySlides.length)}
          onPauseChange={setCarouselPaused}
          onPrevious={() => setActiveSlide((activeSlide - 1 + storySlides.length) % storySlides.length)}
          slide={currentSlide}
          slideCount={storySlides.length}
        />
        <PaintStoryFeature
          colorInputRef={colorInputRef}
          colorValueRef={colorValueRef}
          onColorInput={handleColorInput}
          products={featureProducts}
        />
        <PaintStoryProducts products={finaleProducts} />

        <svg aria-hidden="true" className="paint-story__trail" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="story-trail-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--paint-color)" stopOpacity="0" />
              <stop offset="0.12" stopColor="var(--paint-color)" stopOpacity="1" />
              <stop offset="0.86" stopColor="var(--paint-color)" stopOpacity="1" />
              <stop offset="1" stopColor="var(--paint-color)" stopOpacity="0" />
            </linearGradient>
            <filter height="140%" id="story-paint-roughness" width="140%" x="-20%" y="-20%">
              <feTurbulence baseFrequency="0.012 0.075" numOctaves="2" result="noise" seed="8" type="fractalNoise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="B" />
            </filter>
          </defs>
          <path className="paint-story__trail-path paint-story__trail-path--dry" d="M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330" filter="url(#story-paint-roughness)" />
          <path className="paint-story__trail-path paint-story__trail-path--body" d="M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330" filter="url(#story-paint-roughness)" />
          <path className="paint-story__trail-path paint-story__trail-path--wet" d="M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330" />
          <path className="paint-story__trail-path paint-story__trail-path--bristle paint-story__trail-path--bristle-a" d="M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330" />
          <path className="paint-story__trail-path paint-story__trail-path--bristle paint-story__trail-path--bristle-b" d="M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330" />
        </svg>

        <div aria-hidden="true" className="paint-story__brush" ref={brushRef}>
          <div className="paint-story__brush-visual" ref={brushVisualRef}>
            <div className="paint-story__brush-float">
              <Image alt="" fill priority sizes="(max-width: 899px) 1px, 42vw" src="/images/paint-brush-cutout.png" />
            </div>
          </div>
        </div>

        <span aria-live="polite" className="paint-story__progress" ref={progressRef}>01 / 03</span>
      </div>
    </section>
  );
}
