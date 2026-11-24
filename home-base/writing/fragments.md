# Home Base — writing fragments

Raw material mining for future posts. No structure, no audience, no voice yet.
Append fragments; the `writing-fragments` / `writing-shape` skills quarry this
pile later. See `AGENTS.md` → "Writing fragments".

---

A thing I keep noticing: I clear my agent sessions often, on purpose, and every
time I do, I worry the good stuff evaporates. But the fix was never "make the
agent remember" — the agent has no memory across sessions by design. The fix was
a line in AGENTS.md, a file that gets loaded every time whether the session is
fresh or not. The durable thing is the file, not the agent's head.

Leading-word candidate: *the durable thing is the file, not the session*.

---

Same shape, different problem: `.scratch/` is where all my specs, tickets, and
grilling outcomes live, and for a long time it was gitignored and lived on one
desktop with zero backup. The "issue tracker" was a single point of failure
disguised as a convention. The answer wasn't a better issue tool — it was
"issues as files, then back up the files." dspinellis/git-issue was already
pointing at this.

---

A three-cloud architecture spent one afternoon becoming two clouds and a
dormant third. Not by deleting anything — by actually reading the 2026 docs.
"What still needs Google Cloud?" turned out to be GPU training and nothing else,
so the heavy-compute fallback didn't get removed; it got put to sleep, the way a
container does, billing zero until something asks it to wake. The tool decision
was easy. The hard part was noticing that the architecture I'd been defending
was written against a previous year's limits.
---

The design system I built is a set of Astro components — every layout primitive
writes a `data-*` attribute and a virtual stylesheet answers with a token rule.
Then I dropped an interactive island into the middle of the page, and the
framework boundary ate it. Svelte can't render an Astro component. So the hero
re-expresses `Sidebar` and `Stack` in its own scoped CSS, shares the same custom
properties, and pretends the primitive layer isn't there. The tokens cross the
boundary; the components don't. A design system is only as portable as its
weakest framework seam.

---

Ticket 07 deleted ten layout wrapper components because they kept drifting from
the source of truth. Ticket 10 generated ten layout wrapper components from the
source of truth. Same code, same names, same directory — and the difference is
everything. A hand-written wrapper is a *copy* of the manifest, and copies
rot: that is how the Stack's default spacing quietly lost its CSS fallback,
declared in three places and agreeing in none. A generated wrapper is a
*projection* of the manifest, and projections can't disagree with what they're
projected from. I spent two commits learning that the question was never
"components or no components". It was "who wrote the same fact down twice".

---

I moved the library's tests into the library, and then had to stop myself from
running them from the repo root. From the root they pass. From inside the
package they fail — because a library test that reads the host site's stylesheet
resolves the path from the root and finds it, and from the package directory it
doesn't. Same tests, same code, one of them lying. The working directory isn't a
convenience; it's the thing that decides whether a dependency is real or just
invisible. A boundary you can walk across without noticing isn't a boundary.

---

I picked a "passing" border color by eye, #6F6559, and told you it cleared 3:1.
It did — against the page. The input sits on a different surface, and against
that one it was 2.91. A contrast ratio isn't a property of a color; it's a
property of a *pair*, and every color has as many pairs as it has neighbours.
The prototype's dark input border was 1.42:1 against the canvas: a field you
could only find by already knowing it was there.

---

The demo worked in Firefox because it never navigated. One document, an overlay
toggled by a class, a cloned title flying from one rectangle to another. I'd
been asking how the browser did it and the answer was that the browser wasn't
involved. A page transition you build inside a single page is a different
animal from one that survives the document being thrown away — and the whole
design argument turned out to be about which of those you can afford.

---

The recipe conversation kept circling one question: is a shared visual fact a
value or a role? A composite token answers "value": `--focus-outline` is width,
style and colour travelling under one name, and because it is written as a
reference rather than a resolved string, it follows a theme switch instead of
remembering the theme it was born in. A class answers "role": `.text-muted` says
what the text *is*, which is why it is called muted and not `sm`. The tempting
middle — a class that bundles both, `.text-caption` = size plus ink — died on a
single counter-example: one of the five caption sites wanted the size without
the ink, so the bundle was already a lie at the moment it was written.

Then the smaller one, which I keep thinking about as the shape of a rule
resisting its own metric: we wanted "no declaration appears more than once", and
the brand link — the one link on the site that never underlines, not even on
hover — broke it. The honest fixes were to invent a `.link-plain` class whose
whole job is to undo `.link`, or to admit the count was the wrong proxy for "no
component re-styles a shared recipe". A class that exists to stop another class
from applying is not a recipe; it is a lawsuit inside the cascade.

