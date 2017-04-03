// ==UserScript==
// @name         Native Overrides
// @description  Overrides native functions using Native library to fix/extend functionality.
// @author       2013, William Moraes (http://wwmoraes.com/)
// @version      0.2
// @match        *://*/*
// @grant        none
// @require      https://openuserjs.org/src/libs/wwmoraes/Native.js
// @copyright    2013, William Moraes (http://wwmoraes.com/)
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues
// @updateURL    https://openuserjs.org/meta/wwmoraes/Native.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/wwmoraes/Native.js
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
