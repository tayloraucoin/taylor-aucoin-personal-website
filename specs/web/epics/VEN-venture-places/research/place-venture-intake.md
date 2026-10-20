# Note A
**Saved at:** specs/web/epics/VEN-venture-places/research/place-venture-intake.md

## Title and question
**What must the intake ask a place-or-community venture, investor-first, that it doesn't ask today?**

## Decision served
The Frame thread writes the VEN-venture-places epic brief from this note. This note decides which questions, audiences and event fields venture-place adds, and which venture questions need new wording. It is not a brief and recommends no code.

## Method and corpus
All sites below were checked 2026-10-20.
- **Labels:** [verified] means I fetched and read the page that day. [secondary] means the content came from a search-index snippet of that page, a third-party page, or the research subagent's report.
- **Holistica:**
  - Read [verified]: home, /team, /about-us.
  - /join-us, /h-quiz, /founding-supporters, /supporter-perks and /terms-and-conditions were refused by the fetch tool, both for me and for the subagent, and none were indexed. Their content is [NOT FOUND]; that does not mean they are empty.
- **Comparables (23 including the founder's six references):**
  - **Eco-luxury hospitality:** ourhabitas.com [verified], outpost-x.com [verified], sextantio.it [secondary], Borgo Pignano (third-party coverage only) [secondary].
  - **Retreat venue hire:** mandali.org [verified], ecovillagefindhorn.uk [verified], sunflowerretreats.com [secondary], torri-superiore.org [secondary], lavitasukha.com [secondary].
  - **Ecovillages and co-living with an application step:** neos.life/village [verified], traditionaldreamfactory.com [verified], ecovillageithaca.org, dancingrabbit.org, ourecovillage.org, whitehawkecovillage.org and commonground.eco [all secondary].
  - **Co-ownership or investment pages:** wuweivillage.com/invest [verified], neos.life [verified], Findhorn community buyout [secondary].
  - **Italian restoration, borgo and albergo diffuso:** sextantio.it, borgosanvalentino.it, alberghidiffusi.it, torri-superiore.org [all secondary].
  - **Summits with registration:** ecoversity.org/nynesummit [verified], pinecone.as/summiteers, recoverydharma.org/2027summit, regenerativetravel.com/summit [all secondary].
- **Regulatory sources (used only to scope the questions):**
  - Consob deliberations and communications [verified, consob.it].
  - BCSC and BC Laws on NI 45-106 [secondary].
  - The SEC Rule 506(c) page and law-firm summaries of the 2025 no-action letter [secondary].
- **Limits:**
  - Nothing was viewed in a browser or on a phone, so mobile behaviour is [NOT FOUND].
  - Kickstarter and crowdfunding perks are excluded.

## Findings

### F1. What holisticaproperties.com tries to do, and where it breaks (checked 2026-10-20)
- **Purpose:** the site serves three audiences at once [verified]:
  - supporters, through a support button that leads to /supporter-perks;\[2\]
  - applicants, through a community-join button that leads to a Google Form (the page says it accepts applications from community members, retreat leaders, creatives and allies);\[2\]
  - investors, through an investor-deck request that leads to a second Google Form under the heading "Own a Piece of the Future".\[2\]
- **Unclear asks:** there are four separate entry points: a Community Google Form in the menu, the join form, the deck form, and Kickstarter in the menu.\[2\] None says what happens after submission, who reviews it, or when [verified for home; follow-up NOT FOUND] [judgment].
- **Securities-offer wording:**
  - /team still shows a general-shareholder path, perks for a member-and-shareholder tier, and free stays in the "co-owned property" [verified by subagent fetch].\[3\]
  - /about-us describes cooperative fractional ownership and co-investors [verified].\[1\]
  - Specific risk: shares or fractional ownership are offered to the public on an open page with no named issuer, no jurisdiction and no stated exemption [judgment]. This could be treated as:
    - an offer to the public of financial products in Italy;
    - a distribution needing a prospectus or exemption in BC;
    - general solicitation in the US.
  - [REQUIRES LICENSED ATTORNEY — Italy/EU, Canada/BC, US]
- **Return and yield wording:** an older indexed version of /about-us said: "Earning passive income via a curated blend of rentals and hosted events" [secondary]. The same snippet mentions appreciating assets [secondary].\[1\] The subagent reports prosperity-and-wealth framing on today's page [secondary]. Specific risk: income and appreciation statements tied to a property raise are return promises. [REQUIRES LICENSED ATTORNEY — Italy]
- **Minimum ticket and instrument conflict:**
  - An older /team snippet set a USD 100K minimum for "shareholder stakes" [secondary].\[3\]
  - A Substack post by the founder offers to "invest and own a room starting at $100K" [secondary].\[4\]
  - These describe different instruments: shares in a company versus title to a room. [NEEDS DECISION — BLOCKING]
- **Missing facts:**
  - Legal entity: [NOT FOUND]. Only a copyright line and a Gmail contact were found [verified by subagent].
  - Jurisdiction and disclaimer: [NOT FOUND].
  - Town, and whether the property is owned or under contract: [NOT FOUND]. The home page names only Central Italy, lists amenities as planned, and describes the setting in the future tense [verified].\[2\]
- **Imagery:**
  - Most gallery file names begin "ChatGPT Image" and others are Unsplash or Pexels stock [verified].\[2\]
  - No rendering or AI label was found [verified].
  - Specific risk: AI or stock images beside a real-property investment ask can misrepresent the asset [judgment].
- **Breaks:**
  - The Full Team button has an empty link, and Login points to "#" [verified].\[2\]
  - A leftover link points to /about-holy-eros-institute [verified],\[2\] and an unrelated event schedule page is still indexed [secondary].\[5\]
  - A cart link is present [verified].\[2\]
  - The investor block still promises a 2026 launch in Italy, with no status update as of October 2026 [verified] [judgment].\[2\]
- **Mobile:** [NOT FOUND].

### F2. Sections that comparable sites carry, and the fact each needs from the founder
- **Investor deck request:**
  - What comparables show: WuWei offers an investor brief and a discovery call [verified];\[6\] Neos puts its application next to reservation counts [verified].\[7\]
  - Facts needed: who may receive the deck, the gate before it, and who answers [judgment].
- **Co-ownership model:**
  - What comparables show:
    - WuWei names a Guatemalan Sociedad Anónima as the holding entity, a USD 25,000 minimum and a five-year hold request [verified].\[6\]
    - Neos says villagers own their house while land and common spaces are held jointly [verified].\[7\]
    - Findhorn: in November 2024, Ecovillage Findhorn CBS completed a community buyout of much of the central ecovillage area, enabled by more than £415,000 of community investment, according to ecovillagefindhorn.uk. A Moray Council Local Place Plan says the money was raised through a community bond [secondary].
  - Facts needed: issuer, instrument, owned versus usable rights, hold period, exit and governance [judgment].
- **Application:**
  - What comparables show:
    - EcoVillage Ithaca requires a membership process, including a 3–5 day visit, for stays over 30 days [secondary].\[8\]
    - Dancing Rabbit runs a visit, a letter of intent, six months' residency, then membership [secondary].\[9\]
    - O.U.R. Ecovillage charges a USD 100 non-refundable fee, and its Board decides [secondary].\[10\]
    - White Hawk charges USD 250 to apply, then USD 750 to become an associate [secondary].\[11\]
  - Facts needed: applicant types, form questions, stages, fees, reviewer, timing and data handling [judgment].
- **Amenities and phases:**
  - What comparables show:
    - WuWei separates a completed Phase 1 from a USD 2,000,000 Phase 2 released in tranches over 2026–2029 [verified].\[6\]
    - Neos shows permitting as its current stage and expects a licence in Q2 2027 [verified].\[7\]
  - Facts needed: what exists now, what is planned, phase dates and funding status [judgment].
- **Location:**
  - What comparables show: Outpost X gives drive times [verified];\[12\] Sextantio publishes its address and GPS [secondary]; Holistica gives only a region [verified].\[2\]\[13\]\[14\]
  - Facts needed: the allowed precision and the reason for it [judgment].
- **Team:**
  - What comparables show: Mandali leads with a founders' letter and teachers [verified];\[15\] Neos names co-founders who live on the land [verified].\[7\]
  - Facts needed: who holds which legal role, and whether anyone's licence permits talking about investments [judgment]. [REQUIRES LICENSED ATTORNEY — Canada/BC]
- **Events:**
  - What comparables show:
    - Mandali lists dated retreats, each with a booking link [verified].\[15\]
    - Ecoversity runs a free online summit with an opt-in [verified].\[16\]
    - Pinecone invites 40 selected participants, with tiered invoice pricing [secondary].\[17\]
    - Recovery Dharma sells virtual, in-person and hybrid tickets with a hotel group rate [secondary].\[18\]
- **FAQ:** Neos and Outpost X both carry FAQs [verified].\[7\]\[12\] The intake has an faq page tick but nothing that collects the real questions [judgment].
- **Legal notice:**
  - Sextantio's footer names its company, registered office, VAT and register numbers, and share capital [secondary].\[13\]
  - Habitas names a fiscal sponsor and EIN for its impact arm [secondary].\[19\]
  - Holistica's Terms page could not be read [NOT FOUND].

### F3. Retreat leaders are a distinct audience
- Findhorn offers facilitators a separate group path [verified].\[20\]
- Sunflower Retreats' group-hire page says it has provided facilities for yoga teachers and workshop leaders since 1999 in the 15th-century Forani Palazzo in Casperia. It offers en-suite rooms for up to 18 people (26 by special arrangement) and a 50-square-metre studio [secondary].
- Torri Superiore has a meeting room joined to a yoga room and closes January–February [secondary].\[21\]
- La Vita Sukha treats catering as a deciding question for organisers [secondary].\[22\]
- Holistica already invites retreat leaders to apply [verified],\[2\] but the venture audience list has no retreat-leader option [verified against brief].

### F4. Co-owners are not investors
- WuWei splits financial investors from resident-aligned investors, with housing access at thresholds of USD 80,000–300,000 [verified].\[6\]
- Holistica mixes co-owners, shareholders, supporters, renters and residents [verified].\[2\]\[3\]
- The intake lists investors, members and residents, but not co-owners [verified against brief].
- Specific risk: a "member" promised use rights plus a share of value may hold a financial product [judgment]. [REQUIRES LICENSED ATTORNEY — Italy/EU, Canada/BC, US]

### F5. Summit pages show what "registry" can mean
- Ecoversity's registration is a private opt-in [verified].\[16\]
- Pinecone selects participants, which works like an application [secondary].\[17\]
- Recovery Dharma sells tickets in timed windows [secondary].\[18\]
- None of these shows a public attendee list [NOT FOUND].
- Registry must therefore be defined by the founder. [NEEDS DECISION — BLOCKING]

### F6. Stale dates are common
- On 2026-10-20 Mandali still lists May 2026 retreats among those available [verified].\[15\]
- Ecoversity still shows January 2026 dates [verified].\[16\]
- Holistica still promises a 2026 launch [verified].\[2\]
- The intake should ask who keeps dates current [judgment].

## Gap table
**How to read the table:**
- "Asked today?" cites field keys from the brief. Ask-block entries are copy-slot names, because the stored sub-keys are unconfirmed.
- Every proposed question is [PROPOSED].
- Every critical call is [judgment] under the criticality rule.

| Fact needed | Asked today? | Proposed question | Which kinds see it | Critical |
|---|---|---|---|---|
| **Investor funnel** | | | | |
| Issuing legal entity, country, registration number | no (displayName is a public name) | "Exact legal name and country of the entity investors pay into, and its registration number?" | all venture | yes |
| What is sold (shares, co-op membership, unit or room title, lease, use rights, loan) | no; getWhat copy slot covers benefits only | "What does an investor receive in law? Paste counsel's description." | venture-place only | yes |
| Co-owner versus investor | no | "Is a co-owner the same as an investor here? If not, one counsel-approved line each." | venture-place only | yes |
| Minimum, tiers, target, currency | number copy slot | Keep; add "Which currency? Same minimum in every country?" | all venture | yes |
| Who may receive the deck | mechanism, visibility copy slots (partial) | "Anyone who asks, only after a call, or only after an eligibility check?" | all venture | yes |
| Gate steps before numbers are seen | mechanism copy slot (partial) | "List, in order, the steps before someone sees numbers." | all venture | yes |
| Investor eligibility and who checks | no | "Is the raise limited to a category of investor (e.g. US accredited, BC eligible or accredited, EU qualified)? Who checks, and how?" | all venture | yes |
| Jurisdictions open and excluded | no (basedIn covers the place, not the offer) | "Which countries, provinces and states may invest, and which are excluded?" | all venture | yes |
| Exemption or registration per jurisdiction | requiredWording (registration number only) | "For each jurisdiction, which exemption or registration does counsel rely on? Paste the wording." | all venture | yes |
| Counsel per jurisdiction and sign-off | representation (counsel), signOff | "Who approves investor wording in Italy/EU, Canada/BC and the US? Has each seen the exact page text?" | all venture | yes |
| Return, yield, income, appreciation figures | cantSay (partial) | "Will any return or appreciation figure appear? Default no. If yes, who prepared it, and has counsel approved it?" | all venture | yes |
| Perks or stays tied to investment level | no | "Are stays, discounts or access tied to amount invested? List exactly as counsel approved." | venture-place only | yes |
| Raise progress shown publicly | showAvailability, availabilityDetail | Add "Has counsel approved showing raise progress?" | all venture | yes |
| Track-record numbers in bios | credentials, per-person proof (partial) | "For each number in a bio (years, communities, amounts raised), paste a source or mark it remove." | all venture | yes |
| **Application funnel** | | | | |
| Who applies (residents, co-owners, retreat leaders, artists, volunteers, staff) | audiences (partial); apply copy slot | "Which kinds of people can apply, and for what?" | venture-place only | no |
| What the form asks | no | "Paste your current application questions." | venture-place only | no |
| Stages and timings | no | "What happens after someone applies, step by step, with timings?" | venture-place only | yes |
| Fees or deposits | number copy slot (partial) | "Any application fee or deposit? Refundable when?" | venture-place only | yes |
| Reviewer and decision time | no | "Who reads applications, and how soon do applicants hear back?" | venture-place only | yes |
| Sensitive personal data | supabaseSensitivity (add-on only) | "Will applications collect ID, health, finances or children's details? Where are they stored now?" | all venture | yes |
| Existing forms to keep working | tools forms, toolsDetail | Add "Which current forms must keep working until launch?" | any kind | no |
| **Property** | | | | |
| Status: owned, under contract, option, leased, under restoration, searching | stageDetail (partial) | "Radio: owned / under contract / option / leased / searching. Who holds title, and since when?" | venture-place only | yes |
| Permits and approvals | no | "Which permits are needed, granted or pending, with expected dates?" | venture-place only | yes |
| Size and capacity | no | "Land area, buildings, rooms and beds, now and per phase?" | venture-place only | yes |
| Phases with dates and funding | pieces (partial) | "Per phase: what, when, and funded, partly funded or unfunded?" | venture-place only | yes |
| Location precision | basedIn (partial) | "Show the location as region / province / town / exact address / map pin? Why?" | venture-place only | yes |
| Visits | no | "Can people visit now? Who arranges it?" | venture-place only | no |
| **Imagery** | | | | |
| Real photos of this property, with dates | place (partial) | "Which uploads are photos of this property, and when were they taken?" | venture-place only | yes |
| Renders and AI images | no | "Which images are renders or AI? Does each show this building, a concept, or a mood?" | all venture | yes |
| Render label wording | no | "Exact label for renders (synthetic example: 'Artist's impression, not the current property'), and who approves it?" | all venture | yes |
| Stock imagery | no | "Which images are stock? May they sit beside the investment ask?" | all venture | yes |
| Credits and consent | no | "Who took each photo? Have identifiable people consented?" | any kind | yes |
| **Image brief (decided box)** | | | | |
| Subjects and shot list | no (new box) | "What must photos show, and never show?" | any kind | no |
| Off-limits content | neverSay (words only) | "Any image limits: location clues, guests' faces, unrestored areas?" | any kind | yes |
| Season and readiness | no | "When can photos be taken? Is the place presentable now?" | venture-place only | no |
| Shooter and rights | no | "Who shoots (founder, photographer, drone pilot), and who owns the rights?" | any kind | no |
| **Operations later (so nothing is re-asked)** | | | | |
| Stay types | bookingWhat (add-on only) | "Which stay types (nightly, weekly, residency, long-term), from when?" | venture-place only | yes |
| Opening season | bookingCalendar (add-on only) | "Which months are you open?" | venture-place only | yes |
| Capacity | no | "Maximum guests per night and per room type?" | venture-place only | yes |
| Retreat venue hire terms | no | "Whole-site or partial hire? Group size, studio size, catering model, minimum nights?" | venture-place only | yes |
| Residencies | no | "Length, fee or stipend, and who selects?" | venture-place only | yes |
| Co-owner usage rights | no | "Do co-owners get nights or booking priority, and under what rules?" | venture-place only | yes |
| Prices and currency | bookingPayment, bookingPaymentDetail (add-on only) | "Price ranges per stay type, and currency." | venture-place only | yes |
| Cancellation | bookingPolicy (add-on only) | Ask now for venture-place | venture-place only | yes |
| Merchant account holder | tools booking/payments, toolsDetail | Add "Is the merchant account in a person's name or the entity's?" | any kind | yes |
| Accommodation registration code or tourist tax on listings | no | "Has a local adviser confirmed which registration codes or taxes listings must show?" [REQUIRES LICENSED ATTORNEY — Italy] | venture-place only | yes |
| Who updates dates after launch | no | "Who keeps dates and programmes current?" | any kind | no |
| **Event section (optional toggle)** | | | | |
| Type | no | "Summit, retreat, open day, workshop, festival, other?" | any kind via the event toggle | no |
| Format | no | "In person, online, or both?" | any kind via the event toggle | no |
| Dates and time zone | no | "Dates, or not fixed yet, and time zone?" | any kind via the event toggle | yes |
| Place | no | "Venue and town, or at the property? Confirmed?" | any kind via the event toggle | yes |
| Capacity | no | "Maximum attendees, in person and online?" | any kind via the event toggle | yes |
| Free or ticketed | no | "Free, paid, or pay-what-you-can?" | any kind via the event toggle | yes |
| Tiers | no | "Tiers, prices and inclusions (synthetic example: Day / Full / Supporter)." | any kind via the event toggle | yes |
| Speakers | notableNames (partial) | "Confirmed versus invited? May each be named yet?" | any kind via the event toggle | yes |
| Schedule | no | "Draft schedule, or to come?" | any kind via the event toggle | yes |
| Waitlist | no | "When full: waitlist, close, or add a date?" | any kind via the event toggle | no |
| Meaning of "registry" | no | "Public attendee list, private sign-up list, application list, or gift or contribution registry?" | any kind via the event toggle | yes |
| After sign-up | no | "What arrives right after sign-up: confirmation, calendar file, payment link, review?" | any kind via the event toggle | no |
| List owner and tool | no | "Who manages the sign-up list, and in which tool?" | any kind via the event toggle | no |
| Consent for other mail | no | "May sign-ups be emailed about stays or investing? Asked separately?" | any kind via the event toggle | yes |
| Refunds and transfers | no | "Refund or transfer policy?" | any kind via the event toggle | yes |
| Attendee lodging | no | "On site, or nearby lodging needed?" | any kind via the event toggle | no |
| Recording | no | "Will sessions be recorded or shared?" | any kind via the event toggle | no |
| Investing presented at the event | no | "Will any part present the investment? If so, counsel reviews invitations and slides." | any kind via the event toggle | yes |
| **Audiences missing from venture** | | | | |
| Retreat leaders | audiences (missing option) | Add "retreat leaders / facilitators" | venture-place only | no |
| Co-owners, distinct from investors | audiences (missing option) | Add "co-owners" with a help line | venture-place only | yes |
| Event attendees | audiences (missing option) | Add "event attendees" when the toggle is on | any kind via the event toggle | no |
| Short-stay guests | audiences (missing option) | Add "guests" | venture-place only | no |

### Existing venture questions that read wrong for a place [judgment]
- **stage (idea / raising / underway / operating):** a place can be operating and raising at the same time. [PROPOSED] Keep stage for the business, and add the property-status radio from the table.
- **Work step "What you're building" / work shape "pieces":** for a place, the pieces are buildings, land, phases and programmes. [PROPOSED] Venture-place copy: "The place: what stands now, what is planned, by phase."
- **Pages checklist "offering":** in securities language, an offering means a securities offering. [PROPOSED] Rename it for venture-place, and add stay, retreats or venue hire, events, and the model. [NEEDS DECISION]
- **representation:** "broker" suggests a securities dealer, while the adviser is a licensed realtor. [PROPOSED] Add "local partner in Italy" and "licensed professional (licence type)".
- **asksPortrait=false, asksVideo=false:** the comparables lead with founders and video (Mandali's banner is a video file [verified]).\[15\] [PROPOSED] Turn both on for venture-place. [NEEDS DECISION]
- **howLong not asked:** for a place, "since when" (acquisition or project start) is critical. [PROPOSED] Ask it as a property field.
- **audiences "members":** this could mean co-op members, co-owners or newsletter subscribers. [PROPOSED] Add a definition in the help text.
- **showAvailability:** showing public raise progress may itself be solicitation; route it through counsel.
- **askField:** it lacks reserve, hire the venue and register. [PROPOSED] Add these for venture-place and the event toggle.

## Regulatory note (Chancery-style)
**Scope:** how co-ownership and investment pages word an offer without making a securities claim, and what the intake must ask. Jurisdictions: Italy/EU, Canada/BC, US, as of 2026-10-20. This is not legal advice; every operative conclusion is [REQUIRES LICENSED ATTORNEY — jurisdiction].

**Italy / EU**
- Consob deliberations restate the TUF (Legislative Decree 58/1998, art. 1(1)(t)) definition: an offer to the public of financial products is any communication to persons, in any form, with enough information on the terms to let an investor decide to buy or subscribe [verified].\[23\]\[24\]
- Art. 94-bis TUF requires a prior prospectus for offers of financial products other than securities and open-ended fund units [verified].\[24\]
- Consob may suspend a suspected unlawful offer for up to 90 days as a precaution [verified].\[25\]
- Consob has examined atypical tourism and real-estate contracts to test whether buyers acquire a service or make a financial investment (Communication DEM/9057728, 19 June 2009) [verified title; reasoning secondary].\[26\]\[27\]
- A 2003 communication (DCL/DEM/3033709) flags advertising that stresses income from real estate [secondary].\[28\]
- [judgment] A public page that states an ownership instrument, a minimum and the benefits fits the "enough information to decide" pattern.
- [REQUIRES LICENSED ATTORNEY — Italy/EU] on whether Holistica's instrument is a financial product, and which prospectus or exemption route applies.

**Canada / British Columbia**
- NI 45-106 s. 2.9 permits public distributions under an offering memorandum in the prescribed form. Real-estate issuers add Schedule 1 of Form 45-106F2 [secondary].\[29\]
- BCSC Companion Policy 45-106CP s. 3.3.1 says that because OM marketing materials are incorporated by reference into the offering memorandum, the issuer must also make sure the information in those materials meets the OM standard [secondary].
- Norton Rose Fulbright's summary of the 2023 NI 45-106 amendments says real-estate issuers must give purchasers an independent appraisal if an interest in real property will be acquired from a related party, or if a value for it is disclosed in the OM [secondary].
- Buyers sign Form 45-106F4, and the issuer files Form 45-106F1 and the OM with the BCSC [secondary].\[30\]
- BCSC also lists the private issuer, family/friends/business associates, accredited investor and $150,000 exemptions [secondary].\[30\]
- [judgment] The founder, the realtor adviser and the developer are BC-based, so solicitation from BC may engage BC law. A real-estate licence is not a securities registration.
- [REQUIRES LICENSED ATTORNEY — Canada/BC]

**United States**
- Rule 506(c) allows general solicitation only if all purchasers are accredited and the issuer "takes reasonable steps to verify" that status [secondary].\[31\]\[32\]
- Rule 506(b) bars general solicitation [secondary].\[33\]
- According to Ropes & Gray, on March 12, 2025 SEC staff issued a no-action letter to Latham & Watkins. It accepts minimum investment amounts (generally $200,000 for natural persons and $1 million for legal entities), together with written investor representations, as a reasonable verification step [secondary].
- The SEC's Rule 506(c) page says a company must file a notice on Form D within 15 days after the first sale of securities in the offering [secondary].
- Gibson Dunn (2025) warns that once the general-solicitation bell is rung, it "generally cannot be 'unrung'". It adds that using Rule 506(c) could stop a fund from later relying on the Section 4(a)(2) statutory exemption [secondary].
- [judgment] An open page with share wording and a public deck form is likely general solicitation.\[34\]
- [REQUIRES LICENSED ATTORNEY — US]

**How comparables word it (observed, not a pattern to copy)**
- **WuWei:**
  - Names its vehicle and governing law, and states minimums and a hold period [verified].\[6\]
  - Also publishes a projected ten-year ROI of 91.95%, a limited-shares scarcity line, and testimonials calling the investment lucrative [verified].\[6\] These are return-promise and pressure risks.
  - Asserts, without a source, that Guatemala has no foreign-ownership restrictions [verified].\[6\]
- **Neos:** footnotes the word houses (the footnote text is [NOT IN SOURCE] as extracted)\[7\] and says community value compounds [verified].\[7\] That is appreciation language.
- **Findhorn:** frames its investment through a UK Community Benefit Society, which is outside this note's three jurisdictions [secondary].\[35\]\[36\]

**Co-ownership claims, labelled**
- Holistica's community-centred ownership model [verified]:\[2\] the instrument is [NOT FOUND].
- Holistica's cooperative fractional ownership [verified]:\[1\] whether a cooperative exists is [NOT FOUND].
- Shareholder access to the co-owned property [verified by subagent]:\[3\] the title holder is [NOT FOUND].
- Owning a room from USD 100K [secondary]:\[4\] whether that is legally possible is [REQUIRES LICENSED ATTORNEY — Italy].

**What the intake must ask to keep wording safe [PROPOSED]**
All of the following are critical (quote-or-nothing):
1. Issuer entity and country.
2. Instrument type, in counsel's words.
3. Jurisdictions open and closed.
4. Exemption or registration per jurisdiction.
5. Investor eligibility, and who verifies it.
6. Counsel per jurisdiction, and confirmation that counsel has seen the exact page text and the deck flow.
7. Whether any return, income, appreciation, scarcity or "guaranteed" wording may appear (default: none).
8. Whether minimums, tiers or raise progress may be public.
9. Required disclaimer text per jurisdiction, verbatim.
10. Whether events or newsletters will mention investing.
11. Who may speak to prospective investors, and under what licence.

## Contradictions
- **Co-founded communities:** /about-us gives seven more, while /team gives six more [verified].\[1\]\[3\]
- **Founder's years of experience:** /team now says 15+, while an older snippet says 10+ [verified; secondary].\[3\]
- **Adviser titles differ between home and /team:** Taylor Aucoin is a product-and-systems adviser on one and an operations adviser and strategist on the other. Alexis Cavanagh gains "Investor Relations" on /team [verified].\[2\]\[3\]
- **Spelling:** the Substack spells the adviser's surname Canavagh; the site spells it Cavanagh [secondary; verified].\[2\]\[4\]
- **Instrument:** shareholder stakes from USD 100K versus owning a room from USD 100K [secondary].\[3\]\[4\]
- **Findhorn capacity:** the meta description says six properties, 25 rooms and 36 beds, while the body says five properties for up to 34 people [verified].\[20\]

## Gaps
- [NOT FOUND] Content of /join-us, /h-quiz, /founding-supporters, /supporter-perks and /terms-and-conditions. These need a browser check.
- [NOT FOUND] Holistica's legal entity, governing law, disclaimer, town and title status.
- [NOT FOUND] Mobile rendering of every site.
- [NOT FOUND] What the quiz asks, and how answers are used.
- [NOT FOUND] Italian accommodation registration and tourist-tax rules for this property, and how EU Prospectus Regulation thresholds apply here.
- [NOT FOUND] The text of the March 2025 SEC letter itself; only summaries were read.

## Synthesizer's notes (separated; [judgment])
- The single highest-leverage question is "what does an investor or co-owner receive in law?" Wording, page structure and gallery choice all depend on it.
- The site has moved toward supporter framing, but share wording remains. The intake should capture the founder's intended framing and counsel's permitted framing as separate answers.
- The "registry" is the likeliest misunderstanding: a gift registry and an attendee list are entirely different builds.
- Calling renters, supporters and co-owners all "community" hides material differences. The audiences step is where to separate them.

## Open items
- [NEEDS DECISION — BLOCKING] What a Holistica investor or co-owner receives in law.
- [NEEDS DECISION — BLOCKING] Which jurisdictions the raise accepts, and who counsel is in each.
- [NEEDS DECISION — BLOCKING] What "registry" means for the 2027 summit.
- [NEEDS DECISION] Whether to turn on asksPortrait and asksVideo for venture-place.
- [NEEDS DECISION] Whether to rename "offering" for venture-place.
- [ASSUMPTION: the image-brief box appears for every kind, because it sits in the shared media step.]
- [ASSUMPTION: co-owners and investors may hold different legal positions until counsel says otherwise.]

## Sources

1. [About Holistica's Vision, Mission & Founders — Holistica](https://www.holisticaproperties.com/about-us)
2. [Holistica](https://www.holisticaproperties.com/)
3. [Team — Holistica](https://www.holisticaproperties.com/team)
4. [The Medicine of Community Living & the Future of Co-owning Property](https://phoenixamara.substack.com/p/the-medicine-of-community-living)
5. [General 1 — Holistica Properties](https://www.holisticaproperties.com/healing-eros-schedule-day-4)
6. [Invest | WuWei Village](https://wuweivillage.com/invest)
7. [Neos Village | Neos Life conscious village in Alentejo, Portugal](https://neos.life/village)
8. [Becoming a Resident](https://ecovillageithaca.org/about/living-here/)
9. [How to Become a Resident / Member](https://www.dancingrabbit.org/ecovillage-life/residency-membership/)
10. [Join O.U.R. - OUR Ecovillage](https://ourecovillage.org/join-o-u-r/)
11. [Membership](https://whitehawkecovillage.org/community/membership/)
12. [Home](https://outpost-x.com/)
13. [Albergo Diffuso Sextantio](https://www.sextantio.it/en/santostefano/abruzzo/)
14. [Le Grotte della Civita](https://www.sextantio.it/en/legrottedellacivita/matera/)
15. [Mandali](https://mandali.org/)
16. [Ecoversity's New Year, New Earth Summit | Free 3-Day Online Event](https://ecoversity.org/nynesummit)
17. [Regenerative Leadership Summit — Pinecone Leadership](https://www.pinecone.as/summiteers)
18. [2027 Recovery Dharma Summit • Recovery Dharma](https://recoverydharma.org/2027summit/)
19. [Our Habitas Rise - Our Global Impact Initiative - Our Habitas](https://www.ourhabitas.com/rise/)
20. [Ecovillage Findhorn CBS | Individual stays and Retreat Venue, Scotland](https://ecovillagefindhorn.uk/)
21. [Sustainable holidays in Liguria](https://www.torri-superiore.org/en/home/)
22. [Retreat Venue Hire in Italy: 7 Questions to Ask Before You Book](https://lavitasukha.com/retreat-venue-hire-italy-questions/)
23. [Delibera n. 23220 - AREA PUBBLICA - CONSOB](https://www.consob.it/web/area-pubblica/-/delibera-n.-23220)
24. [Delibera n. 23971 - AREA PUBBLICA - CONSOB](https://www.consob.it/web/area-pubblica/-/delibera-n-23971)
25. [Delibera n. 20242 - AREA PUBBLICA - CONSOB](https://www.consob.it/web/area-pubblica/-/delibera-n.-20242)
26. [Prospetti di offerta e/o di ammissione a negoziazione - Orientamenti CONSOB - AREA PUBBLICA - CONSOB](https://www.consob.it/web/area-pubblica/prospetti-di-offerta-orientamenti-consob)
27. [Comunicazione n. DEM/9057728 del 19-6-2009 Inviata alla \[…società X…\]](https://www.consob.it/documents/1912911/1913230/c9057728.pdf/4c13311d-056b-6fcb-6d7e-8236b9f90ea7)
28. [Comunicazione quesito n. 13038246 - AREA PUBBLICA - CONSOB](https://www.consob.it/web/area-pubblica/-/comunicazione-quesito-n.-13038246)
29. [National Instrument 45-106 Prospectus Exemptions](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/227_2009)
30. [Private & Early Stage Businesses](https://www.bcsc.bc.ca/industry/issuer-regulation/raising-capital/private-early-stage-businesses)
31. [SEC Guidance on Accredited Investor Verification](https://www.nixonpeabody.com/insights/alerts/2025/04/02/sec-guidance-on-accredited-investor-verification-in-general-solicitation-securities-offerings)
32. [SEC.gov](https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c)
33. [SEC Staff No-Action Letter on Exempt Offerings with General Solicitation Under Rule 506(c)](https://www.paulweiss.com/insights/client-memos/sec-staff-no-action-letter-on-exempt-offerings-with-general-solicitation-under-rule-506-c)
34. [Rule 506c Of Reg D](https://www.moschettilaw.com/rule-506c-of-reg-d/)
35. [Ecovillage Findhorn CBS](https://www.ecovillagefindhorn.uk/)
36. [Ecovillage Findhorn Is Alive and Radiant: A New Chapter of Community Ownership, Spirit, and Celebration - GEN Europe](https://gen-europe.org/a-new-chapter-of-community-ownership-spirit-and-celebration-in-findhorn/)
37. [Our Habitas - Luxury for the Soul - Award Winning Hotels & Resorts](https://ourhabitas.com/)
38. [A regenerative village in Portugal](https://www.traditionaldreamfactory.com/)
39. [Meeting venues in the mountains of Abruzzo| Sextantio](https://www.sextantio.it/en/santostefano/mountains-of-abruzzo/)
40. [Albergo Diffuso Borgo San Valentino: Unique Stay in Umbria](https://www.borgosanvalentino.it/en/albergo-diffuso/)
41. [Welcome to the Alberghi Diffusi Official Website](https://www.alberghidiffusi.it/?lang=en)
42. [Group Hire Venue in Italy for Yoga and Pilates Teachers — Sunflower Retreats](https://www.sunflowerretreats.com/grouphire)
43. [Advance in membership](https://www.commonground.eco/get-involved-2/advance-in-membership/)
44. [Discover Regenerative Travel — Regenerative Hotels & Travel Designers](https://regenerativetravel.com/summit)
