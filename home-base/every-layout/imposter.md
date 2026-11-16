---
title: "The Imposter: Every Layout"
source: "https://every-layout.dev/layouts/imposter/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Imposter

## The problem

[#](#the-problem)

Positioning in CSS, using one or more instances of the `position` property’s `relative`, `absolute`, and `fixed` values, is like manually overriding web layout. It is to switch off automatic layout and take matters into your own hands. As with piloting a commercial airliner, this is not a responsibility you would wish to undertake except in rare and extreme circumstances.

In the [**Frame**](https://every-layout.dev/layouts/frame) documentation, you were warned of the perils of eschewing the browser’s standard layout algorithms:

> When you give an element `position: absolute`, you remove it from the natural flow of the document. It lays itself out as if the elements around it don’t exist. In most circumstances this is highly undesirable, and can easily lead to problems like overlapping and obscured content.

But what if you *wanted* to obscure content, by placing other content over it? If you’ve been working in web development for more than 23 minutes, it’s likely you have already done this, in the incorporation of a dialog element, “popup”, or custom dropdown menu.

The purpose of the **Imposter** element is to add a general purpose *superimposition* element to your layouts suite. It will allow the author to centrally position an element over the viewport, the document, or a selected “positioning container” element.

## The solution

[#](#the-solution)

There are many ways to centrally position elements vertically, and many more to centrally position them horizontally (some alternatives were mentioned as part of the [**Center**](https://every-layout.dev/layouts/center) layout). However, there are only a few ways to position elements centrally *over* other elements/content.

The contemporaneous approach is to [use CSS Grid](https://gedd.ski/post/overlapping-grid-items/). Once your grid is established, you can arrange content by grid line number. The concept of [flow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flow_Layout/In_Flow_and_Out_of_Flow) is made irrelevant, and overlapping is eminently achievable wherever desired.

![An element is centered in a Grid using grid-area: 2 / 2 / 5 / 8](https://every-layout.dev/images/illustrations/imposter_grid1.svg)

CSS Grid does not precipitate a general solution, because it would only work where your positioning element is set to `display: grid` ahead of time, and the column/row count is suitable. We need something more flexible.

### Positioning

You can position an element to one of three things (“ *positioning contexts* ” from here on):

1. The viewport
2. The document
3. An ancestor element

To position an element relative to the viewport, you would use `position: fixed`. To position it relative to the document, you use `position: absolute`.

Positioning it relative to an ancestor element is possible where that element (the “ *positioning container* ” from here on) is also explicitly positioned. The easiest way to do this is to give the ancestor element `position: relative`. This sets the localized positioning context *without* moving the position of the ancestor element, or taking it out of the document flow.

![The very outer box is labeled the positioning container. The the inner box is labeled the positioned element.](https://every-layout.dev/images/illustrations/imposter_positioning_container_pre.svg)

The `static` value for the `position` property is the default, so you will rarely see or use it except to reset the value.

### Centering

How do we position the **Imposter** element over the *center* of the document, viewport, or positioning container? For positioned elements, techniques like `margin: auto` or `place-items: center` do not work. In *manual override*, we have to use a combination of the `top`, `left`, `bottom`, and/or `right` properties. Importantly, the values for each of these properties relate to the positioning context—not to the immediate parent element.

![Nested boxes. The very outer box is labeled the positioning container. The box on top, overlapping the others is labeled the positioned element. Its top and left offset is set according to the positioning container element (the outer box)](https://every-layout.dev/images/illustrations/imposter_positioning_container.svg)

The `static` value for the `position` property is the default, so you will rarely see or use it.

So far, so bad: we want the element itself to be centered, not its top corner. Where we know the `width` of the element, we can compensate by using negative margins. For example, `margin-inline-start: -20rem` and `margin-block-start: -10rem` will recenter an element that is `40rem` wide and `20rem` tall (the negative value is always half the dimension).

![Arrows indicate the negative margins pulling the element left and up, to make its center the positioning container’s center](https://every-layout.dev/images/illustrations/imposter_negative_margins.svg)

We avoid hard coding dimensions because, like positioning, it dispenses with the browser’s algorithms for arranging elements according to available space. Wherever you code a fixed width on an element, the chances of that element or its contents becoming obscured on *somebody’s* device *somewhere* are close to inevitable. Not only that, but we might not know the element’s width or height ahead of time. So we wouldn’t know which negative margin values with which to complement it.

Instead of designing layout, we design *for layout*, allowing the browser to have the final say. In this case, it’s a question of using transforms. The `transform` property arranges elements according to their own dimensions, whatever they are at the given time. In short: `transform: translate(-50%, -50%)` will *translate* the element’s position by -50% of its *own* width and height respectively. We don’t need to know the element’s dimensions ahead of time, because the browser can calculate them and act on them for us.

Centering the element over its positioning container, no matter its dimensions, is therefore quite simple:

```
.imposter {
  /* ↓ Position the top left corner in the center */
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  /* ↓ Reposition so the center of the element  is the center of the positioning container */
  transform: translate(-50%, -50%);
}
```

It should be noted at this point that a block-level **Imposter** element set to `position: absolute` no longer takes up the available space along the element’s writing direction (usually horizontal; left-to-right). Instead, the element “shrink wraps” its content as if it were inline.

![A small element with the text hello world is centered within its positioning container](https://every-layout.dev/images/illustrations/imposter_shrink_wrap.svg)

By default, the element’s `width` will be 50%, or less if its content takes up less than 50% of the positioning container. If you add an explicit `width` or `height`, it will be honoured *and* the element will continue to be centered within the positioning container — the internal translation algorithm sees to that.

### Overflow

What if the positioned **Imposter** element becomes wider or taller than its positioning container? With careful design and content curation, you should be able to create the generous tolerances that prevent this from happening under most circumstances. But it may still happen.

By default, the effect will see the **Imposter** *poking out* over the edges of the positioning container — and may be in danger of obscuring content around that container. In the following illustration, an **Imposter** is taller than its positioning container.

![Of two boxes, the one on top reaches higher and lower than the one underneath, meaning it also overlaps lines of text above and below the shorter box](https://every-layout.dev/images/illustrations/imposter_overlap.svg)

Since `max-width` and `max-height` override `width` and `height` respectively, we can allow authors to set dimensions—or minimum dimensions—but still ensure the element is contained. All that’s left is to add `overflow: auto` to ensure the constricted element’s contents can be scrolled into view.

```
.imposter {
  position: absolute;
  /* ↓ equivalent to \`top\` in horizontal-tb writing mode */
  inset-block-start: 50%;
  /* ↓ equivalent to \`left\` in horizontal-tb writing mode */
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  /* ↓ equivalent to \`max-width\` in horizontal-tb writing mode */
  max-inline-size: 100%;
  /* ↓ equivalent to \`max-height\` in horizontal-tb writing mode */
  max-block-size: 100%;
}
```

### Margin

In some cases, it will be desirable to have a minimum gap (space; margin; whatever you want to call it) between the **Imposter** element and the inside edges of its positioning container. For two reasons, we can’t achieve this by adding padding to the positioning container:

1. It would inset any static content of the container, which is likely not to be a desirable visual effect
2. Absolute positioning does not respect padding: our **Imposter** element would ignore and overlap it

The answer, instead, is to adjust the `max-width` and `max-height` values. The `calc()` function is especially useful for making these kinds of adjustments.

```
.imposter {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  max-inline-size: calc(100% - 2rem);
  max-block-size: calc(100% - 2rem);
}
```

The above example would create a minimum gap of `1rem` on all sides: the `2rem` value is `1rem` removed for each end.

![The positioned (imposter) element’s top and bottom edges are 1rem away from the positioning container’s own inside edges](https://every-layout.dev/images/illustrations/imposter_calc.svg)

### Fixed positioning

Where you wish the **Imposter** to be fixed relative to the *viewport*, rather than the document or an element (read: positioning container) within the document, you should replace `position: absolute` with `position: fixed`. This is often desirable for dialogs, which should follow the user as they scroll the document, and remain in view until tended to.

In the following example, the **Imposter** element has a `--positioning` custom property with a default value of `absolute`.

```
.imposter {
  position: var(--positioning, absolute);
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  max-inline-size: calc(100% - 2rem);
  max-block-size: calc(100% - 2rem);
}
```

As described in the **Every Layout** article [Dynamic CSS Components Without JavaScript](https://every-layout.dev/blog/css-components/), you can override this default value inline, inside a `style` attribute for special cases:

```html
<div class="imposter" style="--positioning: fixed">
  <!-- imposter content -->
</div>
```

In the custom element implementation to follow (under [**The Component**](#the-component)) an equivalent mechanism takes the form of a Boolean `fixed` prop’. Adding the `fixed` attribute overrides the `absolute` positioning that is default.

## Use cases

[#](#use-cases)

Wherever content needs to be deliberately obscured, the **Imposter** pattern is your friend. It may be that the content is yet to be made available. In which case, the **Imposter** may consist of a call-to-action to unlock that content.

[Launch (opens new tab)](https://every-layout.dev/demos/imposter-over-text)

It may be that the artifacts obscured by the **Imposter** are more decorative, and do not need to be revealed in full.

When creating a dialog using an **Imposter**, be wary of the accessibility considerations that need to be included—especially those relating to keyboard focus management. [Inclusive Components](https://book.inclusive-components.design/) has a chapter on dialogs which describes these considerations in detail.

## The generator

[#](#the-generator)

Use this tool to generate basic **Imposter** CSS and HTML.

```
.imposter {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.imposter.contain {
  --margin: 0px;
  overflow: auto;
  max-inline-size: calc(100% - (var(--margin) * 2));
  max-block-size: calc(100% - (var(--margin) * 2));
}
```
```
<div style="position: relative">
  <p>Static content</p>
  <div class="imposter">
    <p>Superimposed content</p>
  </div>
</div>
```

## The component

[#](#the-component)

A custom element implementation of the **Imposter** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Imposter** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| breakout | `boolean` | `false` | Whether the element is allowed to break out of the container over which it is positioned |
| margin | `string` | `0` | The minimum space between the element and the inside edges of the positioning container over which it is placed (where `breakout` is not applied) |
| fixed | `boolean` | `false` | Whether to position the element relative to the viewport |

### Examples

#### Demo example

The code for the demo in the [**Use cases**](#use-cases) section. Note the use of `aria-hidden="true"` on the superimposed sibling content. It’s likely the superimposed content should be unavailable to screen readers, since it is unavailable (or at least mostly obscured) visually.

```html
<div style="position: relative">
  <text-l words="150" aria-hidden="true"></text-l>
  <imposter-l>
    <box-l style="background-color: var(--color-light)">
      <p class="h4"><strong>You can’t see all the content, because of this box.</strong></p>
    </box-l>
  </imposter-l>
</div>
```

#### Dialog

The **Imposter** element could take the ARIA attribute `role="dialog"` to be communicated as a dialog in screen readers. Or, more simply, you could just place a `<dialog>` inside the **Imposter**. Note that the **Imposter** takes `fixed` here, to switch from an `absolute` to `fixed` position. This means the dialog would stay centered in the viewport as the document is scrolled.

```html
<imposter-l fixed>
  <dialog aria-labelledby="message">
    <p id="message">It’s decision time, sunshine!</p>
    <button type="button">Yes</button>
    <button type="button">No</button>
  </dialog>
</imposter-l>
```