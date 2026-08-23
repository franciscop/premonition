// No attribute: it must run again on every page that premonition swaps in
window.pagesOpened = (window.pagesOpened || 0) + 1;
console.log("every.js ran, pages opened so far:", window.pagesOpened);

const count = (n) => {
  const b = document.createElement("b");
  b.textContent = n;
  return b;
};

document.querySelectorAll("[data-counter]").forEach((el) => {
  el.replaceChildren(
    count(window.pagesOpened),
    document.createTextNode(" pages opened without a full reload"),
    document.createElement("br"),
    document.createTextNode("the data-pre-once script has run "),
    count(window.onceRuns),
    document.createTextNode(" time(s), it should stay at 1"),
  );
});
