---
title: "The Box: Every Layout"
source: "https://every-layout.dev/layouts/box/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Box

## The problem

[#](#the-problem)

As I established in [**Boxes**](https://every-layout.dev/rudiments/boxes), every rendered element creates a box shape. So what is the use of a **Box** layout, encapsulated as a dedicated **Box** component?

All the ensuing [layouts](https://every-layout.dev/layouts) deal in arranging boxes *together*; distributing them in some way such that they form a composite visual structure. For example, the simple [**Stack**](https://every-layout.dev/layouts/stack) layout takes a number of boxes and inserts vertical margin between them.

It is important the **Stack** is given no other purpose than to insert vertical margins. If it started to take on other responsibilities, its job description would become a nonsense, and the other layout primitives within the system wouldn't know how to behave around the **Stack**.

In other words, it's a question of [separating concerns](https://en.wikipedia.org/wiki/Separation_of_concerns). Just as in computer science, in visual design it benefits your system to give each working part a dedicated and unique responsibility. The design emerges through [composition](https://every-layout.dev/rudiments/composition).

![One box is used to create wildly different box-based compositions](https://every-layout.dev/images/illustrations/box_composition.svg)

The **Box** 's role within this layout system is to take care of any styles that can be considered intrinsic to individual elements; styles which are not dictated, inherited, or inferred from the meta-layouts to which an individual element may be subjected. But which styles are these? It feels like they could be innumerable.

Not necessarily. While some approaches to CSS give you the power (or the *pain*, depending on your perspective) to apply any and every style to an individual element, there are plenty of styles that do not need to be written in this piecemeal way. Styles like `font-family`, `color`, and `line-height` can all be *inherited* or otherwise applied globally, as set out in [**Global and local styling**](https://every-layout.dev/rudiments/global-and-local-styling). And they should, because setting these styles on a case-by-case basis is redundant.

```
:root {
  font-family: sans-serif;
}

.box {
  /* ↓ Not needed because the style is inherited */
  /* font-family: sans-serif; */
}
```

Of course, you are likely to employ more than one `font-family` in your design. But it is more efficient to apply default (or 'base') styles and later make *exceptions* than to style everything like it is a special case.

Conveniently, global styles tend to be *branding* related styles — styles that affect the aesthetics but not the *proportions* of the subject element(s). The purpose of this project is to explore the creation of a *layout system* specifically, and we are not interested in branding (or aesthetics) as such. We are building dynamic, responsive wireframes. Aesthetics can be applied on top.

![Two boxes with the same dimensions but different fonts and backgrounds](https://every-layout.dev/images/illustrations/box_branding.svg)

Image caption: Same layouts; different aesthetics

This limits the number of properties we have to choose from. To reduce this set of potential properties further, we have to ask ourselves which layout-specific properties are better handled by parent or ancestor elements of the simple **Box**.

## The solution

[#](#the-solution)

Margin is applicable to the **Box**, but only as induced by context — as I've already established. Width and height should also be inferred, either by an *extrinsic* value (such as the width calculated by `flex-basis`, `flex-grow`, and `flex-shrink` working together) or by the nature of the content held *inside* the **Box**.

Think of it like this: If you don't have anything to put in a box, you don't need a box. If you *do* have something to put in a box, the best box is one with just enough room and no more.

### Padding

Padding is different. Padding reaches *into* an element; it is introspective. Padding should be a **Box** styling option. The question is, how much control over `padding` for our **Box** is necessary? After all, CSS affords us `padding-top`, `padding-right`, `padding-bottom`, and `padding-left`, as well as the `padding` shorthand.

Remember we are building a layout system, and not an API for creating a layout system. CSS itself is already the API. The **Box** element should have padding on *all* sides, or *no sides at all*. Why? Because an element with specific (and asymmetrical) padding is not a **Box**; it's something else trying to solve a more specific problem. More often than not, this problem relates to adding spacing between elements, which is what `margin` is for. Margin extends outside the element's border.

![The left example shows how using padding to space elements creates an issue with borders coming into contact. The right example shows a correct use of margin that separates borders](https://every-layout.dev/images/illustrations/box_padding_margin.svg)

In the below example, I'm using a `padding` value corresponding to the first point on my [modular scale](https://every-layout.dev/rudiments/modular-scale). It is applied to all sides, and has the singular purpose of moving the **Box** 's content away from its edges.

```
.box {
  padding: var(--s1);
}
```

### The visible box

A **Box** is only really a **Box** if it has a box-like shape. Yes, [all elements are box-shaped](https://every-layout.dev/rudiments/boxes), but a **Box** should typically *show* you this. The most common methods use either `border` or a `background`.

Like `padding`, `border` should be applied on all sides or none at all. In cases where borders are used to *separate* elements, they should be applied contextually, via a parent, like `margin` is in the **Stack**. Otherwise, borders will come into contact and 'double up'.

![On the left: a simple box with a border. On the right: the same bordered box, but divided up by child elements, each separated by a border](https://every-layout.dev/images/illustrations/box_borders.svg)

Image caption: By applying a `border-top` value via the `* + *` selector, only borders *between* child elements appear. None come into contact with the parent **Box's** bordered perimeter.

If you've written CSS before, you've no doubt used `background-color` to create a visual box shape. Changing the `background-color` often requires you to change the `color` to ensure the content is still legible. This can be made easier by applying `color: inherit` to any elements inside that **Box**.

```
.box {
  padding: var(--s1);
}

.box * {
  color: inherit;
}
```

By forcing inheritance, you can change the `color` —along with the `background-color` —in one place: on the **Box** itself. In the following example, I am using an `.invert` class to swap the `color` and `background-color` properties. Custom properties make it possible to adjust the specific light and dark values in one place.

```
.box {
  --color-light: #eee;
  --color-dark: #222;
  color: var(--color-dark);
  background-color: var(--color-light);
  padding: var(--s1);
}

.box * {
  color: inherit;
}

.box.invert {
  /* ↓ Dark becomes light, and light becomes dark */
  color: var(--color-light);
  background-color: var(--color-dark);
}
```

In the absence of a border, a `background-color` is insufficient for describing a box shape. This is because [high contrast themes](https://docs.microsoft.com/en-us/windows/uwp/design/accessibility/high-contrast-themes) tend to eliminate backgrounds. However, by employing a transparent `outline` the box shape can be restored.

```
.box {
  --color-light: #eee;
  --color-dark: #222;
  color: var(--color-dark);
  background-color: var(--color-light);
  padding: var(--s1);
  outline: 0.125rem solid transparent;
  outline-offset: -0.125rem;
}
```

How does this work? When a high contrast theme is not running, the outline is invisible. The `outline` property also has no impact on layout (it grows out from the element to cover other elements if present). When [Windows High Contrast Mode is switched on](https://support.microsoft.com/en-gb/help/4026951/windows-10-turn-high-contrast-mode-on-or-off), it gives the outline a color and the box is drawn.

The negative `outline-offset` moves the outline *inside* the **Box** 's perimeter so it behaves like a border and no longer increases the box's overall size.

## Use cases

[#](#use-cases)

The basic, and highly prolific, use case for a **Box** is to group and demarcate some content. This content may appear as a message or 'note' among other, textual flow content, as one [card](https://inclusive-components.design/cards/) in a grid of many, or as the inner wrapper of a positioned dialog element.

![The different ways boxes can be used. In among text, as cells in a grid, and nested inside each other](https://every-layout.dev/images/illustrations/box_boxes.svg)

You can also combine just boxes to make some useful compositions. A **Box** with a 'header' element can be made from two sibling boxes, nested inside another, parent **Box**.

![A box with no a border but no padding houses two sibling boxes, each with padding. The top box has an inverted color scheme to create a black header area.](https://every-layout.dev/images/illustrations/box_nested_boxes.svg)

## The generator

[#](#the-generator)

Use this tool to generate basic **Box** CSS and HTML. It provides the ability to create basic, two-tone boxes, including light-on-dark and dark-on-light ('inverted') themes. See the [**The visible box**](#the-visible-box) section for more.

```
.box {
  padding: var(--s1);
  border: var(--border-thin) solid;
  --color-light: #fff;
  --color-dark: #000;
  color: var(--color-dark);
  background-color: var(--color-light);
}

.box * {
  color: inherit;
}

.box.invert {
  color: var(--color-light);
  background-color: var(--color-dark);
}
```
```
<div class="box">
  <-- the box's contents -->
</div>
```

## The component

[#](#the-component)

A custom element implementation of the **Box** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Box** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| padding | `string` | `"var(--s1)"` | A CSS `padding` value |
| borderWidth | `string` | `"var(--border-thin)"` | A CSS `border-width` value |
| invert | `boolean` | `false` | Whether to apply an inverted theme. Only recommended for greyscale designs. |

### Examples

#### Basic box

The **Box** comes with default padding and border. The `padding` value is set to the first point on the [modular scale](https://every-layout.dev/rudiments/modular-scale) (`var(--s1)`) and the `border-width` uses the `var(--border-thin)` variable.

```html
<box-l>
  <!-- contents of the box -->
</box-l>
```

#### A Box within a Stack

In the context of a [**Stack**](https://every-layout.dev/layouts/stack), the **Box** will have `margin-top` applied if it is preceded by a sibling element.

```html
<stack-l>
  <p>...</p>
  <blockquote>...</blockquote>
  <box-l>
    <!-- Box separated by vertical margins -->
  </box-l>
  <p>...</p>
  <div role="figure">...</div>
</stack-l>
```

#### Box with a header

An implementation of the nested **Box** example from [Use cases](#use-cases). The `invert` boolean attribute inverts the colors using `filter: invert(100%)`.

```html
<box-l padding="0">
  <box-l borderWidth="0" invert>head</box-l>
  <box-l borderWidth="0">body</box-l>
</box-l>
```