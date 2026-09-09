# Feature Parity Tracker

Tracks functional parity between the **legacy** Interactive CYOA Creator
(abandoned Vue 2 app; decompiled sources kept locally under `intcyoacreator/`,
not in this repo) and the **ICC-Neo** project in this repo.

ICC-Neo has two independent sides, tracked separately on every row:

- **viewer** — runtime in `app/components/viewer` / `app/composables/viewer`.
  Reads the **legacy (V1) format** directly for MeanDelay iCYOA compatibility.
- **editor** — authoring prototype in `app/components/editor` /
  `app/composables/project/types/v2`. Uses the **Neo (V2) format**, which is
  deliberately more expressive than V1 and still unfinalised.

## Scope

- **In scope:** functional capability parity — can a project express the same
  behaviour, and does the target honour it at runtime / on authoring.
- **Out of scope:** UI and visual-styling fidelity. Style knobs are tracked only
  at the "is this class of styling supported at all" level.
- **Standard (text-adventure) CYOA mode** — the legacy app also had a non-image
  "Standard CYOA" mode (chapters → pages → children, branching redirects). ICC-Neo
  and MeanDelay's hosted iCYOA are image-CYOA only. Tracked as one Deferred block
  at the bottom, not line by line.

## Legend

`- <capability> — viewer: [<status>] · editor: [<status>]`

| Status       | Meaning                                                            |
|--------------|-------------------------------------------------------------------|
| `[Done]`     | Fully supported.                                                  |
| `[Partial]`  | Partly supported; gap noted after the line.                       |
| `[Missing]`  | Legacy has it, this side does not.                                |
| `[Deferred]` | Intentionally left out (reason noted).                            |
| `[N/A]`      | Concept does not apply to this side / format.                     |
| `[?]`        | Not yet verified against code — confirm and retag.               |

**Progress counters:** each category header shows `viewer: done/in-scope;
editor: done/in-scope`. *In-scope* = rows for that side that are neither `[N/A]`
nor `[Deferred]`. Only `[Done]` counts toward *done* — `[Partial]`, `[Missing]`
and `[?]` do not. Recompute the affected header when you retag a row.

**Maintenance:** edit a status inline when it changes; add rows under the right
section; keep "Last reviewed" current on a sweep.

Last reviewed: 2026-09-09 (second pass, after a deep read of the legacy viewer
runtime — `imageCyoaViewer/Row.vue`, `imageCyoaViewer/Object.vue`, `stores/main.js`)

Overall: **viewer 61/107 · editor 21/108**

---

## Content model (viewer: 4/6; editor: 3/8)

- Rows — viewer: [Done] · editor: [Done]
- Choices (`objects[]`) — viewer: [Done] · editor: [Done]
- Addons under a choice (`addons[]`), each with own image + conditions — viewer: [Done] · editor: [Done]
- Nested choices / sub-choice picking — viewer: [N/A] · editor: [Missing] — not in V1; V2 "planned features" list it
- Info rows (`isInfoRow`: choices shown but not selectable) — viewer: [Done] · editor: [Missing]
- Result rows (`isResultRow`: a row that renders every currently-selected choice inline, optionally filtered by `resultGroupId`) — viewer: [Missing] · editor: [Missing] — only `isResultRow` field parsed; ICC-Neo shows selections in the Backpack instead
- Button rows (`isButtonRow`) — viewer: [Missing] · editor: [Missing] — see "Button rows" section
- Chapters (`app.chapters`) — viewer: [Deferred] · editor: [Deferred] — Standard-CYOA only, always empty in image projects
- Pages / multiple screens — viewer: [N/A] · editor: [Partial] — V2 `page` object type exists; "only one page supported" today. Not a V1 concept.

## Groups (viewer: 2/4; editor: 0/4)

- Choice group membership (`obj.groups[]`) — viewer: [Done] · editor: [Missing] — viewer uses the first group id to bucket selections in the Backpack
- Row result-group id (`row.resultGroupId`) — viewer: [Done] · editor: [Missing] — Backpack rows whose `resultGroupId` matches a group collect that group's selected choices, with per-group score subtotals
- Top-level named row groups (`groups[]` = `{id, name, elements[]}`) for jump-to-section navigation — viewer: [Missing] · editor: [Missing] — parsed into the V1 type; no navigation menu consumes it
- Group id usable as a target of "deactivate other choice" (deselect a whole group) — viewer: [Missing] · editor: [Missing]

