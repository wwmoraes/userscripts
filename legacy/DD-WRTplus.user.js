// ==UserScript==
// @name            DD-WRT+
// @description     Superpowers your DD-WRT interface
// @version         0.1
// @copyright       2019, William Moraes (https://william.moraes.nom.br)
// @license         GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @author          William Moraes <https:/>/scr.im/>wwm> (https://william.moraes.nom.br)
// @namespace       william.moraes.nom.br
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// @updateURL       https://openuserjs.org/meta/wwmoraes/DD-WRTplus.meta.js
// @downloadURL     https://openuserjs.org/src/scripts/wwmoraes/DD-WRTplus.js
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @grant           all
// @exclude         *
// ==/UserScript==

/**
 * Please include your gateway IP/hostname on your extension configuration,
 * and remove the exclude *!
 */

(function() {
  'use strict';

  // LOLZ
  HTMLCollection.prototype.slice = Array.prototype.slice;

  // Functions
  function fnSwapEntries(event) {
    const checkboxes = event.target.closest('table').querySelectorAll('input[class^="swapBox"]:checked');

    if(checkboxes.length !== 2) return;

    checkboxes.forEach((checkbox) => { checkbox.checked = false; });

    Array.from(checkboxes[0].closest('tr').
      querySelectorAll('input[name^="svqos_dev"], select[name^="svqos_dev"]')).
      zip(Array.from(checkboxes[1].closest('tr').
        querySelectorAll('input[name^="svqos_dev"], select[name^="svqos_dev"]'))).
        forEach((elementPair) => {
        const tmpValue = elementPair[0].value;
        elementPair[0].value = elementPair[1].value;
        elementPair[1].value = tmpValue;
    });
}

function fnSwap(siblingMethod) {
  return (event) => {
      console.log("Swapping...");

      event.preventDefault();

      const currentRow = event.target.closest('tr');
      const swapRow = siblingMethod.apply(currentRow);

      if(swapRow.cells.length !== currentRow.cells.length) return;
      if(swapRow.querySelector('th') !== null) return;

      Array.from(currentRow.querySelectorAll('input[name^="svqos_dev"], select[name^="svqos_dev"]')).zip(Array.from(swapRow.querySelectorAll('input[name^="svqos_dev"], select[name^="svqos_dev"]'))).forEach((elementPair) => {
          const tmpValue = elementPair[0].value;
          elementPair[0].value = elementPair[1].value;
          elementPair[1].value = tmpValue;
      });
  }
}

  // QoS page
  if(document.querySelector('#menuMainList > li > span > strong').innerText === "NAT / QoS" &&
     document.querySelector('#menuSubList > li > span > strong').innerText === "QoS")
  {
      const fnSwapUp = fnSwap(HTMLElement.prototype.previous);
      const fnSwapDown = fnSwap(HTMLElement.prototype.next);

      const rows = document.querySelector('#contents table[summary="IP addresses priority table"').rows;

      const headerRow = rows[0];

      const header = document.createElement('th');
      header.appendChild(document.createTextNode('Swap'));
      headerRow.prepend(header);

      rows.slice(1).forEach((row, index) => {
          if(row.cells.length+1 !== headerRow.cells.length) return;

          const swapBox = document.createElement('input');
          swapBox.setAttribute('type', 'checkbox');
          swapBox.setAttribute('class', 'swapBox'+(index-1));
          swapBox.addEventListener("click", fnSwapEntries);

          // <input class="button" type="button" name="add_devsprio_button" value="Add" onclick="dev_add_submit(this.form);">
          const swapUp = document.createElement('input');
          swapUp.setAttribute('class', 'button');
          swapUp.setAttribute('type', 'button');
          swapUp.setAttribute('value', '↑');
          swapUp.addEventListener("click", fnSwapUp);

          const swapDown = document.createElement('input');
          swapDown.setAttribute('class', 'button');
          swapDown.setAttribute('type', 'button');
          swapDown.setAttribute('value', '↓');
          swapDown.addEventListener("click", fnSwapDown);

          const cell = document.createElement('td');
          cell.setAttribute('align', 'center');
          cell.appendChild(swapBox);
          cell.appendChild(swapUp);
          cell.appendChild(swapDown);

          row.prepend(cell);
      });
  }
})();
