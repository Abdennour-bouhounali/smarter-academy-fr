import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

// Icons whose MEANING is a reading direction ("forward", "back", "the panel
// on the start edge"). The product reads left to right (src/locale.js), so
// forward points right and the start edge is the left one; call sites keep
// expressing intent, not a physical side. Fixed-meaning icons (Enter ⏎,
// play, a math arrow on an axis) must NOT go through here.
export const ArrowForward = ArrowRight;
export const ArrowBack = ArrowLeft;
export const ChevronForward = ChevronRight;
export const ChevronBack = ChevronLeft;
// Le double chevron : « sauter » plutôt qu'« avancer d'un pas » — une
// direction de lecture, comme le simple.
export const ChevronsForward = ChevronsRight;
export const ChevronsBack = ChevronsLeft;
export const PanelStartOpen = PanelLeftOpen;
export const PanelStartClose = PanelLeftClose;