---

The font swap cost 0.038 of CLS and every millisecond of it came from a unit
nobody thinks of as a font: `ch`. The library's measures are "85 characters", so
in a layout that is font-relative, "how wide is the column" is answered by
whichever font happens to be loaded, and swapping the type re-measures the page.
The fix was to freeze 85ch into 57rem and take the font out of the geometry —
the modest, unglamorous realisation that a design system's most innocent token
was carrying the font into the layout, and that "characters" is a lovely name
for a length that is only true for one typeface at one size.

There was a companion bug with a straighter face: the preloads rendered as
`<link rel="preload" as="font" crossorigin>` with no href at all. An asset import
typed one property too deep compiles to an empty string; the build is green, the
tag is present, the network does nothing. A test now asserts three `.woff2` hrefs
in the built HTML, because "the tag exists" and "the tag points somewhere" are
the same sentence right up until they aren't.

A blend mode has a neutral point, and it is not negotiable. `multiply` is
invisible on white; `overlay` is invisible on mid-grey. One tile, therefore,
can only be honest in one of the two schemes — in the other it is either a veil
or a no-op, and no amount of tuning the alpha rescues it, because the arithmetic
is symmetric and the page is not. Cutting the difference produced the worst of
both: a cream canvas dimmed by five grey levels (a veil you can feel but not
name) and a charcoal canvas moved by half a level (grain you cannot see at all).
The measurement that ended the argument was not aesthetic. It was: *the dark
page has never shown any grain*. Once you know the number, "one sheet of paper"
turns out to be a claim about a lattice, not a file count.

Meanwhile the phone taught a smaller lesson. The composition had been
`prompt | head | stream`, and when it collapsed it stacked in that order — the
machine asked before the face had said anything. Moving the cue to the left of
the head fixed the reading order, and then the reading order fixed the DOM: the
portrait now leads in markup, because the narrow layout is the one with a
sequence a screen reader can hear. The wide stage, three columns abreast, has no
reading order to disagree with, so a single container query puts the prompt
first there and nowhere else. It is the only ordering rule in the hero, and it
sits at the primitive's own threshold — the width where the zones were already
going to stack — which is the trick that keeps two mechanisms from drifting
apart: give the second one the first one's number.

---

The repo had thirteen rules about how a file is written and none about where it
lives. That is not an oversight, it is a gradient: every rule we ever added was
a response to something that had visibly gone wrong, and a file in the wrong
folder never goes wrong. It just sits there, correct, while the idea it belongs
to gets smeared across two directories by file extension. The hero was ten files
in `components/` and a flat `lib/`, and the only thing that ever complained was
a size warning that said *this file is long*, which was true and beside the point.

The word we reached for was "slice", and it was already taken three times over:
the glossary entries for a Phase, a Feature and an Issue each carry it in their
_Avoid_ line, because past agent work had used it for all three. So the *act* got the verb (we **colocate**) and the unit
got a noun nobody had used yet (a **Region**). It is a small thing to name a
folder; it is a larger thing to find out that the vocabulary you are about to
spend is already in circulation under three other meanings.

---

We nearly put the page chrome in `src/layouts/`, because Astro's convention says
that is where a layout's furniture goes. It would have failed the commit hook. An
earlier decision had quietly annexed the directory: `layouts/` and `pages/` are
pure composition, no `<style>`, ever, and both `SiteHeader` and `SiteNav` carry
one. A framework's folder had stopped meaning what the framework said it meant,
and the only record was a guardrail and an ADR three numbers back. The lesson is
not "read the ADRs". It is that a convention you have enforced is no longer a
convention, it is a local law with a borrowed name, and the way to stay out of
its way is to leave the borrowed names alone and build your own directory beside
them.

---

The one-line rule, for the next time someone asks where a file goes: *it lives
with the only thing that uses it, and it moves out when a second thing does or
when the repo has promised to police that kind of file.* The second clause is the
one that took an argument. "Shared because we might reuse it" sounds like
foresight and is the exact mechanism that built the flat folders we were
cleaning up. The adapters in `ui/` are shared for a different reason: not
because someone predicted reuse, but because guardrails and ADRs
already hold that path in place. A prediction is free to make and impossible to
check. A guardrail is neither.