## Backpack (viewer: 6/7; editor: 0/3)

- Backpack view (summary of selected choices, grouped) — viewer: [Done] · editor: [Missing] — `BackpackModal` / `BackpackView`; V2 only has a `BackpackRow {id}` stub
- Backpack rows authored as normal rows (`backpack[]`, same shape as `rows[]`) — viewer: [Done] · editor: [Missing]
- Per-group score subtotals in the backpack — viewer: [Done] · editor: [N/A]
- Export backpack as image (PNG via SVG/canvas) — viewer: [Done] · editor: [N/A]
- Export backpack as standalone HTML — viewer: [Done] · editor: [N/A]
- Backpack styling (`Manage Backpack Design`, `backPackWidth`) — viewer: [Partial] · editor: [Missing] — visual, mostly out of scope
- "Import selected choices from an id list" dialog (`importedChoicesIsOpen` / ActivatedViewer) — viewer: [Done] · editor: [N/A] — superseded by build codes + saved builds

## Choice selection behaviour (viewer: 6/9; editor: 1/9)

- Single-select choice — viewer: [Done] · editor: [Done]
- Non-selectable choice (`isNotSelectable`) — viewer: [Done] · editor: [Missing]
- Hidden choice (`isVisible` false) — viewer: [?] · editor: [Missing]
- Multi-select choice, point-sum backed (`isSelectableMultiple` + `multipleScoreId`) — viewer: [Done] · editor: [Partial] — V2 `MultiSelectComponent`; backing model differs
- Multi-select choice, own-counter backed (`isMultipleUseVariable` + `multipleUseVariable`) — viewer: [Partial] · editor: [Missing] — ICC-Neo treats all multi-select the same; the two legacy modes are not distinguished
- Multi-select min / max (`numMultipleTimesMinus` / `numMultipleTimesPluss`) — viewer: [Done] · editor: [Partial] — `minAmount` / `maxAmount`
- Per-row choice limit (`allowedChoices`), auto-deselecting oldest over the limit — viewer: [Done] · editor: [Partial] — field on `RowRequirements`; enforcement unverified
- Choice raises/lowers another row's limit on select (`addToAllowChoice` / `idOfAllowChoice` / `numbAddToAllowChoice`) — viewer: [Done] · editor: [Missing]
- Row auto-deselects its choices when its own requirements stop being met (`deselectChoices`) — viewer: [Missing] · editor: [Missing]

## Choice "functions" (on-select / on-deselect actions) (viewer: 1/8; editor: 0/8)

- Activate & lock other choices (`activateOtherChoice` / `activateThisChoice`, comma list) — viewer: [Done] · editor: [Missing]
- Deactivate other choices (`deactivateOtherChoice` / `deactivateThisChoice`, comma list) — viewer: [Partial] · editor: [Missing] — ICC-Neo matches choice ids only; legacy also matches `resultGroupId` and group ids
- Reset all selections on select (`cleanACtivatedOnSelect`) — viewer: [Missing] · editor: [Missing]
- Multiply a point type on select (`multiplyPointtypeIsOn` + `pointTypeToMultiply` + `multiplyWithThis`, where `multiplyWithThis` may be a constant or another point type id) — viewer: [Missing] · editor: [Missing]
- Divide a point type on select (`dividePointtypeIsOn` + `pointTypeToDivide` + `divideWithThis`) — viewer: [Missing] · editor: [Missing]
- Set a Word's replacement text on select vs deselect (`textfieldIsOn` / `idOfTheTextfieldWord` / `wordChangeSelect` / `wordChangeDeselect`) — viewer: [Missing] · editor: [Missing]
- Score-dependency cascade: re-evaluating this choice re-toggles any selected choice whose *score* condition references it ("Scores Updated On …" notice) — viewer: [Missing] · editor: [Missing]
- Object-level button (`isButtonObject`) — viewer: [Missing] · editor: [Missing]

## Button rows (viewer: 0/9; editor: 0/9)

