// @name         Native Overrides
// @description  Save native functions to allow overrides to fix/extend functionality.
// @author       2013, William Moraes (http://wwmoraes.com/)
// @version      0.1
// @match        *://*/*
// @grant        none
// @copyright    2013, William Moraes (http://wwmoraes.com/)
// @license      GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues
// @updateURL    https://openuserjs.org/meta/wwmoraes/Native.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/wwmoraes/Native.js

(function() {
    'use strict';

    // Native saves
    window.Native = {
        window: {
            open: window.open
        }
    };

    // Example: Override to prevent popups (ignores third parameter)
    //window.open = function(url, target){Native.window.open.apply(this, Array.prototype.slice.call(arguments, 0, 2));};
})();
