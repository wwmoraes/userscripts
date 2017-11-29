// ==UserScript==
// @name         Mind42
// @description  Clean the mind42 page
// @version      0.1
// @include      http://mind42.com/mindmap/*
// @copyright    2013, William Moraes (http://wwmoraes.com/)
// @license      GPL-3.0; http://www.gnu.org/copyleft/gpl.html
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues
// @updateURL    https://openuserjs.org/meta/wwmoraes/Mind42.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/wwmoraes/Mind42.user.js
// ==/UserScript==

(function(){
    'use strict';

    document.getElementById('sidebar').setAttribute('style','display:none; width:0;');
})();
