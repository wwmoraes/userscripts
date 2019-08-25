// ==UserScript==
// @name            Qualitor+
// @description     Melhora a usabilidade do qualitor.
// @version         0.3
// @copyright       2012, William Moraes (https://william.moraes.nom.br)
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @icon            http://www.qualitor.com.br/assets/uploads/wt_global_favicon/ceb2c-favicon.png
// @author          William Moraes <https:/>/scr.im/>wwm> (https://william.moraes.nom.br)
// @namespace       william.moraes.nom.br
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// @updateURL       https://openuserjs.org/meta/wwmoraes/QualitorPlus.meta.js
// @downloadURL     https://openuserjs.org/src/scripts/wwmoraes/QualitorPlus.js
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @require         https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @match           http://10.1.250.181/html/index.php
// @match           http://suporteti.odebrecht.com/html/index.php
// @match           http://helpdesk.odebrecht.com/html/index.php
// ==/UserScript==

(function() {
    'use strict';

    var QualitorPlus = {
        jsonCriarChamado: {
            cdcliente: 1,
            cdcontato: 18383,
            cdtipochamado: 5089,
            cdlocalidade: 6036,
            cdseveridade: 1,
            cdorigem: 2,
            cdanimo: 24
        },
        abrirChamado: function(e){
            e.preventDefault();
            if(!(cdChamado=window.prompt('Chamado:')))
                return;
            window.open(window.location.protocol+'//'+window.location.hostname+'/html/hd/hdchamado/cadastro_chamado.php?cdchamado='+cdChamado,'_blank');
        },
        novoIncidenteSisEng: function(e){
            e.preventDefault();
            $.extend(this.jsonCriarChamado, {
                cdcategoria1: 2000002057,
                cdcategoria2: 2000002301,
                cdcategoria3: 2000002313
            });
            window.open(window.location.protocol+'//'+window.location.hostname+'/html/hd/hdchamado/cadastro_chamado.php?'+$.param(this.jsonCriarChamado),'_blank');
        },
        novaMelhoriaSisEng: function(e){
            e.preventDefault();
            $.extend(this.jsonCriarChamado, {
                cdcategoria1: 2000002329,
                cdcategoria2: 2000002558,
                cdcategoria3: 2000002570
            });
            window.open(window.location.protocol+'//'+window.location.hostname+'/html/hd/hdchamado/cadastro_chamado.php?'+$.param(this.jsonCriarChamado),'_blank');
        }
    };

    //jQuery("ul#toolbarIcons").append("<li class=\"toolbarslider-item toolbarIcon\" onclick=\"javascript:(function(e){if(!(cdChamado=window.prompt('Chamado:')))return;window.open('http://10.1.250.181/html/hd/hdchamado/cadastro_chamado.php?cdchamado='+cdChamado,'_blank')})(jQuery)\" style=\"background:url(data:image/png;base64,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) no-repeat center center;\" alt=\"Abrir Chamado\" title=\"Abrir Chamado\"></li>");
    jQuery("ul#toolbarIcons").append("<li id=\"abrirChamado\" class=\"toolbarslider-item toolbarIcon\" style=\"background:url(data:image/png;base64,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) no-repeat center center;background-size:32px 32px;\" alt=\"Abrir Chamado\" title=\"Abrir Chamado\"></li>");
    jQuery("ul#toolbarIcons").children("#abrirChamado").click(QualitorPlus.abrirChamado);
    jQuery("ul#toolbarIcons").append("<li id=\"novoIncidenteSisEng\" class=\"toolbarslider-item toolbarIcon\" style=\"background:url(data:image/png;base64,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) no-repeat center center;background-size:32px 32px;\" alt=\"Novo Incidente SisEng\" title=\"Novo Incidente SisEng\"></li>");
    jQuery("ul#toolbarIcons").children("#novoIncidenteSisEng").click(QualitorPlus.novoIncidenteSisEng);
    jQuery("ul#toolbarIcons").append("<li id=\"novaMelhoriaSisEng\" class=\"toolbarslider-item toolbarIcon\" style=\"background:url(data:image/png;base64,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) no-repeat center center;background-size:32px 32px;\" alt=\"Nova Melhoria SisEng\" title=\"Nova Melhoria SisEng\"></li>");
    jQuery("ul#toolbarIcons").children("#novaMelhoriaSisEng").click(QualitorPlus.novaMelhoriaSisEng);
})();
