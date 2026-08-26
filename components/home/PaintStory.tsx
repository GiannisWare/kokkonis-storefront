"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { PaintStoryFeature } from "@/components/home/PaintStoryFeature";
import { PaintStoryHero } from "@/components/home/PaintStoryHero";
import { PaintStoryProducts } from "@/components/home/PaintStoryProducts";
import { PaintTrailCanvas } from "@/components/home/PaintTrailCanvas";
import type { PaintTrailController } from "@/components/home/PaintTrailCanvas";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Product } from "@/types/product";
import type { HeroSlide, StorefrontConfiguration } from "@/types/storefront";

const PAINT_COLORS = ["#2050c8", "#d1482f", "#ff5a0a", "#315d4c", "#176796", "#70496f"] as const;
const PAINT_TRAIL_PATH = "M 70 540 C 68 210 250 62 550 62 H 1070 C 1290 62 1378 190 1378 430 V 690 C 1378 800 1250 838 1060 838 H 330";
const JOURNEY_SEGMENTS = {
  approachEnd: 0.28,
  approachStart: 0.12,
  exitStart: 0.82,
} as const;
const PATH_ANGLE_SAMPLES = 180;

type Point = {
  x: number;
  y: number;
};

type JourneyGeometry = {
  approachControlOne: Point;
  approachControlTwo: Point;
  end: Point;
  exitControlOne: Point;
  exitControlTwo: Point;
  exitEnd: Point;
  hero: Point;
  pathAngles: number[];
  start: Point;
};

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function smoothProgress(value: number): number {
  const progress = clampProgress(value);

  return progress * progress * (3 - 2 * progress);
}

function segmentProgress(value: number, start: number, end: number): number {
  return clampProgress((value - start) / (end - start));
}

function cubicPoint(start: Point, controlOne: Point, controlTwo: Point, end: Point, progress: number): Point {
  const inverse = 1 - progress;

  return {
    x: inverse ** 3 * start.x
      + 3 * inverse ** 2 * progress * controlOne.x
      + 3 * inverse * progress ** 2 * controlTwo.x
      + progress ** 3 * end.x,
    y: inverse ** 3 * start.y
      + 3 * inverse ** 2 * progress * controlOne.y
      + 3 * inverse * progress ** 2 * controlTwo.y
      + progress ** 3 * end.y,
  };
}

