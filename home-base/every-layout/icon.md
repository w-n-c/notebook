---
title: "The Icon: Every Layout"
source: "https://every-layout.dev/layouts/icon/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Icon

## The problem

[#](#the-problem)

Most of the layouts in **Every Layout** take the form of *block components*, if you’ll excuse the expression. That is, they set a [block-level](https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements) context wherein they affect the layout of child elements in their control. As you will discover in [**Boxes**](https://every-layout.dev/rudiments/boxes), elements with display values of either `block`, `flex`, or `grid` are themselves block-level (`flex` and `grid` differ by affecting their child elements in a special way).

Here, we shall be looking at something a lot smaller, and it doesn’t get much smaller than an icon. This will be the first layout for which the [custom element](#the-component) will retain its default `inline` display mode.

Getting things to line up and look right, *inline* can be a precarious business. When it comes to icons, we have to worry about things like:

- The distance between the icon and the text
- The height of the icon compared with the height of the text
- The vertical alignment of the icon to the text
- What happens when the text comes *after* the icon, rather than before
- What happens when you resize the text

### A simple icon

Before looking into any of these, I’m first going to give you a really quick crash course in SVG iconography, since SVG is the *de facto* iconography format on the web. Consider the following code:

```html
<svg viewBox="0 0 10 10" width="0.75em" height="0.75em" stroke="currentColor" stroke-width="2">
  <line x1="1" y1="1" x2="9" y2="9" />
  <line x1="9" y1="1" x2="1" y2="9" />
</svg>
```

This defines a simple icon: a cross. Let me explain each of the key features:

- **`viewBox`**: This defines the coordinate system for the SVG. The `0 0` part means *“count from the top left corner”* and the *“10 10”* part means give the SVG “canvas” 10 horizontal, and 10 vertical, coordinates. We are defining a square, since all our icons will occupy a square space.
- **`width` and `height`**: This sets the size of the icon. I shall explain why it uses the `em` unit, and is set to `0.75em` shortly. For now, be aware that we set the width and height *on* the SVG, rather than in CSS, because we want to keep the icon small even if CSS fails to load. SVGs are displayed very large in most browsers by default.
- **`stroke` and `stroke-width`**: These presentational attributes give the `<line />` elements visible form. They can be written, or overridden, in CSS. But since we aren’t using many, it’s better to make sure these too are CSS-independent.
- **`<line />`**: The `<line />` element draws a simple line. Here we have one drawn from the top left to the bottom right, followed by one drawn from the top right to the bottom left (making our cross). I’m using `1` and `9`, not `0` and `10`, to compensate for the line’s `stroke-width` of `2`. Otherwise the line would overflow the SVG “canvas”.

![Left: cross marked with the coordinates of the end points in each corner. Right: cross marked with the stroke width and stroke color.](https://every-layout.dev/images/illustrations/icon_coords_and_styles.svg)

There are many ways to draw the same cross shape. Perhaps the most efficient is to use a `<path />` element. A path lets you place all the coordinates in one `d` attribute. The `M` symbol marks the start of each line’s separate coordinates:

```html
<svg viewBox="0 0 10 10" width="0.75em" height="0.75em" stroke="currentColor" stroke-width="2">
  <path d="M1,1 9,9 M9,1 1,9" />
</svg>
```

When your SVG data is this terse, there’s no reason not to include it *inline* rather than using an `<img />` pointing to an SVG `src` file.

There are other advantages besides being able to dispense with an HTTP request, like the ability to use `currentColor` as shown. This keyword makes your inline SVG adopt the `color` of the surrounding text. For the demo icons to follow, the icons are included via the `<use>` element, which references one of many icon `<symbol>` s defined in a single **icons.svg** file (and therefore HTTP request). The `currentColor` technique still works when referencing SVG data in this way.

```html
<svg class="icon">
  <use href="/images/icons/icons.svg#cross"></use>
</svg>
```

In any case, SVG is an efficient *scalable* format, much better suited to iconography than raster images like PNGs, and without the attendant [accessibility issues](https://cloudfour.com/thinks/seriously-dont-use-icon-fonts/) of icon fonts.

Our task here is to create a dependable SVG canvas for square icons, and ensure it fits seamlessly alongside text, with the minimum of manual configuration.

## The solution

[#](#the-solution)

### Vertical alignment

As the previous note on `currentColor` suggests, we are going to treat our icons like text, and get them to accompany text as seamlessly as possible. Fortunately, the SVG will sit on the text’s `baseline` by default, as if it were a letter.

For taller icons, you may expect to be able to use `vertical-align: middle`. However, contrary to popular belief this does not align around the vertical middle of the font, but *the vertical middle of the lowercase letters of the font*. Hence, the result will probably be undesirable.

![On the left: Baseline marked at bottom edge of letters. On the right: line is marked bisecting the lowercase letters. The larger cross icon sits too low, consequently.](https://every-layout.dev/images/illustrations/icon_align.svg)

Instead, adjusting the vertical alignment for a taller icon will probably be a matter of supplying the `vertical-align` attribute with a length. This length represents the distance above the baseline, and can take a negative value.

![The larger icon is dragged down by 0.125em](https://every-layout.dev/images/illustrations/icon_align_length.svg)

For our **Icon** layout, we shall stick to sitting icons on the baseline. This is the most robust approach since icons that hang below the baseline may collide with a successive line of text where wrapping occurs.

### Matching height

A suitable icon height, starting at the baseline, depends somewhat on the casing of the font and the presence or absence of [descenders](https://typedecon.com/blogs/type-glossary/descender/). Where the letters are all lowercase, and include descenders, things can look particularly unbalanced.

[Launch (opens new tab)](https://every-layout.dev/demos/icon-casings)

This perceptual issue can be mitigated by ensuring the first letter of the icon’s accompanying text is always uppercase, and that the icon itself is the height of an uppercase letter.

Actually matching the uppercase letter height *per font* is another matter. You might expect `1em` to be the value, but that is rarely the case. `1em` more closely matches the height of the font itself. By making selections of text from a few fonts, you’ll see the font height is often taller than its capital letters. To put it another way: `1em` corresponds to font metrics, not letter metrics.

In my experimentation, I found that `0.75em` more closely matches uppercase letter height. Hence, the presentation attributes for my cross icon being `0.75em` each, to make a square following the precedent set by the `viewBox`.

```html
<svg viewBox="0 0 10 10" width="0.75em" height="0.75em" stroke="currentColor" stroke-width="2">
  <path d="M1,1 9,9 M9,1 1,9" />
</svg>
```

![Popular fonts showing that each icon matches its uppercase letter height](https://every-layout.dev/images/illustrations/icon_different_fonts.svg)

From left to right: Arial, Georgia, Trebuchet, and Verdana. For each icon, `0.75em` matches the uppercase letter height.

However, the [emerging `cap` unit](https://drafts.csswg.org/css-values/#cap) promises to evaluate the individual font for a more accurate match. Since it is currently not supported very well, we can use `0.75em` as a fallback in our CSS:

```
.icon {
  height: 0.75em;
  height: 1cap;
  width: 0.75em;
  width: 1cap;
}
```

Better to have the `0.75em` values in the CSS as well, in case an author has omitted the presentational attributes.

As Andy wrote in [Relative Sizing With EM units](https://piccalil.li/tutorial/relative-sizing-with-em-units/), the icon will now scale automatically with the text: `0.75em` is relative to the `font-size` for the context. For example:

```
.small {
  font-size: 0.75em;
}

.small .icon {
  /* Icon height will automatically be    0.75 * 0.75em */
}

.big {
  font-size: 1.25em;
}

.big .icon {
  /* Icon height will automatically be    1.25 * 0.75em */
}
```

[Launch (opens new tab)](https://every-layout.dev/demos/icon-sizes)

### Spacing between icon and text

To establish how we manage the spacing of our icons, we have to weigh efficiency against flexibility. In design systems, sometimes inflexibility can be a virtue, since it enforces regularity and consistency.

Consider our cross icon in context, inside a button element and alongside the text “Close”:

```html
<button>
  <svg class="icon">...</svg> Close
</button>
```

Note the space (unicode point U+0020, if you want to be scientific) between the SVG and the text node. This adds a visible space between the icon and the text, as I’m sure you can imagine. Now, you don’t have control over this space. Even adding an extra space of the same variety in the source will not help you, since it will be collapsed down to a single space by the browser. But it is a *suitable* space, because it matches the space between any words in the same context. Again, we are treating the icon like text.

A couple of other neat things about using simple text spacing with your icons:

1. If the icon appears on its own, the space does not appear (making the spacing inside the button look uneven) even if it remains in the source. It is collapsed under this condition too.
2. You can use the `dir` attribute with the `rtl` (right-to-left) value to swap the icon visually from left to right. The space will still appear *between* the icon and text becuse the text direction, including the spacing, has been reversed.
```html
<button dir="rtl">
  <svg class="icon"></svg> Close
</button>
```

![Whether the icon is on the left or right, a space appears between the icon and the adjacent text](https://every-layout.dev/images/illustrations/icon_dir.svg)

It’s neat when we can use a fundamental feature of HTML to reconfigure our design, rather than having to write bespoke styles and attach them to arbitrary classes.

If you *do* want control of the length of the space, you have to accept an increase in complexity, and a diminishing of reusability: It’s not really possible without setting a context for the icon in order to remove the extant space first. In the following code, the context is set by the `.with-icon` element and the word space eliminated by making it `inline-flex`.

```
.icon {
  height: 0.75em;
  height: 1cap;
  width: 0.75em;
  width: 1cap;
}

.with-icon {
  display: inline-flex;
  align-items: baseline;
}
```

The `inline-flex` display value behaves as its name suggests: it creates a `flex` context, but the element creating that context itself displays as inline. Employing `inline-flex` eliminates the word space, freeing us to create a space/gap purely with margin.

![Left: a space appear by default. Center: inline-flex eliminates it. Right: Then you can add a margin](https://every-layout.dev/images/illustrations/icon_inline-flex.svg)

Now we can add some margin. How do we add it in such a way that it always appears in the correct place, like the space did? If I use `margin-right: 0.5em`, it will work where the icon is on the left, before the text. But if I add `dir="rtl"` that margin remains on the right, creating a gap on the wrong side.

The answer is [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties). While `margin-top`, `margin-right`, `margin-bottom`, and `margin-left` all pertain to *physical* orientation and placement, logical properties honor instead the direction of the *content*. This differs depending on the flow and writing direction, as explained in [**Boxes**](https://every-layout.dev/rudiments/boxes).

In this case, I would use `margin-inline-end` with the icon element. This applies margin *after* the element in the direction of the text (hence `-inline-`):

```
.icon {
  height: 0.75em;
  height: 1cap;
  width: 0.75em;
  width: 1cap;
}

.with-icon {
  display: inline-flex;
  align-items: baseline;
}

.with-icon .icon {
  margin-inline-end: var(--space, 0.5em);
}
```

![Left side: Left to right direction shows end on right side of icon. Right side: Right to left direction shows end on left side of icon.](https://every-layout.dev/images/illustrations/icon_ends.svg)

One disadvantage with this more flexible approach to spacing is that the margin remains even where text is not supplied. Unfortunately, although you can target lone elements with `:only-child`, you cannot target lone elements *unaccompanied by text nodes*. So it is not possible to remove the margin with just CSS.

Instead, you could just remove the `with-icon` class, since it only creates the conditions for manual spacing by `margin`. This way, spaces will remain (and collapse automatically as described). In the [custom element implementation to come](#the-component), only if the `space` prop is supplied will the `<icon-l>` be made an `inline-flex` element, and the word space removed.

## Use cases

[#](#use-cases)

You’ve seen icons before, right? Most frequently you find them as part of button controls or links, supplementing a label with a visual cue. Too often our controls *only* use icons. This is okay for highly familiar icons/symbols like the cross icon from previous examples, but more esoteric icons should probably come with a textual description — at least in the early stages of the interface’s usage.

Where no (visible) textual label is provided, it’s important there is at least a screen reader perceptible label of some form. You can do one of the following:

1. [Visually hide](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html#hiding-content-visually) a textual label (probably supplied in a `<span>`)
2. Add a `<title>` to the `<svg>`
3. Add an `aria-label` directly to the parent `<button>` element

In the [component](#the-component), if a `label` prop is added to `<icon-l>`, the element itself is treated as an image, with `role="img"` and `aria-label="[the label value]"` applied. Encountered by screen reader *outside* of a button or link, the icon will be identified as an image or graphic, and the `aria-label` value read out. Where `<icon-l>` is placed *inside* a button or link, the image role is not announced. The pseudo-image element is simply purposed as the label.

## The generator

[#](#the-generator)

Use this tool to generate basic **Icon** CSS and HTML.

```
.icon {
  width: 0.75em;
  width: 1cap;
  height: 0.75em;
  height: 1cap;
}

.with-icon {
  display: inline-flex;
  align-items: baseline;
}

.with-icon .icon {
  margin-inline-end: 1rem;
}
```
```
<span class="with-icon">
  <svg class="icon">
    <use href="/path/to/icons.svg#my-icon"></use>
  </svg>
  Close
</span>
```

## The component

[#](#the-component)

A custom element implementation of the **Icon** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Icon** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| space | `string` | `null` | The space between the text and the icon. If null, natural word spacing is preserved |
| label | `string` | `null` | Turns the element into an image in assistive technologies and adds an aria-label of the value |

### Examples

#### Button with icon and accompanying text

In the following example, the `<icon-l>` provides an icon and accompanying text to a button. The assumes the button’s accessible name, meaning the button will be announced as *“Close, button”* (or equivalent) in screen reader software. The SVG is ignored, since it provides no textual information.

In this case, an explicit space/margin of `0.5em` has been set.

```html
<button>
  <icon-l space="0.5em">
    <svg>
      <use href="/images/icons/icons.svg#cross"></use>
    </svg>
    Close
  </icon-l>
</button>
```

#### Button with just an icon

Where not accompanying text is provided, the button is in danger of not having an accessible name. By providing a `label` prop, the `<icon-l>` is communicated as a labeled image to screen reader software (using `role="img"` and `aria-label="[the prop value]"`). This is the authored code:

```html
<button>
  <icon-l label="Close">
    <svg>
      <use href="/path/to/icons.svg#cross"></use>
    </svg>
  </icon-l>
</button>
```

And this is the code after instantiation:

```html
<button>
  <icon-l space="0.5em" label="Close" role="img" aria-label="Close">
    <svg>
      <use href="/path/to/icons.svg#cross"></use>
    </svg>
  </icon-l>
</button>
```