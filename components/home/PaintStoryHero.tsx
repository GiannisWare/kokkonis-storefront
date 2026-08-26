import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { StoryFlowLink } from "@/components/home/StoryFlowLink";
import type { HeroSlide } from "@/types/storefront";

function AnimatedTitle({ title }: { title: string }) {
  return (
    <h1 aria-label={title} className="paint-story__hero-title" id="paint-story-title">
      {title.split(/\s+/).map((word, wordIndex) => (
        <span aria-hidden="true" className="paint-story__hero-word" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((character, characterIndex) => (
            <i className="paint-story__hero-char" key={`${character}-${characterIndex}`}>
              {character}
            </i>
          ))}
        </span>
      ))}
    </h1>
  );
}

export function PaintStoryHero({
  slide,
  slideCount,
  onNext,
  onPrevious,
  onPauseChange,
}: {
  slide: HeroSlide;
  slideCount: number;
  onNext: () => void;
  onPrevious: () => void;
  onPauseChange: (paused: boolean) => void;
}) {
  return (
    <section
      aria-labelledby="paint-story-title"
      className="paint-story__panel paint-story__panel--hero"
      onBlurCapture={() => onPauseChange(false)}
      onFocusCapture={() => onPauseChange(true)}
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => onPauseChange(false)}
    >
      {slide.image && (
        <Image
          alt=""
          className="paint-story__campaign-image"
          fill
          key={slide.image.url}
          priority
          sizes="100vw"
          src={slide.image.url}
          style={{ objectPosition: slide.image.focal_position }}
          unoptimized={process.env.NODE_ENV === "development"}
        />
      )}
      <div className="paint-story__spotlight" />

      {slide.eyebrow && <p className="paint-story__hero-eyebrow">{slide.eyebrow}</p>}

      <div className="paint-story__hero-copy">
        <AnimatedTitle title={slide.title} />
      </div>

      {slide.description && <p className="paint-story__hero-description">{slide.description}</p>}

      <div className="paint-story__hero-action">
        <StoryFlowLink
          href={slide.cta.url ?? "/products"}
          label={slide.cta.label ?? "Explore the catalogue"}
        />
      </div>

      {slideCount > 1 && (
        <div className="paint-story__carousel-controls">
          <button aria-label="Previous campaign" onClick={onPrevious} type="button">
            <ArrowLeft aria-hidden="true" size={22} />
          </button>
          <button aria-label="Next campaign" onClick={onNext} type="button">
            <ArrowRight aria-hidden="true" size={22} />
          </button>
        </div>
      )}

      <div aria-hidden="true" className="paint-story__mobile-brush paint-story__mobile-brush--hero">
        <Image alt="" fill priority sizes="84vw" src="/images/paint-brush-cutout.png" />
      </div>
    </section>
  );
}
