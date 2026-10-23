# AMS Gallery Refinement

- [x] Correct Role Achievement Showcase photo sizing, cropping, placement, and duplication without changing colours
- [x] Render real trophies and credentials in the live AMS Manager gallery; hide blank, clipped, or cropped artwork
- [x] Audit gallery layout, enforce fixed card dimensions, and separate category presentation
- [x] Audit current gallery layout and real asset/data flow
- [x] Refine trophy collection, filters, cards, and details presentation
- [x] Separate and refine credentials presentation
- [x] Verify authenticated rendering with a signed-in preview session (super@demo.app): gallery, filters, detail page, edits, image replace
- [x] Test New Award image upload and AI suggestions for title, category, and image (verified live: suggestion applied to form + preview)
- [ ] Inspect the authenticated AMS Manager gallery at 1920 and 2560 widths; confirm cropped-trophy handling and blank states (1366 verified)
- [x] Add a trophy details page showing title, category, issuer, description, original image, and a download link
- [x] Add title, category, description editing and artwork replacement on the trophy detail page (trophy_details table + award-assets bucket)
- [x] Add role, category, and status (active/pending) filters to the trophy gallery and link each card to its role-wise detail page
- [x] Replace cropped/blank showcase artwork with real trophy renders (fallback chain on ArtImg/StageArt)