- Button row with custom label (`isButtonRow` / `buttonText` / `buttonId`) — viewer: [Missing] · editor: [Missing]
- Toggleable vs permanent button (`buttonType`) — viewer: [Missing] · editor: [Missing]
- "Select N random choices" (`buttonRandom` / `buttonRandomNumber`) — viewer: [Missing] · editor: [Missing]
- Weighted random (`isWeightedRandom` + per-choice `randomWeight`) — viewer: [Missing] · editor: [Missing]
- Random range (`randomMin` / `randomMax`) — viewer: [Missing] · editor: [Missing]
- "Only pick from unselected choices" (`onlyUnselectedChoices`) — viewer: [Missing] · editor: [Missing]
- "Button usable only if the row has no selection" (`onlyIfNoChoices`) — viewer: [Missing] · editor: [Missing]
- Button adds a sum to a point type (`btnPointAddon` / `pointTypeRandom`) — viewer: [Missing] · editor: [Missing]
- Button bound to a variable (`row.buttonRandom` false path → push `buttonId` to activated) — viewer: [Missing] · editor: [Missing]

## Scoring & points (viewer: 8/10; editor: 5/10)

- Point types with starting sum (`pointTypes[]` / `startingSum`) — viewer: [Done] · editor: [Done] — V2 `ProjectScore.defaultValue`
- Additive scores on choices (`scores[]` / `value`) — viewer: [Done] · editor: [Done] — V2 `ObjectScore` `type: gain | cost`
- Absolute "set" score (`type: set`) — viewer: [N/A] · editor: [Done] — Neo extension; V1 is additive only
- Conditional scores (score-level `requireds`) — viewer: [Done] · editor: [Done] — V2 `activeWhen`
- Score show / hide (`showScore`) — viewer: [Done] · editor: [Done] — V2 `hidden`
- Point type shown only once an id is selected (`activatedId`) — viewer: [Done] · editor: [Partial] — approximated by `ProjectScore.activeWhen`; confirm semantics
- Multi-select scores scale with the pick count — viewer: [Done] · editor: [?]
- Per-score before/after label text (`beforeText` / `afterText`) — viewer: [Done] · editor: [Partial] — V2 has one `unit`, no per-score text
- Clamp at zero — block a selection that would push a point type below zero (`belowZeroNotAllowed`, enforced in `checkPoints`) — viewer: [Missing] · editor: [Missing]
- `+` / `-` sign prefix and its inversion (`plussOrMinusAdded` / `plussOrMinusInverted`) — viewer: [Missing] · editor: [Missing]
- Positive / negative point colours (`pointColorsIsOn` / `positiveColor` / `negativeColor`, plus `barPointPos` / `barPointNeg` on the bar) — viewer: [Deferred] · editor: [Deferred] — visual, out of scope
- Point type icon / image (`iconIsOn` / `image` / `imageOnSide` / `imageSidePlacement`) — viewer: [Deferred] · editor: [Deferred] — visual, out of scope
- Fixed point bar showing all (gated) point types — viewer: [Done] · editor: [N/A] — `ViewScoreStatus` / `RowScores`

## Requirements & conditions (viewer: 6/9; editor: 5/9)

- Require selected id, AND of up to four (`type: id`, `required: true`, `reqId`..`reqId3`) — viewer: [Done] · editor: [Done] — V2 `isSelected` / `allOf`
- Incompatible with id(s) (`type: id`, `required: false`) — viewer: [Done] · editor: [Done] — V2 `isNotSelected`
- OR group (`type: or` / `orRequired[]`) — viewer: [Done] · editor: [Done] — V2 `anyOf`
- Nested sub-conditions (`requireds` on a term) — viewer: [Done] · editor: [Done] — V2 `allOf` / `anyOf` nesting
- Points threshold (`type: points`, operators `> >= == <= <`) — viewer: [Missing] · editor: [Missing] — `buildConditions` and the V1→V2 import both fall through to "always"; V2 has no score predicate
- Point comparison of two point types (`type: pointCompare`, `reqId` vs `reqId1`) — viewer: [Missing] · editor: [Missing]
- Requirement display text (`showRequired` / `beforeText` / `afterText`, resolves ids and point names to titles) — viewer: [Done] · editor: [?]
- Transitive incompatibility resolution (deselecting A cascades to anything that needed A) — viewer: [Done] · editor: [N/A] — `clearIncompatibleChoices`; a Neo improvement over legacy's ad-hoc handling
- Split row-display condition vs choice-eligibility condition — viewer: [N/A] · editor: [Done] — Neo improvement (`RowRequirements.display` vs `.choices`); V1 has one list
- Boolean toggle variables (`variables[]` / `isTrue`, referenced as ids in conditions and set by choice functions) — viewer: [Missing] · editor: [Missing] — parsed into the V1 type, no runtime consumer

