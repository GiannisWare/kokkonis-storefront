import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function StoryFlowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="story-flow-link" href={href}>
      <ArrowRight aria-hidden="true" className="story-flow-link__arrow story-flow-link__arrow--enter" size={18} />
      <span>{label}</span>
      <i aria-hidden="true" />
      <ArrowRight aria-hidden="true" className="story-flow-link__arrow story-flow-link__arrow--exit" size={18} />
    </Link>
  );
}
