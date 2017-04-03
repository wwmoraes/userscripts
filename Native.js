// ==UserScript==
// @name         Native Overrides
// @namespace    http://wwmoraes.com/
// @version      0.1
// @description  Save native functions and overrides them to fix/extend functionality.
// @author       William Moraes
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Native saves
    var Native = {
        window: {
            open: window.open
        }
    };

    // Override to prevent popups (ignores third parameter)
    window.open = function(url, target){Native.window.open.apply(this, Array.prototype.slice.call(arguments, 0, 2));};
})();