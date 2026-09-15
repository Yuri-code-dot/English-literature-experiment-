# English Literature Experiment

An experimental second interface for the English Literature Library. The production library is left untouched while this repo tests a more editorial, physical-book approach.

## Current build

- 33 real catalogue works from the library data model
- Real period, genre, subject, theme, source, licence and reading-link fields
- Generated domains, authors, subjects and timeline sections
- Working catalogue search and genre filters
- Working metadata modal
- Working 3D-style book turn interaction, including a real second state
- **Read now** routes to an internal `reader.html` shell instead of immediately throwing the user onto the external source
- The original source remains available as a secondary fallback link inside the reader
- Copyrighted works remain metadata-only when no reading URL exists
- Responsive mobile layout
- Experimental design lab

## Reader behaviour

The reader shell is intentionally part of the experiment. A public reading source is loaded inside the reading frame when the source permits embedding. If a source blocks framing, the user still lands on the library's reader page and can choose the source manually.

## Data provenance

The catalogue records are adapted from `Yuri-code-dot/English-library-`, specifically the `src/data/books.ts` model. The experiment currently keeps the same 33-work catalogue represented in that model, while simplifying the browser-side shape for the static prototype.

## Design direction

Cream paper, black ink, red annotations, fine grid lines, oversized editorial typography, physical-book metaphors, real interactions and room for future WebGL work.

This repository is intentionally separate from the production library so the visual system can evolve without destabilising the main application.
