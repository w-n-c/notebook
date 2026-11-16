---
title: "The Reel: Every Layout"
source: "https://every-layout.dev/layouts/reel/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Reel

## The problem

[#](#the-problem)

When I’m sequencing music, I don’t know how long the track I’m creating is going to be until I’m done. My sequencer software is aware of this and provisions time *on demand*, as I add bars of sound. Just as music sequencers dynamically provision time, web pages provision space. If all songs had to be four minutes and twenty six seconds long, or all web pages `768px` high, well, that would be needlessly restrictive.

![Music sequencer. X axis marks time and y axis marks instruments](https://every-layout.dev/images/illustrations/reel_sequencer.svg)

The mechanism whereby the provisioned space can be explored within a fixed “viewport” is called *scrolling*. Without it, everyone’s devices would have to be exactly the same size, shape, and magnification level at all times. Writing content for such a space would become a formalist game, like writing haiku. Thanks to scrolling, you don’t have to worry about space when writing web content. Writing for print does not have the same luxury.

The CSS `writing-mode` with which you are probably most familiar is `horizontal-tb`. In this mode, text and inline elements progress horizontally (either from left to right, as in English, or right to left) and block elements flow from top to bottom (that’s the `tb` part). Since text and inline elements are instructed to *wrap*, the horizontal overflow which would trigger horizontal scrolling is generally avoided. Because content is not permitted to reach *outwards* is resolves to reach *downwards*. The vertical progression of block elements inevitably triggers vertical scrolling instead.

![Block elements stay within the width of their parent, but overflow vertically. One block element is shown overflowing the viewport at the bottom. A vertical scrollbar has appeared.](https://every-layout.dev/images/illustrations/reel_vertical_overflow.svg)

As a Western reader, accustomed to the `horizontal-tb` writing mode, vertical scrolling is conventional and expected. When you find the page needs to be scrolled vertically to see all the content, you don’t think something has gone wrong. Where you encounter *horizontal* scrolling, it’s not only unexpected but has clear usability implications: where overflow follows writing direction, each successive line of text has to be scrolled to be read.

All this is not to say that horizontal scrolling is strictly forbidden within a `horizontal-tb` writing mode. In fact, where implemented deliberately and clearly, horizontally scrolling sections within a vertically scrolling page can be an ergonomic way to browse content. Television streaming services tend to dissect their content by category vertically and programme horizontally, for example. The one thing you really want to avoid are single elements that scroll *bidirectionally*. This is considered a failure under WCAG’s **1.4.10 Reflow** criterion.

![On the left, the page scrolls vertically and horizontally, and is marked as bad with a cross. On the right, the page scrolls vertically and some elements inside the page scroll horizontally, which is marked as good with a tick.](https://every-layout.dev/images/illustrations/reel_bidirectional.svg)

I formalized [an accessible “carousel” component for the BBC](https://bbc.github.io/gel/components/carousels/) which—instead of deferring entirely to JavaScript for the browsing functionality—simply invokes native scrolling with overflow. The browsing buttons provided are merely a progressive enhancement, and increment the scroll position. Every Layout’s **Reel** is similar, but foregoes the JavaScript to rely on standard browser scrolling behavior alone.

## The solution

[#](#the-solution)

As we set out in [**The Cluster**](https://every-layout.dev/layouts/cluster), an efficient way to change the direction of block flow is to create a Flexbox context. By applying `display: flex` to an element, its children will switch from progressing downwards to progressing rightwards — at least where the default LTR (left-to-right) writing `direction` is in effect.

By omitting the often complementary `flex-wrap: wrap` declaration, elements are forced to maintain a single-file formation. Where this line of content is longer than the parent element is wide, overflow occurs. By default, this will cause the page itself to scroll horizontally. We don’t want that, because it’s only our Flexbox content that actually needs scrolling. It would be better that everything else stays still. So, instead, we apply `overflow: auto` to the Flex element, which automatically invokes scrolling *on that element* and only where overflow does indeed occur.

```
.reel {
  display: flex;
  /* ↓ We only want horizontal scrolling */
  overflow-x: auto;
}
```

![Overflowing the container on the right causes the scrollbar to appear.](https://every-layout.dev/images/illustrations/reel_overflow_auto.svg)

I’m yet to tackle affordance (making the element *look* scrollable), and there’s the matter of spacing to address too, but this is the core of the layout. Because it capitalizes on standard browser behavior, it’s extremely terse in code and robust — quite unlike your average carousel/slider jQuery plugin.

### The scrollbar

Scrolling is multimodal functionality: there are many ways to do it, and you can choose whichever suits you best. While touch, trackpad gestures, and arrow key presses may be some of the more ergonomic modes, clicking and dragging the scrollbar itself is probably the most familiar, especially to older users on desktop. Having a visible scrollbar has two advantages:

1. It allows for scrolling by dragging the scrollbar handle (or *"thumb"*)
2. It indicates scrolling is available by this and other means (*increases affordance*)

Some operating systems and browsers hide the scrollbar by default, but there are CSS methods to reveal it. Webkit and Blink-based browsers proffer the following prefixed properties:

```
::-webkit-scrollbar {
}
::-webkit-scrollbar-button {
}
::-webkit-scrollbar-track {
}
::-webkit-scrollbar-track-piece {
}
::-webkit-scrollbar-thumb {
}
::-webkit-scrollbar-corner {
}
::-webkit-resizer {
}
```

As of version 64, there are also limited opportunities to style the scrollbar in Firefox, with the standardized `scrollbar-color` and `scrollbar-width` properties. Note that the `scrollbar-color` settings only take effect on MacOS where **Show scroll bars** is set to **Always** (in **Settings > General**).

Setting scrollbar colors is a question of aesthetics, which is not really what **Every Layout** is about. But it’s important, for reasons of affordance, that scrollbars are *apparent*. The following black and white styles are chosen just to suit **Every Layout’s** own aesthetic. You can adjust them as you wish.

```
.reel {
  display: flex;
  /* ↓ We only want horizontal scrolling */
  overflow-x: auto;
  /* ↓ First value: thumb; second value: track */
  scrollbar-color: var(--color-light) var(--color-dark);
}

.reel::-webkit-scrollbar {
  block-size: 1rem;
}

.reel::-webkit-scrollbar-track {
  background-color: var(--color-dark);
}

.reel::-webkit-scrollbar-thumb {
  background-color: var(--color-dark);
  background-image: linear-gradient(var(--color-dark) 0, var(--color-dark) 0.25rem, var(--color-light) 0.25rem, var(--color-light) 0.75rem, var(--color-dark) 0.75rem);
}
```

Not all properties are supported for these proprietary pseudo-classes. Hence, visually *insetting* the thumb is a question of painting a centered stripe using a `linear-gradient` rather than attempting a margin or border.

![Shows how the scrollbar thumb has a dark to light to dark gradient to make it look inset.](https://every-layout.dev/images/illustrations/reel_gradient.svg)

### Height

What should the height of a **Reel** instance be? Probably shorter than the viewport, so that the whole **Reel** can be brought into view. But should we be setting a height at all? Probably not. The best answer is *"as high as it needs to be"*, and is a question of the *content* height.

In the following demonstration, a **Reel** element houses a set of card-like components. The height of the **Reel** is determined by the height of the tallest card, which is the card with the most content. Note that the last element of each “card” (a simple attribution) is pushed to the bottom of the space, by using a [**Stack**](https://every-layout.dev/layouts/stack) with `splitAfter="2"`.

[Launch (opens new tab)](https://every-layout.dev/demos/reel-cards)

For images, which may be very large or use differing aspect ratios, we may want to *set* the **Reel’s** height. The common image `block-size` (`height` in a `horizontal-tb` writing mode) should accordingly be `100%`, and the width `auto`. This will ensure the images share a height but maintain their own aspect ratio.

```
.reel {
  block-size: 50vh;
}

.reel > img {
  block-size: 100%;
  width: auto;
}
```

[Launch (opens new tab)](https://every-layout.dev/demos/reel-images)

### Spacing

Spacing out the child elements used to be a surprisingly tricky business. A border is applied around the **Reel** in this case, to give it its shape.

Until recently, we would have had to use margin and the adjacent sibling combinator to add a space between the child elements. We use a logical property to ensure the **Reel** works in both writing directions.

```
.reel > * + * {
  margin-inline-start: var(--s1);
}
```

Now, since we’re in a Flexbox context, we are also able to use the `gap` property, which is applied to the parent:

```
.reel {
  gap: var(--s1);
}
```

The main advantage of `gap` is ensuring the margins don’t appear in the wrong places when elements wrap. Since the **Reel’s** content is not designed to wrap, we shall use the `margin` -based solution instead. It’s longer and better supported.

Adding spacing *around* the child elements (in between them and the parent `.reel` element) is a trickier business. Unfortunately, [padding interacts unexpectedly with scrolling](https://www.brunildo.org/test/overscrollback.html). The effect on the right hand side is as if there were no padding at all:

![Scrollable area is scrolled all the way to the right. The last child element’s right edge is flush with the parent’s right edge despite the padding on the parent](https://every-layout.dev/images/illustrations/reel_padding_issue.svg)

So, if we want spacing around the children, we take a different approach. We add margin to all but the right hand side of each child element, then insert space using pseudo-content on the last of those children.

```
.reel {
  border-width: var(--border-thin);
}

.reel > * {
  margin: var(--s0);
  margin-inline-end: 0;
}

.reel::after {
  content: '';
  flex-basis: var(--s0);
  /* ↓ Default is 1 so needs to be overridden */
  flex-shrink: 0;
}
```

![The pseudo-content fixes the spacing issue by moving the last child’s right outer edge away from the parent’s right inner edge.](https://every-layout.dev/images/illustrations/reel_pseudo_content.svg)

The implementation to follow assumes you do not need padding on the **Reel** element itself; the approach using `.reel > * + *` therefore suffices.

That just leaves the space between the children and the scrollbar (where present and visible) to handle. Not a problem, you may think: just add some padding to the bottom of the parent (`class="reel"` here). The trouble is, this creates a *redundant* space wherever the **Reel** is not overflowing and the scrollbar has not been invoked.

Ideally, there would be a pseudo-class for overflowing/scrolling elements. Then we could add the padding selectively. Currently, the [`:overflowed-content` pseudo-class](https://github.com/w3c/csswg-drafts/issues/2011) exists as little more than an idea. For now, we can apply the margin, and remove it using JavaScript and a simple `ResizeObserver`. Innately, this is a progressive enhancement technique: where JavaScript is unavailable, or `ResizeObserver` is not supported, the padding does not appear for an overflowing **Reel** — but with little detrimental effect. It just presses the scrollbar up against the content.

```js
const reels = Array.from(document.querySelectorAll('.reel'));
const toggleOverflowClass = elem => {
  elem.classList.toggle('overflowing', elem.scrollWidth > elem.clientWidth);
};

for (let reel of reels) {
  if ('ResizeObserver' in window) {
    new ResizeObserver(entries => {
      toggleOverflowClass(entries[0].target);
    }).observe(reel);
  }
}
```

Inside the observer, the **Reel’s** `scrollWidth` is compared to its `clientWidth`. If the `scrollWidth` is larger, the `overflowing` class is added.

```
.reel.overflowing {
  padding-block-end: var(--s0);
}
```

We’re not quite done yet, because we haven’t dealt with the case of child elements being dynamically removed from the **Reel**. That will affect `scrollWidth` too. We can abstract the class toggling function and add a `MutationObserver` that observes the `childList`. [`MutationObserver` is almost ubiquitously supported](https://caniuse.com/mutationobserver).

```js
const reels = Array.from(document.querySelectorAll('.reel'));
const toggleOverflowClass = elem => {
  elem.classList.toggle('overflowing', elem.scrollWidth > elem.clientWidth);
};

for (let reel of reels) {
  if ('ResizeObserver' in window) {
    new ResizeObserver(entries => {
      toggleOverflowClass(entries[0].target);
    }).observe(reel);
  }

  if ('MutationObserver' in window) {
    new MutationObserver(entries => {
      toggleOverflowClass(entries[0].target);
    }).observe(reel, {childList: true});
  }
}
```

It’s fair to say this is a bit *overkill* if only used to add or remove that bit of padding. But these observers can be used for other enhancements, even beyond styling. For example, it may be beneficial to keyboard users for an overflowing/scrollable **Reel** to take the `tabindex="0"` attribution. This would make the element focusable by keyboard and, therefore, scrollable using the arrow keys. If each *child element* is focusable, or includes focusable content, this may not be necessary: focusing an element automatically brings it into view by changing the scroll position.

## Use cases

[#](#use-cases)

The **Reel** is a robust and efficient antidote to carousel/slider components. As already discussed and demonstrated, it is ideal for browsing categories of things: movies; products; news stories; photographs.

In addition, it can be used to supplant button-activated menu systems. What Bradley Taunt calls [sausage links](https://bradleytaunt.com/hamburger-menu-alternative/) may well be more usable than “hamburger” menus for many. For such a use case, the visible scrollbar is probably rather heavy-handed. This is why the ensuing [custom element implementation](#the-component) includes a Boolean `noBar` property.

[Launch (opens new tab)](https://every-layout.dev/demos/reel-links)

There’s no reason why the links have to be shaped like sausages, of course! That’s just an etymological hangover. One thing to note, however, is the lack of affordance the omitted scrollbar represents. So long as the last visible child element on the right is partly obscured, it’s relatively clear overflow is occurring and the ability to scroll is present. If this is not the case, it may appear that all of the available elements are already in view.

![In the first version, the right-most element is partly obscured. The label reads "I need to scroll". In the second version, the right-most element is completely obscured. The label reads "Everything seems to be here".](https://every-layout.dev/images/illustrations/reel_obscured.svg)

From a layout perspective, you can reduce the likelihood of *"Everything seems to be here"* by avoiding certain types of width. Percentage widths like `25%` or `33.333%` are going to be problematic because—at least in the absence of spacing—this will fit the elements exactly within the space.

In addition, you can indicate the availability of scrolling by other means. You can capitalize on the observers’ `overflowing` class to reveal a textual instruction (reading *"scroll for more"*, perhaps):

```
.reel.overflowing + .instruction {
  display: block;
}
```

However, this is not reactive to the *current* scroll position. You might use additional scripting to detect when the element is scrolled all the way to either side, and add `start` or `end` classes accordingly. The ever-innovative [Lea Verou devised a way to achieve something similar using images and CSS alone](http://lea.verou.me/2012/04/background-attachment-local/). Shadow background images take `background-attachment: scroll` and remain at either end of the scrollable element. “Shadow cover” background images take `background-attachment: local`, moving *with* the content. Whenever the user reaches one end of the scrollable area, these “shadow cover” backgrounds obscure the shadows beneath them.

These considerations don’t strictly relate to layout, more to communication, but are worth exploring further to improve usability.

## The generator

[#](#the-generator)

Use this tool to generate basic **Reel** CSS and HTML. You would want to include the `ResizeObserver` script along with the code generated. Here’s a version implemented as an Immediately Invoked Function Expression (IIFE):

```js
(function() {
  const className = 'reel';
  const reels = Array.from(document.querySelectorAll(\`.${className}\`));
  const toggleOverflowClass = elem => {
    elem.classList.toggle('overflowing', elem.scrollWidth > elem.clientWidth);
  };

  for (let reel of reels) {
    if ('ResizeObserver' in window) {
      new ResizeObserver(entries => {
        toggleOverflowClass(entries[0].target);
      }).observe(reel);
    }

    if ('MutationObserver' in window) {
      new MutationObserver(entries => {
        toggleOverflowClass(entries[0].target);
      }).observe(reel, {childList: true});
    }
  }
})();
```

```
.reel {
  display: flex;
  block-size: auto;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-color: #fff #000;
}

.reel::-webkit-scrollbar {
  block-size: 1rem;
}

.reel::-webkit-scrollbar-track {
  background-color: #000;
}

.reel::-webkit-scrollbar-thumb {
  background-color: #000;
  background-image: linear-gradient(#000 0, #000 0.25rem, #fff 0.25rem, #fff 0.75rem, #000 0.75rem);
}

.reel > * {
  flex: 0 0 auto;
}

.reel > img {
  block-size: 100%;
  flex-basis: auto;
  width: auto;
}

.reel > * + * {
  margin-inline-start: 1rem;
}

.reel.overflowing {
  padding-block-end: 1rem;
}
```
```
<div class="reel">
  <div><!-- header --></div>
  <div><!-- centered --></div>
  <div><!-- footer --></div>
</div>
```

## The component

[#](#the-component)

A custom element implementation of the **Reel** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Reel** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| itemWidth | `string` | `"auto"` | The width of each item (child element) in the Reel |
| space | `string` | `"var(--s0)"` | The space between Reel items (child elements) |
| height | `string` | `"auto"` | The height of the Reel itself |
| noBar | `boolean` | `false` | Whether to display the scrollbar |

### Examples

#### Card slider

In this example, cards are given a `20rem` width. Note that a “fixed” width is acceptable in this circumstance, since the horizontal space is provisioned as needed, and wrapping takes care of text and inline elements: the cards are allowed to grow *downwards*.

```html
<reel-l itemWidth="20rem">
  <box-l>
    <stack-l>
      <!-- card content -->
    <stack-l>
  </box-l>
  <box-l>
    <stack-l>
      <!-- card content -->
    <stack-l>
  </box-l>
  <box-l>
    <stack-l>
      <!-- card content -->
    <stack-l>
  </box-l>
  <!-- ad infinitum -->
</reel-l>
```

#### Slidable links

Note the use of `role="list"` and `role="listitem"` to communicate the component as a list in screen reader output. This is customary for navigation regions.

```html
<reel-l role="list" noBar>
  <div role="listitem">
    <a class="cta" href="/path/to/home">Home</a>
  </div>
  <div role="listitem">
    <a class="cta" href="/path/to/about">About</a>
  </div>
  <div role="listitem">
    <a class="cta" href="/path/to/pricing">Pricing</a>
  </div>
  <div role="listitem">
    <a class="cta" href="/path/to/docs">Documentation</a>
  </div>
  <div role="listitem">
    <a class="cta" href="/path/to/testimonials">Testimonials</a>
  </div>
</reel-l>
```