---
title: "The Frame: Every Layout"
source: "https://every-layout.dev/layouts/frame/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Frame

## The problem

[#](#the-problem)

Some things exist as relationships. A line exists as the relationship between two points; without both the points, the line cannot come into being.

When it comes to drawing lines, there are factors we don’t necessarily know, and others we absolutely do. We don’t necessarily know where, in the universe, each of the points will appear. That might be outside of our control. But we *do* know that, no matter where the points appear, we’ll be able to draw a straight line between them.

![Pairs of dots are joined by lines. The lines intersect.](https://every-layout.dev/images/illustrations/frame_generative.svg)

Image caption: Connecting randomly placed pairs of dots makes for some extremely pedestrian generative art.

The position of the points is variable, but the nature of their relationship is constant. Capitalizing on the constants that exist in spite of the variables is how we shape dynamic systems.

### Aspect ratio

Aspect ratio is another constant that comes up a lot, especially when working with images. You find the aspect ratio by dividing the width of an image by its height.

![A 16 by 9 aspect ratio represented by 16 colon 9, 16 over 9 (a vulgar fraction) or 1.777](https://every-layout.dev/images/illustrations/frame_aspect_ratio.svg)

The `<img />` element is a [replaced element](https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element); it is an element *replaced* by the externally loaded source to which it points.

This source (an image file such as a PNG, JPEG, or SVG) has certain characteristics outside of your control as a writer of CSS. Aspect ratio is one such characteristic, and is determined when the image is originally created and cropped.

Making your images responsive is a matter of ensuring they don’t overflow their container. A `max-inline-size` value of `100%` does just that.

```
img {
  max-inline-size: 100%;
}
```

Now the image’s width will match one of two values:

- Its own intrinsic/natural width, based on the file data
- The width of the horizontal space afforded by the container element

Importantly, the height—in either case—is determined by the aspect ratio. It’s the same as writing `block-size: auto`, but that explicit declaration isn’t needed by modern, compliant browsers.

```
height == width / aspect ratio
```

Sometimes we want to dictate the aspect ratio, rather than inheriting it from the image file. The only way to achieve this without squashing, or otherwise distorting, the image is to dynamically recrop it. Declaring `object-fit: cover` on an image will do just that: crop it to fit the space without augmenting its *own* aspect ratio. The container becomes a window onto the undistorted image.

![A 16:9 frame placed over a 24:9 image. There are no gaps in the frame.](https://every-layout.dev/images/illustrations/frame_image_in_frame.svg)

What might be useful is a general solution whereby we can draw a rectangle, based on a given aspect ratio, and make it a window onto any content we place within it.

## The solution

[#](#the-solution)

The first thing we need to do is find a way to give an arbitrary element an aspect ratio *without* hard-coding its width and height. That is, we need to make a container behave like a (replaced) image.

For that, we have the [aspect ratio property](https://css-tricks.com/almanac/properties/a/aspect-ratio/) that would take an `x/n` value:

```
.frame {
  aspect-ratio: 16 / 9;
}
```

Before the advent of this property, we had to lean on [an intrinsic ratio technique](https://alistapart.com/article/creating-intrinsic-ratios-for-video/) first written about as far back as 2009. The technique capitalizes on the fact that padding, even in the vertical dimension, is relative to the element’s width. That is, `padding-bottom: 56.25%` will make an empty element (with no set height) *nine sixteenths as high as it is wide* — an aspect ratio of `16:9`. You find `56.25%` by dividing `9` (representing the height) by `16` (representing the width) — the opposite way around to finding the aspect ratio itself.

![The bottom padding of 66.666% is what gives the element its shape: an aspect ratio of 6:9](https://every-layout.dev/images/illustrations/frame_padding.svg)

Using custom properties and `calc()`, we can create an interface that accepts any numbers for the left (numerator, or `n`) and right (denominator, or `d`) values of the ratio:

```
.frame {
  padding-bottom: calc(var(--n) / var(--d) * 100%);
}
```

Assuming `class="frame"` is a [block level element](https://every-layout.dev/rudiments/boxes#the-display-property) (such as a `<div>`), its width will automatically match that of its parent. Whatever the calculated width value, the height is determined by multiplying it by `9 / 16`.

Since [support is now good for the `aspect-ratio` property](https://caniuse.com/mdn-css_properties_aspect-ratio), we can go ahead and use that instead of this elaborate hack.

### Cropping

So how does the cropping work? For replaced elements, like `<img />` and `<video />` elements, we just need to give them a `100%` width and height, along with `object-fit: cover`:

```
.frame {
  aspect-ratio: 16 / 9;
}

.frame > img,.frame > video {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}
```

The `object-fit` property is not designed for normal, non-replaced elements, so we’ll have to include something more to handle them. Fortunately, Flexbox justification and alignment can have a similar effect. Since Flexbox has no affect on replaced elements, we can safely add these styles to the parent, with `overflow: hidden` preventing the content from escaping.

```
.frame {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.frame > img,.frame > video {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}
```

Now any simple element will be placed in the center of the **Frame**, and cropped where it is taller or wider than the **Frame** itself. If the element’s content makes it taller than the parent, it’ll be cropped at the top *and* the bottom. Since inline content wraps, a specific set width might be needed to cause cropping on the left and right. To make sure the cropping happens in all contexts, and at all zoom levels, a `%` -based value will work.

![The child element is cropped on the top and bottom edges due to its content making it taller than its parent. It’s cropped on the left and right edges due to a 150% width](https://every-layout.dev/images/illustrations/frame_flexbox.svg)

## Use cases

[#](#use-cases)

The **Frame** is mostly useful for cropping media (videos and images) to a desired aspect ratio. Once you start controlling the aspect ratio, you can of course tailor it to the current circumstances. For example, you might want to give images a different aspect ratio depending on the viewport orientation.

It’s possible to achieve this by changing the custom property values via an orientation `@media` query. In the following example, the **Frame** elements of the previous example are made square (rather than `16:9` landscape) where there is relatively more vertical space available.

```
@media (orientation: portrait) {
  .frame {
    aspect-ratio: 1 / 1;
  }
}
```

The Flexbox provision means you can crop any kind of HTML to the given aspect ratio, including `<canvas>` elements if those are your chosen means of creating imagery. A set of card-like components might each contain either an image or—where none is available—a textual fallback:

[Launch (opens new tab)](https://every-layout.dev/demos/frames-in-cards)

## The generator

[#](#the-generator)

Use this tool to generate basic **Frame** CSS and HTML.

```
.frame {
  --n: 16;
  --d: 9;
  aspect-ratio: var(--n) / var(--d);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.frame > img,
.frame > video {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}
```
```
<div class="frame">
  
</div>
```

## The component

[#](#the-component)

A custom element implementation of the **Frame** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Frame** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ratio | `string` | `"16:9"` | The element's aspect ratio |

### Examples

#### Image frame

The custom element takes a `ratio` expression, like `4:3` (`16:9` is the default).

```html
<frame-l ratio="4:3">
  <img src="/path/to/image" alt="description of the image here" />
</frame-l>
```