## Visibility of blocked content (viewer: 2/3; editor: 0/3)

- Blocked choice shown with a "requirement" filter (blur/dim/etc.) — viewer: [Done] · editor: [Missing]
- Blocked choice hidden entirely (`reqFilterVisibleIsOn` / per-choice `object.reqFilterVisibleIsOn`) — viewer: [Missing] · editor: [Missing]
- Blocked row hidden entirely — viewer: [Done] · editor: [?]

## Text & dynamic content (viewer: 2/5; editor: 1/7)

- Plain / rich (sanitised HTML) text in titles and bodies — viewer: [Done] · editor: [Done]
- Row body text (`titleText`) distinct from row title — viewer: [Done] · editor: [?]
- Words — replace a `#xx` token in any title/body with a phrase (`words[]` / `replaceText`) — viewer: [Missing] · editor: [Missing] — V2 "planned features" mentions dynamic content
- Words — token that is a point type id interpolates that point type's live sum into the text — viewer: [Missing] · editor: [Missing]
- Words — replacement text changed at runtime by a choice (see Choice "functions") — viewer: [Missing] · editor: [Missing]
- Project default text fills (`defaultRowText`, `defaultChoiceTitle`, `defaultBeforePoint`, …) — viewer: [N/A] · editor: [Missing] — authoring convenience; values bake into the saved file
- "Change all ids to titles" bulk authoring helper — viewer: [N/A] · editor: [Missing]

## Layout (viewer: 3/9; editor: 1/9)

- Choice image layout: image top / left / right (`obj.template` 1/2/3) — viewer: [Done] · editor: [Partial] — V2 `header.layout` string; mapping unverified
- Row layout: image top / right / left / bottom (`row.template` 1/2/3/4) — viewer: [Missing] · editor: [?] — ICC-Neo renders one row layout
- Force all choices in a row to share one template (`choicesShareTemplate`) — viewer: [Missing] · editor: [Missing]
- Responsive fallback to single-column below ~1000px — viewer: [Done] · editor: [?]
- Row flex justification (`rowJustify` left/right/center) — viewer: [Partial] · editor: [Done] — V1→V2 import carries `rowJustify`; V2 `RowLayoutProps.itemAlign`; viewer honouring unverified
- Half-width rows on wide screens (`row.width`) — viewer: [?] · editor: [?]
- Per-choice / per-row width via 60-column grid (`objectWidth`, `col-*` / `w-*` classes) — viewer: [Done] · editor: [Partial] — V2 `itemWidth` is a bare number; class mapping TBD
- Equalise choice heights within a row (`styling.objectHeight`) — viewer: [Missing] · editor: [Missing]
- Hide all choice text in a row (`textIsRemoved`) — viewer: [Missing] · editor: [Missing]

## Styling (capability level only — visual fidelity out of scope) (viewer: 11/11; editor: 2/14)

