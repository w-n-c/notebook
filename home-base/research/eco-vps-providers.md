# Eco / cheap VPS for one NixOS host — decision-grade comparison

**Status:** research input; decides nothing.
**Date:** 2026-11-26. All prices EUR/month, **excl. VAT**, smallest plan meeting 2 vCPU / 4 GB / 40 GB.
**Scope:** one VPS, NixOS via `nixos-anywhere`, managed by deploy-rs; workload = single-user PDS (sqlite + a few GB blobs), maybe a Tangled knot later.

## What this means

1. **The cheapest plan that meets spec is OVHcloud VPS‑1 at €3.81/mo** (12‑month commit; €4.49 month‑to‑month), cheaper than Hetzner's €5.99 CX23+IPv4 — and it also has a documented rescue mode and an official OpenTofu provider.
2. **Greenhost Green 4 is €31.54/mo — 5.3× Hetzner per GB RAM — and is the only candidate whose `nixos-anywhere` path is undocumented** (no rescue ISO, no custom-ISO upload, Xen PVH, no Tofu provider, no published IPv4/IPv6 terms). [S1][S2][S3][S16]
3. **The carbon arithmetic does not justify the premium.** An always‑on 4 GB/2 vCPU VPS is ~25–110 kgCO₂e/yr; offsetting that at €5–30/t costs **well under €5/yr**, while the Greenhost premium is **~€306/yr**.
4. **Location-based grid intensity beats marketing**: Greenhost sits on the Dutch grid (254 gCO₂e/kWh); OVH Gravelines is on the French grid (41), Infomaniak Switzerland (39), 1984 Iceland (28). A "100% wind" certificate on a 254 g grid is not obviously greener than a plain French DC.
5. **Real additionality is rare and specific**: Windcloud (own wind supply, waste-heat algae farm), netcup/Anexia (own hydro + PV covering ~⅔ of the *Vienna* site, explicit 60%-renewable 2025 target for AT+DE — i.e. *not* 100%), OVH (100% REF by 2025 via CPPAs *and* EACs). Everyone else = certificates.
6. **Recommendation:** minimise cost → OVH VPS‑1, then Hetzner CX23, then netcup. Minimise cost *subject to* a credible claim + working bootstrap → **OVH VPS‑1 (FR)**, then netcup, then Windcloud (if you accept hand-rolled ops). Greenhost only if funding a small Dutch independent is itself the goal.

---

## 1. Candidate table (smallest plan meeting 2 vCPU / 4 GB / 40 GB)

| Provider / plan | €/mo | vCPU / RAM / disk | Traffic | IPv4+IPv6 | Region | Contract | src |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **OVHcloud VPS‑1 (2027)** | **3.81** (12‑mo) / 4.49 monthly | 2 vCore / 4 GB / 40 GB NVMe | unlimited, 500 Mbps | yes / yes | Gravelines FR, Roubaix FR, Strasbourg FR, Limburg DE, Warsaw PL | 12‑mo or none | [S4] |
| **Hetzner CX23** | 5.49 + 0.50 IPv4 = **5.99** | 2 / 4 GB / 40 GB NVMe | 20 TB | yes / yes | NBG1, FSN1, HEL1 | hourly, no min. | [S5][S6] |
| Hetzner CAX11 (Arm) | 5.99 (incl. IPv4) | 2 / 4 GB / 40 GB NVMe | 20 TB | yes / yes | NBG1, FSN1, HEL1 | hourly | [S5][S6] |
| Hetzner CPX22 (*same RAM, no cheaper tier*) | 19.49 + 0.50 | 2 / 4 GB / 80 GB NVMe | 20 TB | yes / yes | NBG1, FSN1, HEL1 | hourly | [S6] |
| **netcup VPS 500 G12.5** | **8.26** (€9.50 incl. 19% VAT) | 2 vCore / 4 GB / 64 GB SSD | "traffic flat" | yes / yes¹ | Nuremberg DE, Vienna AT, Amsterdam NL | 12‑mo term | [S7] |
| **Infomaniak Public Cloud** (derived²) | ≈ **11.5** | 2 / 4 GB / 40 GB block | free bandwidth | +€3.00 IPv4 / yes | Geneva/Zurich CH | none, per‑hour | [S8][S9] |
| **Scaleway BASIC2‑A2C‑4G** (derived³) | ≈ **22.9** | 2 / 4 GB / 40 GB block | incl. egress | +IPv4 / yes | Paris FR, Amsterdam NL, Warsaw PL | none, per‑hour | [S10] |
| **Greenhost Green 4** | **31.54** | 2 / 4 GiB / 40 GiB SSD (Ceph, 3×) | 4 TiB | not published | Amsterdam NL (Iron Mountain) | none, per‑second | [S1] |
| **1984 Hosting VPS #3** | **34.88** | 2 / 4 GB / 80 GB NVMe | 4 TB | yes / yes | Reykjavík IS | monthly | [S11] |
| **Windcloud VPS S** | **10.00** ("ab") | 2 / 4 GB / 200 GB | n/p | n/p | Enge‑Sande DE (GreenTEC Campus) | n/p | [S12] |
| Hostsharing eG | — | no root VPS (managed shared only) | — | — | DE | — | [S13] |

