---
title: "The Cluster: Every Layout"
source: "https://every-layout.dev/layouts/cluster/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Cluster

## The problem

[#](#the-problem)

Sometimes [grids](https://every-layout.dev/layouts/grid) are an appropriate framework for laying out content, because you want that content to align strictly to the horizontal and vertical lines that are those row and column boundaries.

But not everything benefits from this prescribed rigidity — at least not in all circumstances. Text itself cannot adhere to the strictures of a grid, because words come in different shapes and lengths. Instead, the browser's text wrapping algorithm distributes the text to fill the available space as best it can. Left-aligned text has a 'ragged' right edge, because each line will inevitably be of a different length.

Thanks to leading (`line-height`) and word spaces (the `U+0020` character, or a SPACE keypress to you), words can be reasonably evenly spaced, despite their diversity of form. Where we am dealing with groups of *elements* of an indeterminate size/shape, we should often like them to distribute in a similarly fluid way.

One approach is to set these elements' `display` value to `inline-block`. This gives you some control over `padding` and `margin` while retaining intrinsic sizing. That is, `inline-block` elements are still sized according to the dimensions of their content.

However, like words, `inline-block` elements are still separated by space characters (where present in the source). The width of this space will be added to any `margin` you apply. This space can be removed, but only by setting `font-size: 0` on the parent, and resetting the value on the children.

```
.parent {
  font-size: 0;
}

.parent > * {
  font-size: 1rem;
}
```

This has the disadvantage that we can't use `em` on my child elements because it would be equal to `0`. Instead, we need to set the `font-size` relative to the `:root` element with the `rem` unit. Font size having to be reset in this fashion is somewhat restrictive.

Even with the space eliminated, there are still wrapping-related margin issues. If margin is applied to successive elements, the appearance is acceptable where *no* wrapping occurs. But where wrapping does occur, there are unexpected indents against the aligned side, and vertical spacing is missing entirely.

![Elements stack up with uneven and missing spaces](https://every-layout.dev/images/illustrations/cluster_bad_wrapping.svg)

A partial fix is possible by placing right and bottom margins on each element.

![No indents on the (left) aligned side are now visible](https://every-layout.dev/images/illustrations/cluster_partial_fix.svg)

However, this only solves the left-aligned case — plus doubled-up space occurs where excess margin interacts with the padding of a parent element:

![The box shows larger padding (actually a combination of padding and margin) inside its right and bottom edges](https://every-layout.dev/images/illustrations/cluster_margin_padding.svg)

## The solution

[#](#the-solution)

To create an efficient and manageable design system, we need to devise robust, *general* solutions to our layout problems.

First, we make the parent a Flexbox context. This allows us to configure the elements into clusters, without having to deal with undesirable word spaces. It also has several advantages over using floats: we do not need to provide a [clear fix](https://getbootstrap.com/docs/4.3/utilities/clearfix) for one, and vertical alignment (using `align-items`) is possible.

```
.cluster {
  display: flex;
  flex-wrap: wrap;
}
```

### Adding and obscuring margin

The only way we can currently add margins that respect wrapping behaviour, irrespective of the alignment chosen, is to add them *symmetrically*; to all sides. Unfortunately, this separates the elements from any edge with which they come into contact.

![The elements are separated from the left and bottom edges in these two example layouts](https://every-layout.dev/images/illustrations/cluster_edge_separation.svg)

Note the value of the space between a child element and a parent element's edge is always *half* that of the space between two child elements (since their margins combine together). The solution is to use a negative margin on the parent to *pull* the children to its own edges:

![Arrows show the pulling action. The margins of the children now appear outside the edges of the parent.](https://every-layout.dev/images/illustrations/cluster_negative_margins.svg)

We can make authoring space in the **Cluster** component easier by using custom properties. The `--space` variable defines the desired spacing between elements, and `calc()` adapts this value accordingly. Note that a further wrapper element is included to *insulate* adjacent content from the negative margin. We still want the component to respect white space applied by a parent [**Stack**](https://every-layout.dev/layouts/stack) component.

```
.cluster {
  --space: 1rem;
}

.cluster > * {
  display: flex;
  flex-wrap: wrap;
  /* ↓ multiply by -1 to negate the halved value */
  margin: calc(var(--space) / 2 * -1);
}

.cluster > * > * {
  /* ↓ half the value, because of the 'doubling up' */
  margin: calc(var(--space) / 2);
}
```

### The gap property

I think you’ll agree the above technique is a bit unwieldy. It can also cause the horizontal scrollbar to appear, under some circumstances. Fortunately, as of mid-2021, [all major browsers now support the `gap` property with Flexbox](https://caniuse.com/flexbox-gap). The `gap` property injects spacing *between* the child elements, doing away with the need for both negative margins and the additional wrapper element. Even the `calc()` can be retired, since the `gap` value is just that!

```
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space, 1rem);
}
```

### Graceful degradation

Despite the reassuring support picture for `gap`, we should be mindful of the layout in browsers where it isn’t supported. Problematically, `gap` may be supported for the Grid layout module (see [**Grid**](https://every-layout.dev/layouts/grid)) but not for Flexbox, so using `gap` in a `@supports` block can give a false positive.

In browsers where `gap` is only supported for the Grid module, the following would lead to no margin *or* `gap` being applied.

```
/* This won’t work */
.cluster > * {
  display: flex;
  flex-wrap: wrap;
  margin: 1rem;
}

@supports (gap: 1rem) {
  .cluster > * {
    margin: 0;
  }

  .cluster {
    gap: var(--space, 1rem);
  }  
}
```

As of today, we recommend using `gap` without feature detection, accepting that layouts will become *flush* in older browsers. We include the negative margin technique above if that’s your preference instead.

### Justification

Groups or *clusters* of elements can take any `justify-content` value, and the space/gap will be honored regardless of wrapping. Aligning the **Cluster** to the right would be a case for `justify-content: flex-end`.

In the demo to follow, a **Cluster** contains a list of linked keywords. This is placed inside a box with a `padding` value equal to that of the **Cluster’s** space.

[Launch (opens new tab)](https://every-layout.dev/demos/cluster-ctas)

## Use cases

[#](#use-cases)

**Cluster** components suit any groups of elements that differ in length and are liable to wrap. Buttons that appear together at the end of forms are ideal candidates, as well as lists of tags, keywords, or other meta information. Use the **Cluster** to align any groups of horizontally laid out elements to the left or right, or in the center.

By applying `justify-content: space-between` and `align-items: center` you can even set out your page header’s logo and navigation. This will wrap naturally, and without the need for an `@media` breakpoint:

![The logo is separated horizontally from a line of navigation links in the larger viewport. The links wrap under the logo in a narrow viewport. The margins between elements remain even](https://every-layout.dev/images/illustrations/cluster_logo_links.svg)

Image caption: The navigation list will wrap below the logo at the point there is no room for its unwrapped content (its maximum width). This means we avoid the scenario where navigation links appear both beside *and* below the logo.

Below is a demo of the aforementioned header layout, using a nested **Cluster** structure. The outer **Cluster** uses `justify-content: space-between` and `align-items: center`. The **Cluster** for the navigation links uses `justify-content: flex-start` to align its items to the left after wrapping.

[Launch (opens new tab)](https://every-layout.dev/demos/cluster-header)

## The generator

[#](#the-generator)

Use this tool to generate basic **Cluster** CSS and HTML.

```
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space, 1rem);
  justify-content: flex-start;
  align-items: center;
}
```
```
<ul class="cluster">
  <li><!-- child --></li>
  <li><!-- child --></li>
  <li><!-- etc --></li>
</ul>
```

## The component

[#](#the-component)

A custom element implementation of the **Cluster** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Cluster** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| justify | `string` | `"flex-start"` | A CSS `justify-content` value |
| align | `string` | `"flex-start"` | A CSS `align-items` value |
| space | `string` | `"var(--s1)"` | A CSS `gap` value. The minimum space between the clustered child elements. |

### Examples

#### Basic

Using the defaults.

```html
<cluster-l>
  <!-- child element here -->
  <!-- another child element -->
  <!-- etc -->
  <!-- etc -->
  <!-- etc -->
  <!-- etc -->
</cluster-l>
```

#### List

Since **Clusters** typically represent groups of similar elements, they benefit from being marked up as a list. List elements present information non-visually, to screen reader software. It’s important screen reader users are aware there *is* a list present, and how many items it contains.

Since our custom element `<cluster-l>` is not a `<ul>` (and `<li>` elements cannot exist without a `<ul>` parent) we can provide the list semantics using ARIA instead: `role="list"` and `role="listitem"`:

```html
<cluster-l role="list">
  <div role="listitem"><!-- content of first list item --></div>
  <div role="listitem"><!-- content of second list item --></div>
  <div role="listitem"><!-- etc --></div>
  <div role="listitem"><!-- etc --></div>
</cluster-l>
```