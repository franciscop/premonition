// Loaded with data-pre-once: it must run exactly once for the whole session
window.onceRuns = (window.onceRuns || 0) + 1;
console.log("once.js ran, times so far:", window.onceRuns);
