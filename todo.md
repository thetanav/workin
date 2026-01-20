# WorkIn

## MVP
- Check-in: create status ("I am here") with location + note
- Discover: city search + map/list of active check-ins
- Share: open check-in details / share page
- Profile: bio (<= 255 words) + links (GitHub/X)

## Next
- Build health: fix Convex TS errors, run `npx convex dev`, ensure `npm run build`
- Pages: search, create, settings, history
- /search: city -> map markers -> open `/c/[id]`
- Optional: `/l/[lng]/[lat]` location page (count + list)
- Requests: send/accept/reject collaboration requests
- Ratings: user trust score + display in cards/profile

## Rules
- Follow `convex/schema.ts`

## Libs
- Map: https://mapcn.vercel.app/docs
- UI: https://coss.com/ui/llms.txt