function nearestEquivalentAngle(reference: number, angle: number): number {
  const delta = ((angle - reference + 540) % 360) - 180;

  return reference + delta;
}

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
  const trailControllerRef = useRef<PaintTrailController>(null);
  const trailGuideRef = useRef<SVGPathElement>(null);
  const trailProgressRef = useRef(0);
  const trailActiveRef = useRef(false);
  const paintColorRef = useRef<string>(PAINT_COLORS[0]);

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
    paintColorRef.current = color;
    rootRef.current?.style.setProperty("--paint-color", color);
    if (trailActiveRef.current) {
      trailControllerRef.current?.render(trailProgressRef.current, color);
    }

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
    paintColorRef.current = initialColor;
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
      const media = gsap.matchMedia();

      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const journey = { progress: 0 };
        let geometry: JourneyGeometry | null = null;
        let trailWasActive = false;

        const heroBrushPosition = (): Point => ({
          x: stage.clientWidth * 0.5 - brushVisual.offsetWidth * 0.42,
          y: stage.clientHeight * 0.52 + brushVisual.offsetHeight * 0.15,
        });

        const pathRotation = (progress: number): number => {
          if (!geometry || geometry.pathAngles.length === 0) {
            return -10;
          }

          const position = clampProgress(progress) * (geometry.pathAngles.length - 1);
          const index = Math.floor(position);
          const nextIndex = Math.min(geometry.pathAngles.length - 1, index + 1);

          return interpolate(geometry.pathAngles[index], geometry.pathAngles[nextIndex], position - index);
        };

        const rebuildGeometry = () => {
          const controller = trailControllerRef.current;

          controller?.resize();

          const startSample = controller?.sample(0);
          const endSample = controller?.sample(1);

          if (!startSample || !endSample) {
            geometry = null;
            return;
          }

          const heroPosition = heroBrushPosition();
          const pathAngles: number[] = [];
          let previousAngle = -10;

          for (let index = 0; index <= PATH_ANGLE_SAMPLES; index += 1) {
            const sample = controller?.sample(index / PATH_ANGLE_SAMPLES);
            const rawAngle = (sample?.angle ?? previousAngle + 180) - 180;
            previousAngle = nearestEquivalentAngle(previousAngle, rawAngle);
            pathAngles.push(previousAngle);
          }

          geometry = {
            approachControlOne: {
              x: heroPosition.x - stage.clientWidth * 0.16,
              y: heroPosition.y - stage.clientHeight * 0.03,
            },
            approachControlTwo: {
              x: startSample.x + stage.clientWidth * 0.1,
              y: startSample.y - stage.clientHeight * 0.12,
            },
            end: { x: endSample.x, y: endSample.y },
            exitControlOne: {
              x: endSample.x - stage.clientWidth * 0.1,
              y: endSample.y + stage.clientHeight * 0.025,
            },
            exitControlTwo: {
              x: -stage.clientWidth * 0.08,
              y: stage.clientHeight * 0.86,
            },
            exitEnd: {
              x: -brushVisual.offsetWidth * 1.18,
              y: stage.clientHeight * 0.7,
            },
            hero: heroPosition,
            pathAngles,
            start: { x: startSample.x, y: startSample.y },
          };
        };

        const renderJourney = (progress: number) => {
          if (!geometry) {
            rebuildGeometry();
          }

          if (!geometry) {
            return;
          }

          const normalizedProgress = clampProgress(progress);
          let opacity = 1;
          let position = geometry.hero;
          let rotation = -10;
          let scale = 1;

          if (normalizedProgress < JOURNEY_SEGMENTS.approachStart) {
            const settleProgress = segmentProgress(normalizedProgress, 0, JOURNEY_SEGMENTS.approachStart);
            const breath = Math.sin(settleProgress * Math.PI);

            position = geometry.hero;
            rotation = -10 + breath * 1.6;
            scale = 1 + breath * 0.012;
            trailProgressRef.current = 0;
            trailActiveRef.current = false;

            if (trailWasActive) {
              trailControllerRef.current?.clear();
              trailWasActive = false;
            }
          } else if (normalizedProgress < JOURNEY_SEGMENTS.approachEnd) {
            const approachProgress = smoothProgress(segmentProgress(
              normalizedProgress,
              JOURNEY_SEGMENTS.approachStart,
              JOURNEY_SEGMENTS.approachEnd,
            ));

            position = cubicPoint(
              geometry.hero,
              geometry.approachControlOne,
              geometry.approachControlTwo,
              geometry.start,
              approachProgress,
            );
            rotation = interpolate(-10, pathRotation(0), approachProgress);
            scale = interpolate(1, 1.34, approachProgress);
            trailProgressRef.current = 0;
            trailActiveRef.current = false;

            if (trailWasActive) {
              trailControllerRef.current?.clear();
              trailWasActive = false;
            }
          } else if (normalizedProgress < JOURNEY_SEGMENTS.exitStart) {
            const perimeterProgress = segmentProgress(
              normalizedProgress,
              JOURNEY_SEGMENTS.approachEnd,
              JOURNEY_SEGMENTS.exitStart,
            );
            const sample = trailControllerRef.current?.render(perimeterProgress, paintColorRef.current);

            if (sample) {
              position = { x: sample.x, y: sample.y };
            }

            rotation = pathRotation(perimeterProgress);
            scale = interpolate(1.34, 0.92, smoothProgress(perimeterProgress));
            trailProgressRef.current = perimeterProgress;
            trailActiveRef.current = true;
            trailWasActive = true;
          } else {
            const exitProgress = smoothProgress(segmentProgress(
              normalizedProgress,
              JOURNEY_SEGMENTS.exitStart,
              1,
            ));

            trailControllerRef.current?.render(1, paintColorRef.current);
            position = cubicPoint(
              geometry.end,
              geometry.exitControlOne,
              geometry.exitControlTwo,
              geometry.exitEnd,
              exitProgress,
            );
            rotation = pathRotation(1) + exitProgress * 720;
            scale = interpolate(0.92, 0.48, exitProgress);
            opacity = 1 - smoothProgress(segmentProgress(exitProgress, 0.62, 1));
            trailProgressRef.current = 1;
            trailActiveRef.current = true;
            trailWasActive = true;
          }

          gsap.set(brush, {
            autoAlpha: opacity,
            rotation,
            scale,
            x: position.x,
            y: position.y,
          });
        };

        trailControllerRef.current?.resize();
        trailControllerRef.current?.clear();
        trailProgressRef.current = 0;
        trailActiveRef.current = false;
        rebuildGeometry();
        renderJourney(0);
        gsap.set([feature, finale], { autoAlpha: 0 });
        gsap.set(featureCopy, { autoAlpha: 0, x: -70 });

        if (featureProductsElements.length > 0) {
          gsap.set(featureProductsElements, { autoAlpha: 0, y: 44, scale: 0.9 });
        }

        if (finaleProductsElements.length > 0) {
          gsap.set(finaleProductsElements, { autoAlpha: 0, y: 48, scale: 0.88 });
        }

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
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              rebuildGeometry();
              renderJourney(journey.progress);
            },
            onUpdate: (self) => {
              if (!progressRef.current) return;
              const chapter = self.progress < 0.3 ? 1 : self.progress < 0.68 ? 2 : 3;
              const nextProgress = `${String(chapter).padStart(2, "0")} / 03`;

              if (progressRef.current.textContent !== nextProgress) {
                progressRef.current.textContent = nextProgress;
              }
            },
          },
        });

        storyTimeline.to(journey, { progress: 1, duration: 1, onUpdate: () => renderJourney(journey.progress) }, 0);
        storyTimeline.to(homeHeader, { autoAlpha: 0, yPercent: -125, duration: 0.16, ease: "power2.inOut" }, 0.03);
        storyTimeline.to(hero, { autoAlpha: 0, scale: 0.97, duration: 0.17, ease: "power2.inOut" }, 0.13);
        storyTimeline.to(feature, { autoAlpha: 1, duration: 0.16, ease: "power2.inOut" }, 0.18);
        storyTimeline.to(featureCopy, { autoAlpha: 1, x: 0, duration: 0.14, ease: "power3.out" }, 0.27);

        if (featureProductsElements.length > 0) {
          storyTimeline.to(featureProductsElements, { autoAlpha: 1, y: 0, scale: 1, duration: 0.14, stagger: 0.025, ease: "power3.out" }, 0.34);
        }

        storyTimeline.to(feature, { autoAlpha: 0, scale: 0.985, duration: 0.14, ease: "power2.inOut" }, 0.58);
        storyTimeline.to(finale, { autoAlpha: 1, duration: 0.15, ease: "power2.inOut" }, 0.63);

        if (finaleProductsElements.length > 0) {
          storyTimeline.to(finaleProductsElements, { autoAlpha: 1, y: 0, scale: 1, duration: 0.13, stagger: 0.024, ease: "power3.out" }, 0.69);
        }

        storyTimeline.to(finaleAction, { autoAlpha: 1, y: 0, duration: 0.12, ease: "power3.out" }, 0.76);

        return () => {
          storyTimeline.scrollTrigger?.kill();
          trailControllerRef.current?.clear();
          trailProgressRef.current = 0;
          trailActiveRef.current = false;
        };
      });

      media.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
        gsap.set([hero, feature, finale], { autoAlpha: 1, scale: 1 });
        gsap.set([featureCopy, ...featureProductsElements, ...finaleProductsElements, finaleAction], { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        gsap.set(brush, { autoAlpha: 0 });
        trailControllerRef.current?.clear();
        trailProgressRef.current = 0;
        trailActiveRef.current = false;
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

        <svg aria-hidden="true" className="paint-story__trail-guide" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <path d={PAINT_TRAIL_PATH} ref={trailGuideRef} />
        </svg>
        <PaintTrailCanvas guideRef={trailGuideRef} ref={trailControllerRef} stageRef={stageRef} />

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
