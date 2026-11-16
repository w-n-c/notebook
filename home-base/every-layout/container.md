---
title: "The Container: Every Layout"
source: "https://every-layout.dev/layouts/container/"
author:
published:
created: 2026-11-16
description: "A composable CSS layout primitive."
tags:
  - "clippings"
---
## The Container

Something we are starting to get asked a lot is this:

> Now we have container queries, is Every Layout obsolete?

As the proprietors of **Every Layout**, it’s in our interest to eke as much out of our peculiar CSS layout solution as possible. So it is with great relief when we say that [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries) (as useful as they are, and we’ll get into that shortly) absolutely do not make **Every Layout** obsolete, worm food, shark chum, or in any other way *done*.

Primarily, **Every Layout** is an exposition of the benefit of automatic, self-governing layout. The less manual intervention you have to do, the better. It’s less code and less bother. So far, manual intervention has exclusively meant *“using a width-related `@media` query”* of some sort. Here’s a trivial example that switches a Flexbox layout between one and two columns:

```
.layout {
  display: flex;
  flex-wrap: wrap;
}

.layout > * {
  flex-basis: 50%; /* two columns */
} 

@media (max-width: 360px) {
  .layout > * {
    flex-basis: 100%; /* one column */
  }
}
```

Media queries are especially problematic because they pertain to the width of the viewport, not the space actually available to the element/component/layout in question. Media queries are only pertinent when your overarching page layout is not subject to change.

![The viewport width is marked as known but an element's width inside it is marked as unknown](https://every-layout.dev/images/illustrations/container-media_query.svg)

As the name suggests, container queries pertain to a containing element. It is this containing element we measure, not the viewport, and it yields values much more useful for layout purposes.

```
.layout {
  display: flex;
  flex-wrap: wrap;
  container-type: inline-size;
}

.layout > * {
  flex-basis: 50%; /* two columns */
}

@container (width < 360px) {
  .layout > * {
    flex-basis: 100%; /* one column */
  }
}
```

![The viewport and all the elements inside it have widths marked as known](https://every-layout.dev/images/illustrations/container-container_query.svg)

Both `@media` and `@container` queries are forms of manual intervention. They are circuit breakers we wire into layouts we know are going to error. And while I’m grateful for the existence of circuit breakers (otherwise my house might have repeatedly caught on fire) I’d sooner not have them anywhere I know they’re not needed.

What if we took this approach instead?

```
.layout {
  display: flex;
  flex-wrap: wrap;
}

.layout > * {
  flex-basis: 180px; /* half of 360px */
  flex-grow: 1;
}
```

It’s less code. It’s more backwards compatible code. But more importantly, it’s code that revolves around the subject elements, not the viewport or a container they may or may not belong to. It’s an *intrinsically* sound layout.

![The viewport and element widths are marked as unneeded](https://every-layout.dev/images/illustrations/container-unneeded.svg)

**Every Layout’s** [Sidebar](https://every-layout.dev/layouts/sidebar) is a layout that intrinsically switches between 1 and 2-column states. And it bases where to switch on the comparative widths of the two elements (sidebar and non-sidebar). Increasing the sidebar width reveals the elegance of this approach: the position of the switch automatically moves.

![Shows how the breakpoint moves to the right when the sidebar increases in size](https://every-layout.dev/images/illustrations/container-sidebar.svg)

This is not something container queries are capable of because they only know the container’s state, not the state(s) of the elements inside it. Were you to increase the sidebar width, you would have to manually adjust the container breakpoint or create a complex set of new rules:

```
.with-sidebar {
  container-type: inline-size;
}

@container (width < 640px) {
  .with-sidebar:has(.sidebar--large) > * {
    flex-basis: 100%;
  }
}

@container (width < 360px) {
  .with-sidebar:has(.sidebar--small) > * {
    flex-basis: 100%;
  }
}
```

## The problem

[#](#the-problem)

So what layout problem (or problems) do container queries solve? The simple answer is: *any for which an intrinsically sound layout cannot be easily devised*. And while we are confident the layout generics we provide here—especially when used in [composition](https://every-layout.dev/rudiments/composition) —will solve the majority of your layout challenges, it doesn’t hurt to have an escape hatch.

The **Container** layout is not a layout as such. It’s more our way of saying *“now draw the rest of the damn owl”*. Except, in this case, most of the owl is already done.

![The CSS owl selector followed by a whole ASCII owl picture](https://every-layout.dev/images/illustrations/container-owl.svg)

## The solution

[#](#the-solution)

In terms of establishing containers, there are two main things to be aware of:

1. Containers can be named or unnamed
2. Containers can be nested

### Unnamed containers

The simplest way to set up a container is using the `container-type` property. For adapting **Every Layout** -like layouts, the `type` would invariably be `inline-size`.

```
.container {
  container-type: inline-size;
}
```

When nesting containers, any query will correspond, by default, to the closest ancestral container:

```html
<div class="container">
  <div class="container">
    <div class="container">
      <div class="container"> <!-- the corresponding container -->
        <!-- querying from an element here -->
      </div>
    </div>
  </div>
</div>
```

### Named containers

You can name a container using the following shorthand syntax, which combines the name with the type:

```
.container {
  container: myContainer / inline-size;
}
```

Now you can query any container, *at any ancestral level*, by referencing its name:

```
.layout {
  container: myContainer / inline-size;
}

@container myContainer (width < 360px) {
  .layout > * {
    /* fill your boots */
  }
}
```

## Use cases

[#](#use-cases)

You can use container queries to affect *any* styles contingent on container dimensions. Container queries are just hooks, you have all of CSS at your disposal.

So the question becomes: which CSS properties are *relevant* to changing container dimensions? The size and wrapping behavior of your typography could certainly be applicable, for example, and there are [container units (video introduction)](https://www.youtube.com/watch?v=ZSaAHb5dRwQ) to help with that.

On the other hand, you probably *don’t* want to change the `color` or `font-family`. What would be the use in that? It’s not relevant to layout.

Tutorials explaining CSS selectors always seem to use a change in `color` to demonstrate the selector being applied but it’s usually the last thing you want to change—especially between the typically unimaginative `green`, `blue`, and `red` …

## The generator

[#](#the-generator)

Use this tool to generate basic **Container** CSS and HTML.

```
.container {
  container-name: myContainer;
  container-type: inline-size;
}
```
```
<div class="container"></div>
```

## The component

[#](#the-component)

A custom element implementation of the **Container** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Container** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | The name of the container, used as the CSS `container-name` value (optional) |

### Examples

#### Unnamed container

```html
<container-l></container-l>
```

#### Named container

```html
<container-l name="myContainer"></container-l>
```