"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import type { FormEvent } from "react";
import type { Product } from "@/types/product";

const PAINT_COLORS = [
  "#2050c8",
  "#b94b35",
  "#c47718",
  "#315d4c",
  "#176796",
  "#70496f",
] as const;

const FRAME_PATH =
  "M 88 82 H 532 Q 550 82 550 100 V 660 Q 550 678 532 678 H 88 Q 70 678 70 660 V 100 Q 70 82 88 82 Z";

interface ScrollPaintFrameProps {
  products: Product[];
}

function visitPaintColor(): string {
  const randomValue = new Uint32Array(1);
  window.crypto.getRandomValues(randomValue);

  return PAINT_COLORS[randomValue[0] % PAINT_COLORS.length];
}

export function ScrollPaintFrame({ products }: ScrollPaintFrameProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const brushImageRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorValueRef = useRef<HTMLOutputElement>(null);

  const handleColorInput = (event: FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;

    rootRef.current?.style.setProperty("--paint-color", color);

    if (colorValueRef.current) {
      colorValueRef.current.textContent = color.toUpperCase();
    }
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const root = rootRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    const route = routeRef.current;
    const brush = brushRef.current;
    const brushImage = brushImageRef.current;

    if (!root || !pin || !canvas || !route || !brush || !brushImage) {
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
      const paintPaths = gsap.utils.toArray<SVGPathElement>(".paint-frame__stroke");
      const words = gsap.utils.toArray<HTMLElement>(".paint-frame__word");
      const picker = root.querySelector<HTMLElement>(".paint-frame__picker");
      const marquee = root.querySelector<HTMLElement>(".paint-frame__marquee-track");
      const productSlides = gsap.utils.toArray<HTMLElement>(".paint-frame__product");
      const media = gsap.matchMedia();
      const routeLength = route.getTotalLength();
      const randomValues = new Uint32Array(productSlides.length);

      window.crypto.getRandomValues(randomValues);

      const selectedSlides = productSlides
        .map((slide, index) => ({ slide, order: randomValues[index] }))
        .sort((first, second) => first.order - second.order)
        .slice(0, 4)
        .map(({ slide }) => slide);

      gsap.set(paintPaths, {
        strokeDasharray: routeLength,
        strokeDashoffset: routeLength,
      });

      media.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(brush, { autoAlpha: 0 });
          gsap.set(words, { opacity: 0.12, y: 26 });
          gsap.set(picker, { opacity: 0, y: 18 });
          gsap.set(productSlides, { autoAlpha: 0, y: 42, scale: 0.94 });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              pin,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 2.15, 1600)}`,
              scrub: 1.05,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .set(brush, { autoAlpha: 1 }, 0)
            .to(
              brush,
              {
                motionPath: {
                  path: route,
                  align: route,
                  alignOrigin: [0.075, 0.76],
                  autoRotate: 180,
                },
                duration: 8,
              },
              0,
            )
            .to(
              paintPaths,
              {
                strokeDashoffset: 0,
                duration: 8,
                stagger: 0.025,
              },
              0.04,
            )
            .to(
              words,
              {
                opacity: 1,
                y: 0,
                duration: 1.8,
                stagger: 0.28,
                ease: "power2.out",
              },
              0.65,
            )
            .to(
              picker,
              {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
              },
              2.1,
            )
            .fromTo(
              marquee,
              { xPercent: 4, opacity: 0.24 },
              { xPercent: -8, opacity: 0.75, duration: 7.4 },
              0.2,
            )
            .to(
              brushImage,
              {
                rotationX: -7,
                scale: 0.96,
                duration: 0.5,
                ease: "power2.in",
              },
              7.5,
            )
            .to(brush, { autoAlpha: 0, duration: 0.42 }, 7.82);

          selectedSlides.forEach((slide, index) => {
            const entryTime = 0.55 + index * 1.85;

            timeline
              .to(
                slide,
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.5,
                  ease: "power2.out",
                },
                entryTime,
              )
              .to(
                slide,
                {
                  autoAlpha: 0,
                  y: -34,
                  scale: 1.018,
                  duration: 0.42,
                  ease: "power2.in",
                },
                entryTime + 1.28,
              );
          });

          const tiltX = gsap.quickTo(brushImage, "rotationX", {
            duration: 0.5,
            ease: "power3.out",
          });
          const tiltY = gsap.quickTo(brushImage, "rotationY", {
            duration: 0.5,
            ease: "power3.out",
          });

          const handlePointerMove = (event: PointerEvent) => {
            const bounds = canvas.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            tiltX(y * -8);
            tiltY(x * 10);
            root.style.setProperty("--paint-glint-x", `${(x + 0.5) * 100}%`);
          };

          const resetPointerTilt = () => {
            tiltX(0);
            tiltY(0);
            root.style.setProperty("--paint-glint-x", "50%");
          };

          canvas.addEventListener("pointermove", handlePointerMove);
          canvas.addEventListener("pointerleave", resetPointerTilt);

          return () => {
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerleave", resetPointerTilt);
          };
        },
      );

      media.add(
        "(max-width: 899px), (prefers-reduced-motion: reduce)",
        () => {
          gsap.set(paintPaths, { strokeDashoffset: 0 });
          gsap.set(words, { opacity: 1, y: 0 });
          gsap.set(picker, { opacity: 1, y: 0 });
          gsap.set(marquee, { xPercent: 0, opacity: 0.55 });
          gsap.set(productSlides, { autoAlpha: 0, y: 0, scale: 1 });

          if (selectedSlides[0]) {
            gsap.set(selectedSlides[0], { autoAlpha: 1 });
          }
          gsap.set(brush, {
            autoAlpha: 1,
            motionPath: {
              path: route,
              align: route,
              alignOrigin: [0.075, 0.76],
              autoRotate: 180,
              start: 0.48,
              end: 0.48,
            },
          });
        },
      );

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, [products]);

  return (
    <section
      aria-labelledby="paint-frame-title"
      className="paint-frame"
      ref={rootRef}
    >
      <div className="paint-frame__pin" ref={pinRef}>
        <div className="paint-frame__layout">
          <div className="paint-frame__statement">
            <h2
              aria-label="Colour follows the hand"
              id="paint-frame-title"
            >
              <span aria-hidden="true" className="paint-frame__word">Colour</span>{" "}
              <span aria-hidden="true" className="paint-frame__word">follows</span><br />
              <span aria-hidden="true" className="paint-frame__word">the hand</span>
            </h2>
            <span aria-hidden="true" className="paint-frame__rule" />
            <div className="paint-frame__picker">
              <label htmlFor="paint-frame-color">Explore our palette</label>
              <div className="paint-frame__picker-control">
                <input
                  aria-describedby="paint-frame-color-value"
                  defaultValue={PAINT_COLORS[0]}
                  id="paint-frame-color"
                  onInput={handleColorInput}
                  ref={colorInputRef}
                  type="color"
                />
                <output
                  htmlFor="paint-frame-color"
                  id="paint-frame-color-value"
                  ref={colorValueRef}
                >
                  {PAINT_COLORS[0].toUpperCase()}
                </output>
              </div>
            </div>
          </div>

          <div className="paint-frame__stage">
            <div className="paint-frame__canvas" ref={canvasRef}>
              <span aria-hidden="true" className="paint-frame__ghost-word">
                Kokkonis
              </span>

              <div className="paint-frame__products">
                {products.map((product) => {
                  const metadata = [product.brand?.name, product.category?.name]
                    .filter((value): value is string => Boolean(value))
                    .join(" · ");

                  return (
                    <article className="paint-frame__product" key={product.id}>
                      <Link href={`/products/${product.slug}`}>
                        <div className="paint-frame__product-media">
                          <Image
                            alt={product.image?.alt ?? ""}
                            fill
                            sizes="(max-width: 899px) 70vw, 39vw"
                            src={product.image?.medium ?? "/images/placeholders/paint-tin.png"}
                            unoptimized={process.env.NODE_ENV === "development"}
                          />
                        </div>
                        <div className="paint-frame__product-details">
                          <p>{metadata || "Paint collection"}</p>
                          <h3>{product.name}</h3>
                          <span>{product.availability.label}</span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              <svg
                aria-hidden="true"
                className="paint-frame__art"
                preserveAspectRatio="none"
                viewBox="0 0 620 760"
              >
                <defs>
                  <filter
                    height="130%"
                    id="paint-roughness"
                    width="130%"
                    x="-15%"
                    y="-15%"
                  >
                    <feTurbulence
                      baseFrequency="0.018 0.085"
                      numOctaves="2"
                      result="noise"
                      seed="11"
                      type="fractalNoise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="7"
                      xChannelSelector="R"
                      yChannelSelector="B"
                    />
                  </filter>
                </defs>

                <path
                  className="paint-frame__route"
                  d={FRAME_PATH}
                  ref={routeRef}
                />
                <path
                  className="paint-frame__stroke paint-frame__stroke--dry"
                  d={FRAME_PATH}
                  filter="url(#paint-roughness)"
                />
                <path
                  className="paint-frame__stroke paint-frame__stroke--body"
                  d={FRAME_PATH}
                  filter="url(#paint-roughness)"
                />
                <path
                  className="paint-frame__stroke paint-frame__stroke--wet"
                  d={FRAME_PATH}
                />
                <path
                  className="paint-frame__stroke paint-frame__stroke--bristle paint-frame__stroke--bristle-a"
                  d={FRAME_PATH}
                />
                <path
                  className="paint-frame__stroke paint-frame__stroke--bristle paint-frame__stroke--bristle-b"
                  d={FRAME_PATH}
                />
              </svg>

              <div aria-hidden="true" className="paint-frame__brush" ref={brushRef}>
                <div className="paint-frame__brush-image" ref={brushImageRef}>
                  <Image
                    alt=""
                    fill
                    sizes="(max-width: 899px) 260px, 420px"
                    src="/images/paint-brush-cutout.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="paint-frame__marquee">
          <div className="paint-frame__marquee-track">
            Prepare · Colour · Protect · Finish · Prepare · Colour · Protect · Finish
          </div>
        </div>
      </div>
    </section>
  );
}
