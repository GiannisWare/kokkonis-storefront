"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/types/storefront";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="campaign-fallback" aria-labelledby="hero-title">
        <p>Professional catalogue</p><h1 id="hero-title">Tools for work that lasts</h1>
        <Link href="/products">Browse all products <ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    );
  }

  return (
    <section className="hero-carousel" aria-label="Featured campaigns" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div className="hero-carousel__track">
        {slides.map((slide, index) => (
          <article className="hero-slide" aria-hidden={index !== active} key={slide.id} style={{ opacity: index === active ? 1 : 0, pointerEvents: index === active ? "auto" : "none" }}>
            {slide.image && <Image src={slide.image.url} alt={slide.image.alt} fill priority={index === 0} sizes="100vw" style={{ objectPosition: slide.image.focal_position }} unoptimized={process.env.NODE_ENV === "development"} />}
            <div className="hero-slide__veil" />
            <div className="hero-slide__copy">
              {slide.eyebrow && <p>{slide.eyebrow}</p>}
              <h1>{slide.title}</h1>
              {slide.description && <span>{slide.description}</span>}
              {slide.cta.label && slide.cta.url && <Link href={slide.cta.url}>{slide.cta.label}<ArrowRight aria-hidden="true" size={18} /></Link>}
            </div>
          </article>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="hero-carousel__controls">
          <button aria-label="Previous campaign" onClick={() => setActive((active - 1 + slides.length) % slides.length)}><ArrowLeft aria-hidden="true" size={19} /></button>
          <div className="hero-carousel__dots" aria-label={`Campaign ${active + 1} of ${slides.length}`}>
            {slides.map((slide, index) => <button className={index === active ? "is-active" : ""} aria-label={`Show campaign ${index + 1}`} onClick={() => setActive(index)} key={slide.id} />)}
          </div>
          <button aria-label="Next campaign" onClick={() => setActive((active + 1) % slides.length)}><ArrowRight aria-hidden="true" size={19} /></button>
        </div>
      )}
    </section>
  );
}
