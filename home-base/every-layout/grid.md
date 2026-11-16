---
title: "The Grid: Every Layout"
source: "https://every-layout.dev/layouts/grid/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Grid

## The problem

[#](#the-problem)

Designers sometimes talk about designing *to a grid*. They put the grid—a matrix of horizontal and vertical lines—in place first, then they populate that space, making the words and pictures span the boxes those intersecting lines create.

![Different shaped areas of content fitting over different areas of a grid](https://every-layout.dev/images/illustrations/grid_positioned.svg)

A 'grid first' approach to layout is only really tenable where two things are known ahead of time:

1. The space
2. The content

For a paper-destined magazine layout, like the one described in [**Axioms**](https://every-layout.dev/rudiments/axioms), these things are attainable. For a screen and device-independent web layout containing dynamic (read: changeable) content, they fundamentally are not.

The CSS Grid module is radical because it lets you place content anywhere within a predefined grid, and as such brings *designing to a grid* to the web. But the more particular and deliberate the placement of grid content, the more manual adjustment, in the form of `@media` breakpoints, is needed to adapt the layout to different spaces. Either the grid definition itself, the position of content within it, or both will have to be changed by hand, and with additional code.

As I covered in [**The Switcher**](https://every-layout.dev/layouts/switcher), `@media` breakpoints pertain to viewport dimensions only, and not the immediate available space offered by a parent container. That means layout components defined using `@media` breakpoints are fundamentally not context independent: a huge issue for a modular design system.

It is not, even theoretically, possible to design *to a grid* in a context-independent, automatically responsive fashion. However, it's possible to create basic grid-like formations: sets of elements divided into both columns and rows.

![On the left: a grid marked out with dotted lines labeled 'a grid for content'. On the right: a grid made up of black boxes labeled 'a grid of content'](https://every-layout.dev/images/illustrations/grid_for_of.svg)

Image caption: In **Every Layout**, we design with content. Without content, a grid needn't exist; with content, a grid formation may emerge from it

Compromise is inevitable, so it's a question of finding the most archetypal yet efficient solution.

### Flexbox for grids

Using Flexbox, I can create a grid formation using `flex-basis` to determine an *ideal* width for each of the grid cells:

```
.flex-grid {
  display: flex;
  flex-wrap: wrap;
}

.flex-grid > * {
  flex: 1 1 30ch;
}
```

The `display: flex` declaration defines the Flexbox context, `flex-wrap: wrap` allows wrapping, and `flex: 1 1 30ch` says, *"the ideal width should be 30ch, but items should be allowed to grow and shrink according to the space available"*. Importantly, the number of columns is not prescribed based on a fixed grid schematic; it's determined *algorithmically* based on the `flex-basis` and the available space. The content and the context define the grid, not a human arbiter.

In [**The Switcher**](https://every-layout.dev/layouts/switcher), we identified an interaction between *wrapping* and *growth* that leads items to 'break' the grid shape under certain circumstances:

![On the left is a layout of two rows of elements. The first row has three items and the second row has just two. On the right there is a similar layout, except the final row is just one row-long item](https://every-layout.dev/images/illustrations/switcher_asymmetric.svg)

On the one hand, the layout takes up all its container's horizontal space, and there are no unsightly gaps. On the other, a generic grid formation should probably make each of its items align to both the horizontal and vertical rules.

### Grid for grids

The aptly named CSS Grid module brings us closer to a 'true' responsive grid formation in one specific sense: It's possible to make items grow, shrink, and wrap together *without* breaching the column boundaries.

![The flex version's vertical gutters are not continuous, because the columns grow to be different widths. The grid version does have equal width columns, but this results in gaps where there are too few cells to complete the grid](https://every-layout.dev/images/illustrations/grid_flex_versus.svg)

This behavior is closer to the archetypal responsive grid I have in mind, and will be the layout we pursue here. There's just one major implementation issue to quash. Consider the following code.

```
.grid {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

This is the pattern, which I first discovered in Jen Simmon's [Layout Land](https://www.youtube.com/watch?v=tFKrK4eAiUQ) video series. To break it down:

1. **`display: grid`:** sets the grid context, which makes grid cells for its children.
2. **`grid-gap`:** places a 'gutter' *between* each grid item (saving us from having to employ the negative margin technique first described in [**The Cluster**](https://every-layout.dev/layouts/cluster)).
3. **`grid-template-columns`:** Would ordinarily define a rigid grid for *designing to*, but used with `repeat` and `auto-fit` allows the dynamic spawning and wrappping of columns to create a behavior similar to the preceding Flexbox solution.
4. **`minmax`:** This function ensures each column, and therefore each cell of content shares a width between a minimum and maximum value. Since `1fr` represents one part of the available space, columns grow together to fill the container.

The shortcoming of this layout is the minimum value in `minmax()`. Unlike `flex-basis`, which allows any amount of growing or shrinking from a single 'ideal' value, `minmax()` sets a scope with hard limits.

Without a fixed minimum (`250px`, in this case) there's nothing to *trigger* the wrapping. A value of `0` would just produce one row of ever-diminishing widths. But it being a fixed minimum has a clear consequence: in any context narrower than the minimum, overflow will occur.

![Single column of boxes breaches the right hand edge of the browser viewport](https://every-layout.dev/images/illustrations/grid_overflow.svg)

To put it simply: the pattern as it stands can only safely produce layouts where the columns converge on a width that is below the estimated minimum for the container. About `250px` is reasonably safe because most handheld device viewports are no wider. But what if I want my columns to grow considerably beyond this width, where the space is available? With Flexbox and `flex-basis` that is quite possible, but with CSS Grid it is not without assistance.

## The solution

[#](#the-solution)

Each of the layouts described so far in **Every Layout** have handled sizing and wrapping with just CSS, and without `@media` queries. Sometimes it's not possible to rely on CSS alone for automatic reconfiguration. In these circumstances, turning to `@media` breakpoints is out of the question, because it undermines the modularity of the layout system. Instead, I *might* defer to JavaScript. But I should do so *judiciously*, and using progressive enhancement.

[`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) (soon to be [available in most modern browsers](https://caniuse.com/#search=ResizeObserver)) is a highly optimized API for tracking and responding to changes in element dimensions. It is the most efficient method yet for creating [container queries](https://philipwalton.com/articles/responsive-components-a-solution-to-the-container-queries-problem/) with JavaScript. I wouldn't recommend using it as a matter of course, but employed *only* for solving tricky layout issues is acceptable.

Consider the following code:

```
.grid {
  display: grid;
  grid-gap: 1rem;
}

.grid.aboveMin {
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
}
```

The `aboveMin` class presides over an overriding declaration that produces the responsive grid. `ResizeObserver` is then instructed to add and remove the `aboveMin` class depending on the container width. The minimum value of `500px` (in the above example) is *only* applied where the container itself is wider than that threshold. Here is a standalone function to activate the `ResizeObserver` on a grid element.

```js
function observeGrid(gridNode) {
  // Feature detect ResizeObserver
  if ('ResizeObserver' in window) {
    // Get the min value from data-min="[min]"
    const min = gridNode.dataset.min;
    // Create a proxy element to measure and convert
    // the \`min\` value (which might be em, rem, etc) to \`px\`
    const test = document.createElement('div');
    test.style.width = min;
    gridNode.appendChild(test);
    const minToPixels = test.offsetWidth;
    gridNode.removeChild(test);

    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Get the element's current dimensions
        const cr = entry.contentRect;
        // \`true\` if the container is wider than the minimum
        const isWide = cr.width > minToPixels;
        // toggle the class conditionally
        gridNode.classList.toggle('aboveMin', isWide);
      }
    });

    ro.observe(gridNode);
  }
}
```

If `ResizeObserver` is not supported, the fallback one-column layout is applied perpetually. This basic fallback is included here for brevity, but you could instead fallback to the serviceable-but-imperfect Flexbox solution covered in the previous section. In any case, no content is lost or obscured, and you have the ability to use larger `minmax()` minimum values for more expressive grid formations. And since we're no longer bound to absolute limits, we can begin employing [relative units](https://every-layout.dev/rudiments/units).

![On the left, a grid formation is created with minmax(250px, 1fr). On the right, the viewport is narrower that 250px, but the cells are 100% width, meaning nothing is overflowing.](https://every-layout.dev/images/illustrations/grid_solution.svg)

Here's an example initialization (code is elided for brevity):

```html
<div class="grid" data-min="250px">
  <!-- Place children here -->
</div>

<script>  const grid = document.querySelector('.grid');  observeGrid(grid);</script>
```

### The min() function

While it is worth covering `ResizeObserver` because it may serve you well in other circumstances, it is actually no longer needed to solve this particular problem. That’s because we have the [recently widely adopted](https://caniuse.com/css-math-functions) CSS `min()` function. Sorry for the wild goose chase but we can, in fact, write this layout without JavaScript after all.

As a fallback, we configure the grid into a single column. Then we use `@supports` to test for `min()` and enhance from there:

```
.grid {
  display: grid;
  grid-gap: 1rem;
}

@supports (width: min(250px, 100%)) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  }
}
```

The way `min()` works is it calculates the *shortest length* from a set of comma-separated values. That is: `min(250px, 100%)` would return `100%` where `250px` evaluates as *higher* than the evaluated `100%`. This useful little algorithm *decides for us* where the width must be capped at `100%`.

## Use cases

[#](#use-cases)

Grids are great for browsing teasers for permalinks or products. I can quickly compose a card component to house each of my teasers using a [**Box**](https://every-layout.dev/layouts/box) and a [**Stack**](https://every-layout.dev/layouts/stack).

[Launch (opens new tab)](https://every-layout.dev/demos/grid-cards)

## The generator

[#](#the-generator)

Use this tool to generate basic **Grid** CSS and HTML.

```
.grid {
  display: grid;
  grid-gap: 1rem;
}

@supports (width: min(250px, 100%)) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  }
}
```
```
<div class="grid">
  <div><!-- child element --></div>
  <div><!-- another child element --></div>
  <div><!-- etc --></div>
</div>
```

## The component

[#](#the-component)

A custom element implementation of the **Grid** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Grid** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| min | `string` | `"250px"` | A CSS length value representing x in `minmax(min(x, 100%), 1fr)` |
| space | `string` | `"var(--s1)"` | The space between grid cells |

### Examples

#### Cards

The code for the cards example from [**Use cases**](#use-cases). Note that the `min` value is a fraction of the standard *measure*. There's more on typographic measure in the [**Axioms**](https://every-layout.dev/rudiments/axioms) rudiment.

```html
<grid-l min="calc(var(--measure) / 3)">
  <box-l>
    <stack-l>
      <!-- card content -->
    </stack-l>
  </box-l>
  <box-l>
    <stack-l>
      <!-- card content -->
    </stack-l>
  </box-l>
  <box-l>
    <stack-l>
      <!-- card content -->
    </stack-l>
  </box-l>
  <box-l>
    <stack-l>
      <!-- card content -->
    </stack-l>
  </box-l>
  <!-- etc -->
</grid-l>
```