¹ netcup has historically included 1 IPv4 + IPv6; **not re-verified** on today's price page — treat as unconfirmed.
² Infomaniak publishes per‑resource ICU prices, not a fixed flavour table (JS‑only pricing page). Derived from comparison.cloud unit prices (31 Oct 2026): 2 vCPU × 730 h × €0.002205 + 4 GB × 730 h × €0.000710 + 40 GB × €0.0803 + €3.00 IPv4. [S8][S9]
³ Scaleway compute €16.79/mo (list) + ~40 GB block at ~€0.08/GB + IPv4. Compute price is vendor‑published; storage/IPv4 are estimates. [S10]

**3‑year totals:** OVH €137 · Hetzner €216 · netcup €297 · Windcloud €360 · Scaleway €824 · Greenhost €1,135 · 1984 €1,255.

**Availability caveat:** every Hetzner CX/CAX plan showed *"not available"* on the cost‑optimized page during Oct–Nov 2026 checks; Hetzner's status page has listed limited instance availability since 26 June 2026. Do not plan on CX23 without a fallback. [S5][S14]

---

## 2. Cost per unit, and the "eco premium" as a number

| Provider / plan | €/mo | **€/GB RAM** | **€/vCPU** | RAM premium vs Hetzner |
| --- | --- | --- | --- | --- |
| OVH VPS‑1 (committed) | 3.81 | **0.95** | 1.91 | **0.64×** |
| OVH VPS‑1 (monthly) | 4.49 | 1.12 | 2.25 | 0.75× |
| Hetzner CX23 + IPv4 | 5.99 | **1.50** (baseline) | 3.00 | 1.00× |
| netcup VPS 500 G12.5 | 8.26 | 2.07 | 4.13 | 1.38× |
| Windcloud VPS S | 10.00 | 2.50 | 5.00 | 1.67× |
| Infomaniak (derived) | ≈11.5 | 2.88 | 5.75 | 1.92× |
| Scaleway BASIC2 (derived) | ≈22.9 | 5.73 | 11.45 | 3.82× |
| Greenhost Green 4 | 31.54 | **7.89** | 15.77 | **5.26×** |
| 1984 VPS #3 | 34.88 | 8.72 | 17.44 | 5.81× |
| Hetzner CPX22 | 19.99 | 5.00 | 10.00 | 3.33× |

Greenhost charges **€7.89 per GB of RAM** where OVH charges €0.95 — an **8.3× spread** inside the same "2 vCPU / 4 GB / 40 GB" spec.

---

## 3. Environmental claims — what is actually being sold

