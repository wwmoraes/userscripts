// ==UserScript==
// @name            Native Overrides
// @description     Overrides native functions using Native library to fix/extend functionality.
// @version         0.2
// @copyright       2013, William Moraes (https://william.moraes.nom.br)
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @author          William Moraes <https:/>/scr.im/>wwm> (https://william.moraes.nom.br)
// @namespace       william.moraes.nom.br
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// @updateURL       https://openuserjs.org/meta/wwmoraes/Native.meta.js
// @downloadURL     https://openuserjs.org/src/scripts/wwmoraes/Native.js
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @require         https://openuserjs.org/src/libs/wwmoraes/Native.js
// @match           *://*/*
// @grant           none
// ==/UserScript==

(function(){
	'use strict';

	document.addEventListener("pageshow", function(){
		Function.override('window.open', function(){base.apply(this, Array.prototype.slice.call(arguments, 0, 2));});
	});

	document.addEventListener("pagehide", function(){
		Function.restore('window.open');
	});
})();
