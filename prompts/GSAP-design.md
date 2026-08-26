You're an expert frontend senior engineer and ui creative developer.
Create an outer frame 24px thick with my colors, border 24px radius on all corners.
Main container: Centered, max width 1440px, full viewport height
Padding: 48px horizontal padding inside the black container
Section spacing all elements vertically centered within the hero
All sections/components shall be different react Components

Remove the top header, just have a transparent background menu navigation bar with:
Left brand logo, center navigation links, spaced evenly uppercase, 18px , indicate active based on that rectangular nicely. Right end- user icon and shopping bag icon, 24px spaced 32px apart.

Hero section:
layout flexbox vertical and horizontal centering

Shows the carousel we already have implemented with main headingg extra large , extra-bold, uppercase, centered with a brush image overlapping the center.
Brush image: Hyper realistic 3D, brush, with white spotlight centered. Use that brush we already used for that section with GSAP.
Action button style:
// This is file of your component

// You can use any dependencies from npm; we import them automatically in package.json
'use client';
import { ArrowRight } from 'lucide-react';

export  function FlowButton({ text = "Modern Button" }: { text?: string }) {
return (
<button className="group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95]">
{/* Left arrow (arr-2) */}
<ArrowRight
className="absolute w-4 h-4 left-[-25%] stroke-[#111111] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
/>

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-[#111111] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
);
}


CENTERED at the bottom.
Pagination bottom right , vertical 01/06 in nice antithesis color of the bg, rotated 90 deg, with 2 circular arrows buttons(white outline transparent fill 40px diameter, 2px stroke)
All elements must be perfectly aligned and spaced as shown.(see attached image for layout reference)


IMAGERY:

Use a hyper-realistic, isolated tinted brush image (configure the current if u must)

ANIMATIONS (GSAP)

hero heading: on load, fade in and scale up from 0.8 to 1.0, stagger each letter by 0.05s
Brush image: on load scale in from 0.7 to 1.0 with a subtle rotation fade in
CTA button fade in from bottom 0.7 delay subtle black glow pulse on hover.
Texts act accordingly from each side.
Card hover effects: for navigation and pagination arrows scale up to 1.1x and increase shadow on hover
Pagination: fade in from right 0.8s delay
All transitions: use cubic-bezier(0.77, 0, 0.175,1) for smooth, modern easing
all animations must be strictly timed and sequenced as visible.

Responsive behaviour check all my other .md files

Performance
use nex/image for all imagss lazy loading and responsive sized
optimize all svgs and icons
minimize bundle size, use code splitting for sections
target lighthouse score of 90+
