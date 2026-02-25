Human / Media



Overview: 

Human Media a dynamic web project that explores the tension between humans and the media systems that shape them. The interface is divided into two modes:

- Human World — where the user shapes the medium.

- Media World — where the medium shapes the user.

The site pulls live content from an Are.na channel and renders it dynamically, transforming external media into two contrasting experiential environments.

Rather than presenting static content, the project investigates how interaction, pacing, layering, and control influence the way we experience digital media.




Concept:

The project asks:

Who controls the medium — the system or the human?

Human World:
A slower, breathable environment where the user moves with intention.
Blocks rise gently into focus while scrolling. Images can be enlarged and examined. The interface allows pause, reflection, and choice.

Media World:
A denser, accelerated environment.
Media stacks, competes, and overwhelms. There is less room to linger. The system dictates rhythm and attention.

Switching between worlds is controlled by toggling a single class on the <body>, shifting the entire visual and interaction logic of the site.




Features:

Live data fetching from the Are.na API
Dynamic rendering of: images, text, audio, embedded media and videos
Scroll-based layering system using IntersectionObserver
Custom audio player controls (play / pause toggle)
Image zoom modal (available only in Human World)
World switcher that modifies CSS state
Responsive design
Supports dynamic content by attaching listeners to parent elements instead of individual blocks



Technical Architecture:

fetchJson() retrieves fresh API data (no caching).
Channel metadata is rendered via placeChannelInfo().
User information is rendered via renderUser().
Channel blocks are looped through and passed to renderBlock().
Each block is conditionally rendered depending on its type: Image, Text, Attachment (audio), Embed



Scroll Interaction:

IntersectionObserver is used to structure how attention moves through the page.
Each block is assigned a base z-index for layered stacking.
When a block enters the center of the viewport, it rises to the front.
When it leaves, it returns to its original depth.
The navigation bar remains hidden while the landing section is visible and appears once the user scrolls past it.


Modal System:

The info modal opens contextually depending on the active world.
Image enlargement is enabled only in Human World.
Dialog elements use the native <dialog> API.
Click-outside detection and cleanup logic maintain proper state.



Audio Interaction:

Custom audio controls replace the browser’s default UI.
Event delegation is used to handle dynamically loaded players.
Each play button locates and controls its corresponding <audio> element.
UI state updates based on playback state.



Design Decisions:

rem used for structural scaling.
ch used for readable text width in Human World.
CSS variables (--z) dynamically controlled by JavaScript.
Body class toggling used for global world-state switching.


Future Improvements:

Introduce smoother transition behaviors in Human World, allowing blocks to appear more gradually and fluidly as they enter the viewport.
Push the overlapping and layering logic further in Media World to intensify the sense of density and visual compression.
Expand distortion and motion behaviors to further differentiate the two environments.
Refine scroll timing and intersection thresholds for more precise attention choreography.



Author

Maika Sacerdote
Communication Design — Parsons School of Design