Claim taxonomy: **A** = additionality (own/new generation, or physical delivery), **B** = green tariff (Guarantees of Origin / RECs / EACs / PPA purchase), **C** = efficiency only (PUE, hardware lifetime), **D** = offsets.

| Provider | Claim (their words) | Type | Blunt read | src |
| --- | --- | --- | --- | --- |
| **Greenhost** | "100% Dutch wind energy"; own hardware, Ceph + Xen, colocated in Iron Mountain AMS; PUE **1.2**; 130,000 kWh/yr for the Amsterdam estate; offsets via Trees for All + equal € into Meewind | **B + C + D** | Best *reporting transparency* in the set — they publish a sustainability report and admit they don't know the impact of their non‑AMS DCs. But it is a wind purchase on a 254 gCO₂/kWh national grid; no own generation. | [S2][S15] |
| **Windcloud** | "100% physically green electricity, mostly wind"; own DC on the GreenTEC Campus; since 2024 a *direct* site grid ("Arealnetz") from renewables; waste heat feeds a micro‑algae farm | **A** | The strongest claim here: physical delivery + productive waste‑heat use. Small company, ~zero published API/ops docs. | [S12][S17] |
| **netcup / Anexia** | Own run‑of‑river hydro Kammern (600 kW) + Fressnitz (~600 kW) + Jaidhof PV (~1 MW, 1,127 MWh/yr); Kammern ≈ ⅓ of the *Vienna* DC; 2025 target = **60%** renewable DC electricity in AT+DE; ISO 14001 since 2023 | **A (partial) + B** | Honest and quantified — including the admission that it is not 100%. Nuremberg (the default VPS site) is *not* covered by the own plants. | [S18][S19] |
| **OVHcloud** | REF (renewable energy factor) **100%** in FY2025 (was 92% in 2024) via CPPAs **and** Energy Attribute Certificates; group PUE **1.24** (Gravelines 1.21, Roubaix 1.30); SBTi‑validated −73.4% scope 1+2 by 2030; HVO for generators | **B (+ some A via CPPAs) + C** | The most audited claim in the set, and it sits on the lowest‑carbon big EU grid. Still certificate‑flavoured: EACs are doing much of the work. | [S20][S21] |
| **Scaleway** | "100% renewable — Guarantee of Origin"; per‑DC PUE published (AMS1 1.38, AMS3 1.20, WAW2 1.24); per‑instance footprint calculator built on ADEME PCR; **explicitly refuses to count its PPAs** in the carbon number (ADEME location‑based) | **B + C** | Unusually honest: they publish both the certificate claim *and* the location‑based footprint that ignores it. | [S22][S23] |
| **Hetzner** | "Our data centers in Germany have been using electricity from sustainable sources since 2008"; PUE **1.10–1.16**; outside‑air cooling up to 98% of the year; average server life **8 years**, resold via Server Auction; Cost‑Optimized tier reuses older CPU generations | **B + C** | The best *efficiency* story and the most credible *circularity* story (auction extends hardware life). Zero additionality. Their own "resource‑saving reuse" line is also the reason CX is out of stock. | [S24][S5] |
| **Infomaniak** | "100% renewable energy, 200% CO₂ compensation, data centres without air conditioning, servers used up to 15 years"; Swiss hydro grid; ISO 14001/50001 | **B + C + D** | "200% compensation" is marketing arithmetic. The 15‑year server life and no‑AC design are real and checkable. Swiss grid (39 g) does more work than the certificates. | [S25] |
| **1984 Hosting** | "100% green energy" (Icelandic geothermal/hydro), Green Web Foundation listing, DDoS protection, privacy positioning | **B** | Plausible in practice (Iceland's grid *is* 100% renewable, 28 g), but the claim is a sentence, not a report. | [S11][S26] |

**Marketing to discount outright:** any "CO₂‑neutral hosting" badge with no PUE, no location, and no per‑DC number. "200% compensation" (Infomaniak). "Green energy" with no certificate type named. Conversely, **Scaleway's footprint calculator and Greenhost's report are the two artifacts that let you check the claim yourself.**

---

## 4. Toolchain compatibility (the decisive column)

`nixos-anywhere` needs: SSH + root/sudo, **x86‑64 Linux with kexec**, ≥1 GB RAM — or a provider‑installable NixOS image, or a bootable ISO you can mount. [S27][S28]

| Provider | kexec / rescue / ISO for `nixos-anywhere` | OpenTofu/Terraform provider | API / CLI | cloud‑init | src |
| --- | --- | --- | --- | --- | --- |
| **Hetzner Cloud** | **YES, best‑documented.** Hetzner Cloud *ships a NixOS ISO* you can mount; rescue system exists; `nixos-anywhere`'s own quickstart uses Hetzner Cloud as the reference target. Arm (CAX) needs a custom aarch64 kexec image. | **YES** — `hetznercloud/hcloud` **v1.70.2**, published 2026‑10‑26, ~297k downloads/wk | REST API + `hcloud` CLI | YES | [S27][S29][S30] |
| **OVHcloud** | **YES.** Documented "reboot in rescue mode" (temporary Linux + emailed root creds); `nixos-anywhere` walkthroughs exist for OVH VPS (`--flake .#ovh-vps`). | **YES** — `ovh/ovh` **v2.26.0**, published 2026‑11‑25, 1.7M downloads/wk | REST API + `ovhcli` | YES | [S31][S32][S33] |
| **netcup** | **YES.** Custom ISO upload ("Media → Images"/DVD drive) — a NixOS ISO boots fine; **rescue system** also exists as an SCP API object (`/servers/{id}/rescuesystem`). | **PARTIAL** — official `ccremer/netcup` is **404 on the registry**; current option is community `hornc-greedy/netcup` **v1.0.0 (2026‑06‑06)**, covers servers/DNS/rescue/ISO | SCP **REST API** (OpenAPI, token auth); no first‑party CLI | unknown (not documented for VPS) | [S34][S35][S36][S18] |
| **Scaleway** | **YES (with caveat).** NixOS wiki: kexec method "works well" on virtual instances; bare‑metal does not. No rescue mode documented for Instances. | **YES** — `scaleway/scaleway` **v2.93.0**, published 2026‑11‑20, 257k downloads/wk | REST API + `scw` CLI | YES | [S28][S37] |
| **Infomaniak** | **UNKNOWN.** OpenStack API, console; no rescue/ISO path documented. kexec from a stock Ubuntu image is plausible but unverified. | **YES** — `Infomaniak/infomaniak` **v1.4.1**, published 2026‑04‑16 (only ~4k downloads/wk) | OpenStack API + `openstack`/`mc` CLI | YES (OpenStack) | [S38][S39] |
| **Greenhost** | **UNKNOWN — highest risk.** VPS is **Xen PVH**; images are **Debian and Ubuntu only**; recovers via `init=/bin/bash` kernel param or by re-attaching the disk image to a second VPS. No rescue ISO, no custom‑ISO upload, no NixOS image documented. kexec inside PVH guests is *technically* supported by Xen ≥4.3 but nothing indicates Greenhost enables/permits it. | **NO** — no registry provider; only a **2019 Python client** on their GitLab | "Enable API" toggle + legacy Cosmos client; no documented tokens/OpenAPI | YES (since 2021) | [S1][S16][S2][S40] |
| **1984 Hosting** | **UNKNOWN.** KVM with root + VNC console; no rescue/ISO docs found; likely kexec‑able from Debian, unverified. | **NO** | web panel only (no documented API) | unknown | [S11] |
| **Windcloud** | **UNKNOWN.** Shop sells VPS, no docs on ISO/rescue/console. | **NO** | none documented | unknown | [S12] |

**Reading of this table:** Hetzner and OVH are the only two where "`nixos-anywhere` tomorrow" is a documented, boring operation *and* infrastructure is code‑able. netcup is one documented ISO upload away from the same, with a thin community provider. **Greenhost is the one provider where the platform question could block the whole plan** — and it is the one the owner is currently leaning toward. Ask Greenhost support, in writing, two questions: (a) *does kexec work inside a PVH guest on your platform?* (b) *can I boot a custom ISO?*

---

## 5. Cost‑of‑carbon sanity check

Assumptions: one always‑on 4 GB/2 vCPU slice ≈ **22 W** of IT draw (≈1/16 of a 350 W host) × **PUE 1.2–1.4** → ≈ **240 kWh/yr** at the wall (sensitivity 120–500 kWh/yr; Boavizta's instance‑allocation method is the reference model [S41]). Grid intensity = Ember Yearly Electricity Data 2025, lifecycle, as tabulated [S42]. Embodied hardware ≈ **15 kgCO₂e/yr** (server ≈1,200 kgCO₂e over 5 years, 1/16 share).

| Provider site | gCO₂e/kWh | Use phase kg/yr | + embodied | Offset cost @ €5/t | @ €30/t |
| --- | --- | --- | --- | --- | --- |
| Greenhost (NL) | 254 | 61 | ~76 | €0.38 | €2.28 |
| Hetzner (DE) | 334 | 80 | ~95 | €0.48 | €2.85 |
| netcup (DE) | 334 | 80 | ~95 | €0.48 | €2.85 |
| Windcloud (DE, physically wind) | ~0 | ~0 | ~15 | €0.08 | €0.45 |
| OVH (FR) | 41 | 10 | ~25 | €0.13 | €0.75 |
| Infomaniak (CH) | 39 | 9 | ~24 | €0.12 | €0.72 |
| 1984 (IS) | 28 | 7 | ~22 | €0.11 | €0.66 |

Offset price evidence: the German Environment Agency's 2026 supplier survey puts voluntary credits "mostly between **€0.50 and €55 per tonne CO₂e**"; spot weighted average ≈ €6.10/t. [S43][S44]

**The comparison that matters.** Greenhost vs Hetzner = **€25.55/mo = €306/yr**. Even if you credit Greenhost with *eliminating* all 95 kg of Hetzner's footprint, that is **€3,200 per tonne of CO₂e avoided** — 60–100× the top of the voluntary offset market and ~40× an EU ETS allowance. The same €306/yr, spent on offsets instead, would cover **3–60 tonnes** — i.e. 30–600× this VPS's entire annual footprint. **On carbon arithmetic alone, the eco premium is indefensible; it is a values/sovereignty purchase, and should be named as one.**

---

## 6. Recommendation

### (a) Minimise cost
| Rank | Option | €/mo | Why |
| --- | --- | --- | --- |
| 1 | **OVHcloud VPS‑1**, Gravelines/Roubaix | 3.81 (12‑mo) | Cheapest that meets spec *and* has rescue mode + official provider. Backup included, unlimited traffic. |
| 2 | **Hetzner CX23** | 5.99 | Best ops story (NixOS ISO, hcloud provider, cloud-init). Risk: out of stock; fall back to CPX22 at 3.3× or CAX11 (Arm, needs custom kexec image). |
| 3 | **netcup VPS 500 G12.5** | 8.26 | 64 GB disk for headroom, big traffic, ISO + rescue. 12‑month lock‑in. |

### (b) Minimise cost subject to a credible environmental claim *and* a working `nixos-anywhere` bootstrap
| Rank | Option | €/mo | Why it wins under this weighting |
| --- | --- | --- | --- |
| 1 | **OVHcloud VPS‑1 (FR)** | 3.81 | Only provider that scores on **all three**: cheapest; 100% REF with real CPPAs + PUE 1.24 + SBTi targets; and on the **French grid (41 gCO₂e/kWh)** — a *location-based* number 6× better than Greenhost's Netherlands, on top of the certificates. Documented rescue mode, `nixos-anywhere` precedent, official provider v2.26.0. |
| 2 | **netcup VPS 500 G12.5 (AT/DE)** | 8.26 | Real own generation (hydro + PV) and the least inflated claim in the set (they publish "60%", not "100%"). Bootstrap is documented (custom ISO + rescue API). Cost: community‑only Tofu provider, 12‑month term, German grid. |
| 3 | **Windcloud VPS S (DE)** | 10.00 | The most honest additionality claim available (physical wind, waste‑heat algae farm) at 1.7× Hetzner — but you are trading away IaC and possibly rescue/ISO. Verify with them before ordering. |

**Where that leaves Greenhost:** it is the best *documented* sustainability effort of the small independents, on the worst grid of the shortlist, at 5.3× the price, with the only unresolvable toolchain question. A defensible middle path: keep the money, take **OVH (FR) or netcup**, run NixOS the boring way, and spend **€50–100/yr** on high‑quality removal credits (Puro/ARR at €25–30/t) — that is 100× the VPS's footprint for a third of the Greenhost premium. Choose Greenhost only if "fund a small independent Dutch host that publishes its own report" is an explicit goal in its own right, and only after support confirms kexec or custom ISO.

---

## 7. Gaps / uncertain

- **Greenhost kexec on Xen PVH.** No documentation either way. This single fact decides whether Greenhost is viable at all with the owner's toolchain. Must be asked of support (`sales@greenhost.net`). Their documented recovery path (`init=/bin/bash`, or re-attaching the disk to a second VPS) suggests no rescue OS.
- **Greenhost IPv4/IPv6 and API.** Their VPS page lists neither; a third-party review notes "no published DDoS, IPv6, snapshot or API details". A PDS needs a stable public IPv4 and working reverse DNS. Unverified. [S16]
- **Greenhost disk/CPU specifics**: whether "2 processors" means 2 dedicated or 2 shared vCPU is not stated (Xen PVH, Xeon host CPUs).
- **netcup toolchain**: whether their VPS images support cloud-init, and whether the community Tofu provider (`hornc-greedy/netcup` v1.0.0) can *create* a server or only manage existing ones. Also IPv4 inclusion not re-verified.
- **Infomaniak pricing is derived, not published** in a machine-readable flavour table; the €11.5/mo figure could be off by ±30%, and their GBP-style "free bandwidth" excludes IPv4 which is billed (€3.00/mo).
- **Scaleway storage/IPv4 prices not captured** from their pricing page (crawl failed); the ~€22.9 total is compute + estimate.
- **Scaleway rescue mode**: docs not found for Instances (only Elastic Metal). The NixOS wiki's kexec note is the only evidence the path works.
- **Windcloud**: no published API, no docs on console/ISO/rescue, no contract term, "ab €10" is a floor price. Also unknown whether 200 GB is really included at €10 or an upsell.
- **1984 Hosting**: no API, no Tofu provider, no OS/rescue documentation; the "100% green" claim has no supporting report (though Iceland's grid makes it nearly true by default).
- **Hetzner availability** is the biggest practical risk in the cheap tier: CX/CAX were unavailable throughout Oct–Nov 2026. A "cheapest" plan you cannot order is not cheapest.
- **Carbon numbers are modelled, not measured**: 22 W IT draw and the 1/16 allocation are assumptions with roughly 2× uncertainty; provider PUEs are quoted from the providers themselves (Hetzner 1.10–1.16, Greenhost 1.2, OVH 1.24, Scaleway per‑DC table).
- **Not investigated**: Hostsharing's managed offerings (no root VPS), Alkasolar‑backed hosts specifically, French/German co‑ops (FAImaison, Hetzner's own "green" attestations beyond the certificates), and whether any of these providers will sign a DPA/rescue‑SLA that matters for a PDS's availability expectations.

---

## Sources

- [S1] Greenhost VPS plans and prices — https://greenhost.net/products/vps/
- [S2] Greenhost sustainability page (100% Dutch wind, PUE 1.2, 130,000 kWh, offsets) — https://greenhost.net/sustainability/ (linked from https://greenhost.net/products/vps/)
- [S3] Greenhost helpdesk, lost credentials / recovery methods — https://greenhost.net/helpdesk/vps/lost-credentials/
- [S4] OVHcloud VPS (2027 range: VPS‑1 from €3.81 ex. VAT/12‑mo) — https://www.ovhcloud.com/en-ie/vps/
- [S5] Hetzner Cost‑Optimized cloud plans (CX23 / CAX11, availability, IPv4 toggle) — https://www.hetzner.com/cloud/cost-optimized/
- [S6] Hetzner Cloud server price table incl. CPX22, €0.50 IPv4 (third‑party tracker, verified 10 Nov 2026) — https://cloudtally.eu/hetzner-cloud-prices
- [S7] netcup VPS range (VPS 500 G12.5: 2 vCore / 4 GB / 64 GB, €8.26 net, 12‑mo term) — https://www.netcup.com/en/server/vps
- [S8] Infomaniak Public Cloud prices (ICU billing; 1 EUR = 55.5 ICU) — https://www.infomaniak.com/en/hosting/public-cloud/prices and https://faq.infomaniak.com/2605
- [S9] Infomaniak unit prices (vCPU €0.002205/h, RAM €0.000710/GB/h, block €0.0803/GB‑mo, IPv4 €3.00/mo, 31 Oct 2026) — https://comparison.cloud/en/cloud/infomaniak
- [S10] Scaleway Virtual Instances pricing (BASIC2‑A2C‑4G €0.023/h ≈ €16.79/mo) — https://www.scaleway.com/en/pricing/virtual-instances/
- [S11] 1984 Hosting price list (VPS #3: 2 CPU / 4 GB / 80 GB, €34.88) — https://1984.hosting/product/pricelist/
- [S12] Windcloud VPS shop (VPS S: 2 vCPU / 4 GB / 200 GB, from €10 net) — https://shop.windcloud.de/store/virtual-private-server
- [S13] Hostsharing eG (co‑operative, managed shared hosting; no root VPS) — https://www.hostsharing.net/
- [S14] Hetzner instance availability status — https://status.hetzner.com/
- [S15] Greenhost infrastructure (Xen **PVH**, Ceph, own hardware) — https://greenhost.net/infrastructure/
- [S16] Third‑party spec summary for Greenhost (Debian/Ubuntu only; IPv6/API undocumented), read 15 Oct 2026 — https://benchpeer.com/providers/greenhost
- [S17] Windcloud about/DC page (own renewables, Arealnetz 2024, algae farm) — https://windcloud.de/uber-uns
- [S18] netcup blog: how much green energy Anexia generates itself (2.2 MW hydro+PV, ~⅓ of Vienna DC, 60% target) — https://www.netcup.com/en/blog/sustainability/netcup-green-power-hydropower-photovoltaics
- [S19] Anexia PV park Jaidhof (1,428 modules, ~1,127 MWh/yr) — https://anexia.com/en/stories/pv-park-renewable-energy-for-sustainable-data-center-infrastructure
- [S20] OVHcloud sustainability statement FY2025 (REF 100%, PUE 1.24, SBTi −73.4% by 2030, CPPAs + EACs) — https://corporate.ovhcloud.com/sites/default/files/2025-11/sustainability_statement.pdf
- [S21] OVHcloud per‑DC KPI sheet FY2025 (Gravelines PUE 1.21, Roubaix 1.30, REF 100%) — https://www.ovhcloud.com/sites/default/files/external_files/kpis_fy25.pdf
- [S22] Scaleway Impact Report 2025 (100% renewable via Guarantee of Origin, per‑DC PUE table, 132,881 MWh) — https://www-uploads.scaleway.com/Impact_Report2025_22ee3a8232.pdf
- [S23] Scaleway environmental footprint methodology (ADEME PCR; PPAs deliberately excluded) — https://www.scaleway.com/en/docs/environmental-footprint/concepts/environmental-footprint-calculator/
- [S24] Hetzner sustainability (renewable electricity since 2008, PUE 1.10–1.16, 8‑year server life, auction reuse) — https://www.hetzner.com/unternehmen/nachhaltigkeit/
- [S25] Infomaniak Public Cloud (100% renewable, 200% CO₂ compensation, no‑AC DCs, 15‑year servers) — https://www.infomaniak.com/en/hosting/public-cloud
- [S26] 1984 Hosting VPS ("100% green energy", Iceland) — https://1984.hosting/product/vps/
- [S27] nixos-anywhere README (kexec requirement, x86‑64 Linux, ≥1 GB RAM) — https://github.com/nix-community/nixos-anywhere/blob/main/README.md
- [S28] NixOS wiki "NixOS friendly hosters" (Hetzner Cloud NixOS ISO; netcup ISO upload; Scaleway kexec caveat; **Greenhost absent**) — https://wiki.nixos.org/wiki/NixOS_friendly_hosters
- [S29] nixos-anywhere quickstart (Hetzner Cloud as reference target) — https://nix-community.github.io/nixos-anywhere/quickstart.html
- [S30] `hetznercloud/hcloud` provider v1.70.2, published 2026‑10‑26 — https://registry.terraform.io/providers/hetznercloud/hcloud/latest
- [S31] OVHcloud rescue mode guide — https://docs.ovhcloud.com/en/guides/bare-metal-cloud/virtual-private-servers/rescue
- [S32] nixos-anywhere on an OVH VPS (`--flake .#ovh-vps` walkthrough) — https://nix-community.github.io/nixos-anywhere/quickstart.html (example flake section)
- [S33] `ovh/ovh` provider v2.26.0, published 2026‑11‑25 — https://registry.terraform.io/providers/ovh/ovh/latest
- [S34] netcup SCP REST API documentation — https://www.netcup.com/en/helpcenter/documentation/server/rest-api
- [S35] netcup SCP endpoint catalogue (rescue system, ISO, servers) — https://github.com/fbnlrz/netcup-scp/blob/main/references/endpoints.md
- [S36] `hornc-greedy/terraform-provider-netcup` v1.0.0 (2026‑06‑06), resources + API coverage — https://github.com/hornc-greedy/terraform-provider-netcup/releases
- [S37] `scaleway/scaleway` provider v2.93.0, published 2026‑11‑20 — https://registry.terraform.io/providers/scaleway/scaleway/latest
- [S38] `Infomaniak/infomaniak` provider v1.4.1, published 2026‑04‑16 — https://registry.terraform.io/providers/Infomaniak/infomaniak/latest
- [S39] Infomaniak billing/ICU FAQ (stopped instances still bill IPv4) — https://faq.infomaniak.com/2605
- [S40] Greenhost legacy Cloud API Python client (2019) — https://open.greenhost.net/greenhost/cloud-api ; Greenhost cloud-init support — https://greenhost.net/blog/2021/03/02/greenhost-vpss-now-support-cloud-init/
- [S41] Boavizta cloud‑instance allocation methodology (worked 4 vCPU/8 GB example, PUE 1.5, France 0.098 kg/kWh) — https://boavizta.github.io/e-footprint/Server/
- [S42] Ember Yearly Electricity Data 2025 grid intensities (NL 254, DE 334, FR 41, CH 39, IS 28 gCO₂e/kWh) — https://ember-energy.org/app/uploads/2025/04/Report-Global-Electricity-Review-2025.pdf ; tabulated at https://greencalculus.com/standards/ember-yearly-electricity-data/
- [S43] DEHSt (German Environment Agency), voluntary offset market survey 2026: credits "€0.50–€55 per t CO₂e" — https://www.dehst.de/SharedDocs/downloads/DE/projektmechanismen/Freiwillige-Kompensation_Marktanalyse.pdf
- [S44] Voluntary credit spot prices 2026 (weighted avg ≈ €6.10/t; ARR ≈ €26/t) — https://www.regreener.earth/blog/spot-vs-forward-vs-offtake-carbon-credit-pricing-in-2026

