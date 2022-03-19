// ==UserScript==
// @name         MetaGamerScore Plus
// @namespace    http://artero.dev/
// @version      0.0.1
// @description  QoL UI changes
// @author       William Artero
// @match        https://metagamerscore.com/my_games*
// @match        https://metagamerscore.com/game*
// @exclude      https://metagamerscore.com/my_games/*
// @exclude      https://metagamerscore.com/game/*
// @icon         https://www.google.com/s2/favicons?domain=metagamerscore.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

"use strict";

(() => {
  document.querySelectorAll("#masonry-container > div").forEach(block => {
    const link = block.querySelector("a");
    if (link === null) return;
    const actions = block.querySelector(".list_r_action");
    if (actions === null) return;

    const url = new URL(link.href);
    url.searchParams.set("hidden", "true");

    const hideLink = document.createElement("a");
    hideLink.setAttribute("rel", "nofollow");
    hideLink.setAttribute("data-method", "put");
    hideLink.setAttribute("href", url.toString());
    hideLink.textContent = "Hide";

    const small = document.createElement("small");
    small.appendChild(hideLink);
    actions.prepend(small);
  });

  console.info("DONE!");
})();
