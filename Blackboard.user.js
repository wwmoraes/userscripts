// ==UserScript==
// @name         Blackboard
// @description  Fix some anoying limitations and problems of BB.
// @copyright    2018, William Moraes (https://william.moraes.nom.br/)
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @icon         https://www.blackboard.com/images/favicon.ico
// @homepageURL  https://github.com/wwmoraes/userscripts
// @supportURL   https://github.com/wwmoraes/userscripts/issues
// @version      0.1
// @updateURL    https://openuserjs.org/meta/wwmoraes/Blackboard.meta.js
// ==OpenUserJS==
// @author wwmoraes
// ==/OpenUserJS==
// @downloadURL  https://openuserjs.org/src/scripts/wwmoraes/Blackboard.js
// @namespace    https://william.moraes.nom.br/
// @author       William Moraes
// @match        https://*.blackboard.com/**/Flipping_book/**/basic-html/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    RegExp.escape = function(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    };

    function matchURL(url){
        var re = new RegExp("^"+RegExp.escape(url).replace(/(\\\*)+/g,".*?")+"$");
        return location.href.match(re) !== null;
    }


    if(matchURL("https://*.blackboard.com/**/Flipping_book/**/basic-html/*")){
        // Adds a method to zoom to width
        BasicPage.prototype.zoomToWidth = function(){
            var maxZoom = (this._getWindowWidth() - 100) / this._getFitScreenSizes(this.pageRect.width, this.pageRect.height).width;
            this.currentZoom = maxZoom;
            this._setSizes.call(this);
            this._fontCorrection.call(this);
        };

        // Zoom to Width on page load
        BASIC_PAGE.zoomToWidth();
    }
})();
