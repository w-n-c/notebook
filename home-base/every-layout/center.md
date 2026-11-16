---
title: "The Center: Every Layout"
source: "https://every-layout.dev/layouts/center/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Center

## The problem

[#](#the-problem)

In the early days of HTML, there were a number of presentational elements; elements devised purely to affect the appearance of their content. The [`<center>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/center) was one such element, but has long since been considered obsolete. Curiously, it *is* still supported in some browsers, including Google's Chrome. Presumably this is because Google's search homepage still uses a `<center>` to center-justify its famous search input.

Tech' giants' whimsical usage of defunct elements aside, we mostly moved away from using presentational markup in the 2000s. By making styling the responsibility of a separate technology—CSS—we were able to manage style and structure separately. Consequently, a change in art direction would no longer mean reconstituting our content.

We later discovered that styling HTML purely in terms of semantics and context was rather ambitious, and led to some unwieldy selectors like

```
body > div > div > a {
  /*   Link styles specifically for links   nested two <div>s inside the body element   */
}
```

For the sake of easier CSS maintenance and style modularity many of us adopted a compromise position using classes. Because classes can be placed on any element, we are free to style, say, a non-semantic `<div>` or a screen reader recognized `<nav>` in exactly the same way, using the same token, but without compromising on accessibility.

```html
<div class="text-align:center"></div>

<nav class="text-align:center"></nav>
```

All `<center>` did, and all `text-align: center` does, is center-justify text. And for most content—especially content that includes paragraph text—you'll want to avoid it. [It's terrible for readability](https://uxmovement.com/content/why-you-should-never-center-align-paragraph-text/).

But what *would* be useful is a component that can create a horizontally centered column. With such a component, we could create a centered 'stripe' of content within any container, capping its width to preserve a [reasonable measure](https://every-layout.dev/rudiments/units).

## The solution

[#](#the-solution)

One of the easiest ways to solve for a centered column is to use `auto` margins. The `auto` keyword, as its name suggests, instructs the browser to calculate the margin for you. It's perhaps one of the most rudimentary examples of an *algorithmic* CSS technique: one that defers to the browser's logic to determine the layout rather than 'hard coding' a specific value.

![An element with an auto left margin is pushed to the right. An element with an auto right margin is pushed to the left. An element with both an auto left and right margin is pushed to the center](https://every-layout.dev/images/illustrations/center_auto.svg)

My first centered columns would use the `margin` shorthand, often on the `<body>` element.

```
.center {
  max-width: 60ch;
  margin: 0 auto;
}
```

The trouble with the shorthand property—though it saves a few bytes—is that you have to declare certain values, even when they are not applicable. It's important to only set the CSS values needed to achieve the specific layout you are attempting. You never know what inferred or inherited values you might be undoing.

For example, I might want to place my [`<center-l>` custom element](#the-component) within a [**Stack**](https://every-layout.dev/layouts/stack) context. **Stack** sets `margin-top` on its children, and any `<center-l>` with `margin: 0 auto` would undo that.

![The Center element in a Stack context has a zero top margin and is pushed up against the element above it](https://every-layout.dev/images/illustrations/center_override.svg)

Instead, I could use the explicit `margin-left` and `margin-right` properties. Then, any vertical margins contextually applied would be preserved, and the `<center-l>` component would be primed for [composition](https://every-layout.dev/rudiments/composition) /nesting among other layout components.

```
.center {
  max-width: 60ch;
  margin-left: auto;
  margin-right: auto;
}
```

Even better, I could use a single `margin-inline` [logical property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties). As described in [**Boxes**](https://every-layout.dev/rudiments/boxes), logical properties pertain to direction and dimension mappings and are—as such—compatible with a wider range of languages. We are also using `max-inline-size` in place of `max-width`.

```
.center {
  max-inline-size: 60ch;
  margin-inline: auto;
}
```

### Minimum margin

In a context narrower than `60ch`, the contents will currently be flush with either side of the parent element or viewport. Rather than letting this happen, we should ensure a *minimum* space on either side.

I need to go about this in such a way that preserves centering, and the `60ch` maximum width. Since we can't enter `auto` into a calculation (like `calc(auto + 1rem)`), we should probably defer to padding.

![The left image is of a wide viewport where there is enough room for the margin and the padding. On the right, the viewport is smaller, meaning there is only room for padding](https://every-layout.dev/images/illustrations/center_margin_plus_padding.svg)

But I have to be wary of the box model. If, as suggested in [**Boxes**](https://every-layout.dev/rudiments/boxes), I have set all elements to adopt `box-sizing: border-box`, any padding added to my `<center-l>` will contribute to the `60ch` total. In other words, adding `padding` will make the *content* of my element narrower. However, as covered in [**Axioms**](https://every-layout.dev/rudiments/axioms) CSS is designed for *exceptions*. I just need to override `border-box` with `content-box`, and allow the padding to 'grow out' from the `60ch` content threshold.

![The left version uses border-box, so the max width includes the padding, shrinking the content. The right version corrects this by using content-box](https://every-layout.dev/images/illustrations/center_content-box.svg)

Here's a version that preserves the `60ch` `max-width`, but ensures there are, at least, `var(--s1)` “margins” on either side (`--s1` is the first point on the custom property-based [modular scale](https://every-layout.dev/rudiments/modular-scale)).

```
.center {
  box-sizing: content-box;
  max-inline-size: 60ch;
  margin-inline: auto;
  padding-inline-start: var(--s1);
  padding-inline-end: var(--s1);
}
```

### Intrinsic centering

The `auto` margin solution is time-honoured and perfectly serviceable. But there is an opportunity using the Flexbox layout module to support *intrinsic* centering. That is, centering elements based on their natural, content-based widths. Consider the following code.

```
.center {
  box-sizing: content-box;
  max-inline-size: 60ch;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

Inside a `<center-l>` component, I would expect the contents to be arranged vertically, as a column, hence `flex-direction: column`. This allows me to set `align-items: center`, which will center any children *regardless* of their width.

The upshot is any elements that are narrower than `60ch` will be automatically centered within the `60ch` -wide area. These elements can include naturally small elements like buttons, or elements with their own `max-width` set under `60ch`.

![On the left, there is no intrinsic centering, meaning the button is aligned to the left. On the right there is intrinsic centering, so the button is aligned to the center](https://every-layout.dev/images/illustrations/center_intrinsic.svg)

Image caption: The illustrated paragraphs are subject to `align-items: center`, but naturally take up all the available space (they are [block elements](https://every-layout.dev/rudiments/boxes/#the-display-property) with no set width).

## Use cases

[#](#use-cases)

Whenever you wish something to be horizontally centered, the **Center** is your friend. In the following example, I am emulating the basic layout for the **Every Layout** documentation site (which you may be looking at now, unless you’re reading the EPUB). It comprises a [**Sidebar**](https://every-layout.dev/layouts/sidebar), with a **Center** to the right-hand side. Elements are vertically separated in both the sidebar and the **Center** using [**Stacks**](https://every-layout.dev/layouts/stack). A nested **Center** with the `intrinsic` boolean applied centers the 'Launch demo' button.

(You may need to launch it in its own (desktop) window to see the centering in action.)

[Launch (opens new tab)](https://every-layout.dev/demos/center-documentation-layout)

## The Generator

[#](#the-generator)

Use this tool to generate basic **Center** CSS and HTML.

```
.center {
  box-sizing: content-box;
  margin-inline: auto;
  max-inline-size: var(--measure);
}
```
```
<div class="center">
  <!-- centered content -->
</div>
```

## The Component

[#](#the-component)

A custom element implementation of the **Center** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Center** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| max | `string` | `"var(--measure)"` | A CSS `max-width` value |
| andText | `boolean` | `false` | Center align the text too (`text-align: center`) |
| gutters | `boolean` | `0` | The minimum space on either side of the content |
| intrinsic | `boolean` | `false` | Center child elements based on their content width |

### Examples

#### Basic

You can create a single column web page just by nesting a [**Stack**](https://every-layout.dev/layouts/stack) inside a **Center** inside a [**Box**](https://every-layout.dev/layouts/box). The **Box** being padded by default means providing padding to either side of the **Center** using the `gutters` prop is not necessary.

```html
<box-l>
  <center-l>
    <stack-l>
      <!-- Any flow content here (headings, paragraphs, etc) -->
    </stack-l>
  <center-l>
</box-l>
```

#### Documentation layout

The markup from the example in [Use cases](#use-cases). In the example, WAI-ARIA landmark roles have been added for screen reader support. Note that the **Center** has been wrapped in a generic `<div>` container. This `<div>` is subject to the [**Sidebar's**](https://every-layout.dev/layouts/sidebar) layout logic, freeing the **Center** to apply its own logic inside it. The **Sidebar** wraps when this `<div>` starts to take up less that `66.666%` of the available horizontal space. Read [**Sidebar**](https://every-layout.dev/layouts/sidebar) for a full explanation.

```html
<sidebar-l contentMin="66.666%" sideWidth="10rem">
  <stack-l role="navigation">
    <!-- navigation items (API refs) -->
  </stack-l>
  <div>
    <center-l role="main">
      <!-- main content for the page -->
    </center-l>
  </div>
</sidebar-l>
```

#### Vertical and horizontal centering

Using composition and the [**Cover**](https://every-layout.dev/layouts/cover) component, it's trivial to horizontally *and* vertically center an element. The `intrinsic` boolean is used here to center the paragraph regardless of its content's width.

```html
<cover-l centered="center-l">
  <center-l intrinsic>
    <p>I am in the absolute center.</p>
  </center-l>
</cover-l>
```