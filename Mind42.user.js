// ==UserScript==
// @name            Mind42
// @description     Clean the mind42 page
// @version         0.1
// @copyright       2013, William Moraes (https://william.moraes.nom.br)
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @author          William Moraes <https:/>/scr.im/>wwm> (https://william.moraes.nom.br)
// @namespace       william.moraes.nom.br
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// @updateURL       https://openuserjs.org/meta/wwmoraes/Mind42.meta.js
// @downloadURL     https://openuserjs.org/src/scripts/wwmoraes/Mind42.user.js
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @include         http://mind42.com/mindmap/*
// ==/UserScript==

(function(){
    'use strict';

    document.getElementById('sidebar').setAttribute('style','display:none; width:0;');
})();
