import Premonition from "./index";

// This script is one of the ones re-injected on every swap, and a second
// instance would attach a second listener to every link
if (!window.pre) window.pre = new Premonition();
