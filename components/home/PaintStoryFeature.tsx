import Image from "next/image";
import type { FormEvent, RefObject } from "react";
import { StoryFlowLink } from "@/components/home/StoryFlowLink";
import { StoryProduct } from "@/components/home/StoryProduct";
import type { Product } from "@/types/product";

export function PaintStoryFeature({
  products,
  colorInputRef,
  colorValueRef,
  onColorInput,
}: {
  products: Product[];
  colorInputRef: RefObject<HTMLInputElement | null>;
  colorValueRef: RefObject<HTMLOutputElement | null>;
  onColorInput: (event: FormEvent<HTMLInputElement>) => void;
}) {
  return (
    <section aria-labelledby="paint-story-feature-title" className="paint-story__panel paint-story__panel--feature">
      <div className="paint-story__feature-copy">
        <h2 id="paint-story-feature-title">The right tool changes the finish</h2>
        <StoryFlowLink href="/products?category=paints" label="View paints" />
      </div>

      {products.length > 0 && (
        <div className="paint-story__product-slices paint-story__product-slices--feature">
          {products.map((product, index) => <StoryProduct index={index} key={product.id} product={product} />)}
        </div>
      )}

      <div className="paint-story__picker">
        <label htmlFor="paint-story-color">Choose the trail colour</label>
        <div>
          <input id="paint-story-color" onInput={onColorInput} ref={colorInputRef} type="color" />
          <output htmlFor="paint-story-color" ref={colorValueRef}>#2050C8</output>
        </div>
      </div>

      <div aria-hidden="true" className="paint-story__mobile-brush paint-story__mobile-brush--feature">
        <Image alt="" fill sizes="112vw" src="/images/paint-brush-cutout.png" />
      </div>

      <div aria-hidden="true" className="paint-story__marquee">
        Prepare · Colour · Protect · Finish · Prepare · Colour · Protect · Finish
      </div>
    </section>
  );
}
