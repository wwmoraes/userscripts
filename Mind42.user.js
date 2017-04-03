// ==UserScript==
// @name       Mind42
// @namespace  http://wwmoraes.com/
// @version    0.1
// @description  Clean the mind42 page
// @include      http://mind42.com/mindmap/*
// @copyright  2013, William Moraes <http://scr.im/wwm>
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// ==/UserScript==

function init(){
    if(typeof jQuery === "undefined" || jQuery === null)
    {
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.url = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';
        document.head.appendChild(script);
    }
    jQuery("#sidebar").css("display: none; width: 0;");
}

init();