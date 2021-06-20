// ==UserScript==
// @exclude         *
// ==UserLibrary==
// @name            Native
// @description     Save native functions to allow overrides to fix/extend functionality.
// @version         1.1
// @copyright       2013, William Moraes (https://william.moraes.nom.br)
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// ==/UserLibrary==
// @author          William Moraes <https:/>/scr.im/>wwm> (https://william.moraes.nom.br)
// @namespace       william.moraes.nom.br
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @grant           none
// ==/UserScript==
(function(){
	
	'use strict';

	if(typeof(Object.Natives) === "undefined"){
		Object.defineProperty(Object,'Natives',{
			enumerable: false,
			configurable: false,
			writeable: false,
			value: {}
		});
	}

	if(typeof(Function.override) === "undefined"){
		Function.override = function(oldFunctionName, newFunction){
			if(typeof(oldFunctionName) !== "string") throw new TypeError('oldFunctionName must be a string');
			if(typeof(newFunction) !== "function") throw new TypeError('newFunction must be a function');
			oldFunctionName = oldFunctionName.match(/[A-Za-z0-9._$]+/g)[0];
			var nativeName = "Object.Natives['"+oldFunctionName+"']";
			var nativeFuncType = typeof(eval(nativeName));
			if(oldFunctionName !== '' && nativeFuncType === "undefined")
				eval(nativeName + "=" + oldFunctionName);
			else console.warn('Function ' + oldFunctionName + ' already overridden. Dropping the old function.');
			eval(oldFunctionName + "=" + newFunction.toString().replace(/(\W|^)base\./g, "$1Object.Natives['"+oldFunctionName+"']."));
		};
	}

	if(typeof(Function.restore) === "undefined"){
		Function.restore = function(oldFunctionName){
			if(typeof(oldFunctionName) !== "string") throw new TypeError('oldFunctionName must be a string');
			oldFunctionName = oldFunctionName.match(/[A-Za-z0-9._$]+/g)[0];
			var nativeName = "Object.Natives['"+oldFunctionName+"']";
			var nativeFuncType = typeof(eval(nativeName));
			if(oldFunctionName !== '' && nativeFuncType !== "undefined")
			{
				eval(oldFunctionName + "=" + nativeName);
				eval(nativeName + "=" + undefined);
			} else { console.warn('Function ' + oldFunctionName + ' is set to native or changed by third parties. Ignoring the restore...'); }
		};
	}
})();