- Global project style — viewer: [Done] · editor: [Partial] — V2 redesigned into simple / advanced / CSS frameworks; not a 1:1 port of V1's ~150 properties
- Per-row / per-choice private styling (`isPrivateStyling` + inline `styling`) — viewer: [Done] · editor: [Partial] — V2 uses shared style rules referenced by id (`styles[]`)
- Reusable style rules shared by id — viewer: [N/A] · editor: [Done] — Neo improvement
- Raw CSS / Tailwind class override — viewer: [N/A] · editor: [Done] — Neo `advanced` / `css` style types
- Backgrounds (colour + image) for project / row / choice — viewer: [Done] · editor: [Partial]
- Gradient backgrounds, incl. distinct gradient when selected / blocked (`objectGradient*`) — viewer: [Done] · editor: [Missing]
- Borders, corner radius, overflow (row / choice / row-image / choice-image) — viewer: [Done] · editor: [Partial]
- Drop shadow (row / choice) — viewer: [Done] · editor: [?]
- Selected-choice and blocked-choice image filters (blur / brightness / contrast / grayscale / hue / invert / opacity / saturate / sepia + bg colour) — viewer: [Done] · editor: [Missing]
- Per-slot text font / size / colour / alignment (row/choice/addon/score × title/text) — viewer: [Done] · editor: [Partial]
- Point-bar styling — viewer: [Done] · editor: [?]
- Multi-choice control styling (`Manage Multi Choice Design`) — viewer: [Done] · editor: [Missing]
- Image object-fit / fixed container height (`objectImgObjectFillIsOn` / `objectImgObjectFillHeight`) — viewer: [Done] · editor: [?]
- Style Templates — one-click preset themes (Fall, Book, Dark, Rainbow, …) — viewer: [N/A] · editor: [Missing]

## Media (viewer: 4/7; editor: 1/8)

- Base64-embedded images — viewer: [Done] · editor: [Done] — V2 `media.images` keyed by id
- Image by URL (`imageIsUrl`) — viewer: [Done] · editor: [?]
- Image source tooltip / attribution (`imageSourceTooltip`) — viewer: [Missing] · editor: [Missing]
- Image click-through link (`imageLink`) — viewer: [Missing] · editor: [Missing]
- Addon images — viewer: [Done] · editor: [?] — viewer support added recently (`f566469`)
- Player image-upload choice (`isImageUpload` — the player attaches their own picture) — viewer: [Missing] · editor: [Missing]
- Bulk image compression tool — viewer: [N/A] · editor: [Missing]
- Symbol / alt-code palette helper — viewer: [N/A] · editor: [Missing]
- Image caching / offline use — viewer: [Done] · editor: [N/A] — Neo-only

## Import / export / persistence (viewer: 6/10; editor: 2/7)

- Load a legacy (V1) project JSON — viewer: [Done] · editor: [Done] — editor converts V1 → V2 on import
- Export project JSON — viewer: [?] · editor: [?] — editor exports V2; V1 round-trip export unconfirmed
- Export "finished" project as a zip with images split into a folder — viewer: [N/A] · editor: [Missing]
- Save / restore a build (selected choices) — viewer: [Done] · editor: [N/A] — Dexie `builds`
- Shareable build codes (`ImportCode` / `ExportCode`), incl. multi-select counts and uploaded images — viewer: [Done] · editor: [N/A]
- Build notes / annotations — viewer: [Done] · editor: [N/A] — Neo-only
- Download the whole rendered page as an image (`html2canvas`) — viewer: [Partial] · editor: [N/A] — ICC-Neo exports only the backpack as an image
- Id / name reference list (`IdSearch`) — viewer: [Partial] · editor: [Partial] — covered by viewer `SearchModal` and editor `OmniBar`
- Free-text search over choices — viewer: [Done] · editor: [?] — Neo improvement (web-worker search)
- Project stats screen — viewer: [Missing] · editor: [Missing]
- Multi-project library / project menu — viewer: [Done] · editor: [Done]

## Deferred: Standard (text-adventure) CYOA mode (deferred)

The legacy app had a second mode with its own components (`standardcyoa/`,
`type: "standard"` branches in `Row.vue`). ICC-Neo does not implement it and it is
out of scope for parity.

- Chapters → pages → nested child pages, with branching redirects — viewer: [Deferred] · editor: [Deferred]
- Standard-mode backpack that walks the page tree for active objects — viewer: [Deferred] · editor: [Deferred]

## Neo-only additions (not parity items — listed for context)

- Build notes / annotations; image cache & offline mode (viewer)
- Free-text web-worker search; transitive incompatibility resolution (viewer)
- Shared style rules; advanced / raw-CSS style frameworks (editor)
- `set`-type scores; split row display vs eligibility conditions (editor)
- Multi-page / multi-screen projects (editor, planned)
