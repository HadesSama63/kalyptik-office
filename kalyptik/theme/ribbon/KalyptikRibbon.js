/* Kalyptik Office — semantic ribbon groups. SPDX-License-Identifier: AGPL-3.0-only */
define([], function () {
    'use strict';

    var labels = {
        fr: {
            file: 'Fichier', clipboard: 'Presse-papiers', actions: 'Actions',
            font: 'Police', paragraph: 'Paragraphe', alignment: 'Alignement',
            styles: 'Styles', editing: 'Édition', number: 'Nombre', cells: 'Cellules',
            data: 'Données', formulas: 'Formules', slides: 'Diapositives',
            presentation: 'Présentation', insert: 'Insertion', arrange: 'Organiser',
            tables: 'Tableaux', illustrations: 'Illustrations', page: 'Mise en page'
        },
        en: {
            file: 'File', clipboard: 'Clipboard', actions: 'Actions',
            font: 'Font', paragraph: 'Paragraph', alignment: 'Alignment',
            styles: 'Styles', editing: 'Editing', number: 'Number', cells: 'Cells',
            data: 'Data', formulas: 'Formulas', slides: 'Slides',
            presentation: 'Presentation', insert: 'Insert', arrange: 'Arrange',
            tables: 'Tables', illustrations: 'Illustrations', page: 'Page layout'
        }
    };

    // Match stable command slots, never an ordinal or a translated button caption.
    // Decoration runs before Button.render() and does not move or replace controls.
    var groups = [
        ['#slot-btn-save, #slot-btn-print', 'file'],
        ['#slot-btn-undo, #slot-btn-redo', 'actions'],
        ['#slot-btn-paste, #slot-btn-copy, #slot-btn-cut, #slot-btn-copystyle', 'clipboard'],
        ['#slot-field-fontname, #slot-field-fontsize', 'font'],
        ['#slot-btn-merge', 'alignment'],
        ['#slot-btn-markers, #slot-btn-halign, #slot-btn-align-center', 'paragraph'],
        ['#slot-field-styles, #slot-btn-condformat, #slot-btn-table-tpl', 'styles'],
        ['#slot-btn-format, #slot-btn-currency', 'number'],
        ['#slot-btn-formula, #slot-btn-named-range', 'formulas'],
        ['.slot-sortdesc, .slot-sortasc, .slot-btn-setfilter', 'data'],
        ['#slot-btn-cell-ins, #slot-btn-cell-del, #slot-btn-cell-format', 'cells'],
        ['#slot-addslide, #slot-changeslide', 'slides'],
        ['#slot-preview', 'presentation'],
        ['#slot-btn-replace, #slot-btn-select-all, #slot-btn-search', 'editing'],
        ['#slot-btn-arrange-shape, #slot-btn-align-shape', 'arrange'],
        ['#slot-btn-instable', 'tables'],
        ['.slot-instext, .slot-insertimg, .slot-insertshape', 'insert'],
        ['#slot-btn-insshape, #slot-btn-inschart', 'illustrations'],
        ['#slot-btn-pagemargins, #slot-btn-pageorient', 'page']
    ];

    function decorate(root, config) {
        if (!root || !root.querySelectorAll) return;
        var language = (config && config.lang) || 'en';
        var words = labels[String(language).toLowerCase().split(/[-_]/)[0]] || labels.en;
        Array.prototype.forEach.call(root.querySelectorAll('.panel > .group'), function (group) {
            for (var i = 0; i < groups.length; i++) {
                if (group.matches(groups[i][0]) || group.querySelector(groups[i][0])) {
                    // An attribute rather than a child: some controls replace their slot's
                    // contents, and Mixtbar moves whole groups into its overflow menu.
                    group.setAttribute('data-kalyptik-label', words[groups[i][1]]);
                    group.style.setProperty('--kalyptik-group-min-width',
                        Math.ceil(words[groups[i][1]].length * 5.7 + 16) + 'px');
                    break;
                }
            }
        });
    }

    return {decorate: decorate};
});
