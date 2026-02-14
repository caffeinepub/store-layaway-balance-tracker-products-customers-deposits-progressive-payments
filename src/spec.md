# Specification

## Summary
**Goal:** Add client-side status filtering controls to the Repairs dashboard to quickly narrow repair records by contact and delivery status.

**Planned changes:**
- Add a compact filter area in `frontend/src/features/repairs/components/RepairsDashboard.tsx` to filter by contact status (All / To call / Called) and delivery status (All / Not delivered / Delivered).
- Apply filters client-side to the already-fetched repairs list, updating table rows immediately.
- Ensure filters work in combination with the existing “show all” vs “open only” toggle (filters applied on top of the currently selected dataset).
- Add a single clear/reset action to restore filters to “All” for the current dataset selection.
- Show the existing empty state when filters yield zero matches.

**User-visible outcome:** Users can filter the Repairs dashboard table by contact status and delivery status (and reset filters), with instant updates while still respecting the existing open/all toggle.
