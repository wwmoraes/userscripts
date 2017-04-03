// @name         Native
// @description  Save native functions to allow overrides to fix/extend functionality.
// @author       2013, William Moraes (http://wwmoraes.com/)
// @version      1.0
// @copyright    2013, William Moraes (http://wwmoraes.com/)
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues

(function(){
	'use strict';
	
	if (Object.Natives === undefined){
		Object.defineProperty(Object,'Natives',{
			__proto__: null,
			enumerable: false,
			configurable: false,
			writeable: false,
			value: {}
		});
	}
	
	Function.override = function(oldFunctionName, newFunction){
		if(typeof(oldFunctionName) !== "string") throw new TypeError('oldFunctionName must be a string');
		if(typeof(newFunction) !== "function") throw new TypeError('newFunction must be a function');
		var nativeName = "Object.Natives['"+oldFunctionName+"']";
		var nativeFuncType = typeof(eval(nativeName));
		if(oldFunctionName != "" && nativeFuncType === "undefined")
			eval(nativeName + "=" + oldFunctionName);
		else console.warn('Function ' + oldFunctionName + ' already overridden. Dropping the old function.');
		eval(oldFunctionName + "=" + newFunction.toString().replace(/(\W|^)base\./g, "$1Object.Natives['"+oldFunctionName+"']."));
	};
	
	Function.restore = function(oldFunctionName){
		if(typeof(oldFunctionName) !== "string") throw new TypeError('oldFunctionName must be a string');
		var nativeName = "Object.Natives['"+oldFunctionName+"']";
		var nativeFuncType = typeof(eval(nativeName));
		if(oldFunctionName != "" && nativeFuncType !== "undefined")
		{
			eval(oldFunctionName + "=" + nativeName);
			eval(nativeName + "=" + undefined);
		} else { console.warn('Function ' + oldFunctionName + ' is set to native or changed by third parties. Ignoring the restore...'); }
	};
})();
