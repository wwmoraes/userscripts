// ==UserScript==
// @name         Folha de S.Paulo
// @description  Fix the site by removing the tons of ads EVEN FOR PAID USERS!
// @author       William Moraes (http://wwmoraes.com/)
// @version      0.1
// @match        http://*.folha.uol.com.br/*
// @license      GPL-3.0; http://www.gnu.org/copyleft/gpl.html
// @copyright    2016, William Moraes (http://wwmoraes.com/)
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues
// @updateURL    https://openuserjs.org/meta/wwmoraes/Folha_de_S.Paulo.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/wwmoraes/Folha_de_S.Paulo.user.js
// ==/UserScript==

(function() {
    'use strict';

    document.querySelectorAll(".tm-ads, .advertising, .livraria, #shopping, #bookstore-home, .patrocinado").forEach(function(elem){
        elem.remove();
    });
    document.querySelector("#main[role='main'] ~ div.span4").remove(); // Remove a coluna da direita recheada de span, pra centralizar o conteúdo
    document.querySelector("#main[role='main']").classList.add("offset2"); // Centraliza o conteúdo
})();
