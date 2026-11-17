/* CreationFirst, name-preview.js
   „Namens-Vorschau“ auf der Startseite: Firmenname, Branche und Ort eintippen, die Beispielseite im Rahmen
   baut sich sofort um. Die Eingabe geht nur per postMessage an den eigenen Rahmen (gleiche Herkunft) und
   steht für das Popup hinter dem # im Link. Es wird nichts gespeichert und nichts an einen Server geschickt. */
(function () {
  "use strict";
  var root = document.querySelector("[data-name-preview]");
  if (!root) return;

  var frame = root.querySelector("iframe");
  var nameInput = root.querySelector("[data-np-name]");
  var cityInput = root.querySelector("[data-np-city]");
  var chips = root.querySelectorAll("[data-np-branch]");
  var openLink = root.querySelector("[data-np-open]");
  var hostEl = root.querySelector("[data-np-host]");
  var baseHref = openLink ? openLink.getAttribute("href").split("#")[0] : "";
  var fallbackName = openLink ? openLink.getAttribute("data-demo") : "";
  var state = { name: "", branch: "handwerk", city: "" };

  function clean(v, max) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, max); }

  function slug(name) {
    var s = name.toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[čć]/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "dein-betrieb";
  }

  function send() {
    if (frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage({ type: "cf-preview", state: state }, window.location.origin); } catch (e) { /* Rahmen noch nicht bereit */ }
    }
  }

  function update() {
    state.name = clean(nameInput.value, 40);
    state.city = clean(cityInput.value, 30);
    if (hostEl) hostEl.textContent = slug(state.name) + ".example";
    if (openLink) {
      openLink.setAttribute("href", baseHref + "#n=" + encodeURIComponent(state.name) + "&b=" + state.branch + "&c=" + encodeURIComponent(state.city));
      openLink.setAttribute("data-demo", state.name || fallbackName);
    }
    send();
  }

  nameInput.addEventListener("input", update);
  cityInput.addEventListener("input", update);
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.branch = chip.getAttribute("data-np-branch");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      update();
    });
  });

  // Der Rahmen meldet sich, sobald er geladen ist (er lädt erst, wenn er in Sichtweite kommt).
  window.addEventListener("message", function (e) {
    if (e.origin !== window.location.origin || !e.data || e.data.type !== "cf-preview-ready") return;
    if (frame && e.source === frame.contentWindow) send();
  });
  if (frame) frame.addEventListener("load", send);
  update();
})();
