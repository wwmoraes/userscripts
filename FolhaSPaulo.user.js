// ==UserScript==
// @name         Folha de S.Paulo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fix the site by removing the tons of ads EVEN FOR PAID USERS!
// @author       William Moraes
// @match        http://*.folha.uol.com.br/*
// ==/UserScript==

(function() {
    'use strict';

    document.querySelectorAll(".tm-ads, .advertising, .livraria, #shopping, #bookstore-home, .patrocinado").forEach(function(elem){
        elem.remove();
    });
    document.querySelector("#main[role='main'] ~ div.span4").remove(); // Remove a coluna da direita recheada de span, pra centralizar o conteúdo
    document.querySelector("#main[role='main']").classList.add("offset2"); // Centraliza o conteúdo
})();