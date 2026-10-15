/*
 * Examen 2027 — commandes exécutées dans le document (callCommand).
 * Chaque fonction est sérialisée par le kit d'extensions puis exécutée dans
 * l'éditeur : elle ne peut utiliser que `Api` et `Asc.scope` (aucune variable
 * de ce fichier). Les données reviennent sous forme de chaîne JSON.
 */
(function (root) { 'use strict';

    var commands = {};

    // État du document : réglages (propriété personnalisée), repères de questions,
    // paragraphe du curseur.
    commands.readState = function () {
        var doc = Api.GetDocument();
        var props = doc.GetCustomProperties ? doc.GetCustomProperties() : null;
        var settings = props ? props.Get('KalyptikExamen2027') : null;
        var markers = [];
        var ccs = doc.GetAllContentControls() || [];
        for (var i = 0; i < ccs.length; i++) {
            var tag = ccs[i].GetTag ? ccs[i].GetTag() : '';
            if (tag && tag.indexOf('kx27q:') === 0) markers.push(tag.slice(6));
        }
        var current = null;
        var p = doc.GetCurrentParagraph ? doc.GetCurrentParagraph() : null;
        if (p) {
            current = {text: p.GetText({Math: false, Numbering: true}).slice(0, 160), marker: null};
            for (var j = 0; j < p.GetElementsCount(); j++) {
                var e = p.GetElement(j);
                if (e && e.GetClassType && e.GetClassType() === 'inlineLvlSdt') {
                    var t = e.GetTag();
                    if (t && t.indexOf('kx27q:') === 0) current.marker = t.slice(6);
                }
            }
        }
        return JSON.stringify({settings: settings, markers: markers, current: current});
    };

    // Enregistre les réglages (liste des compétences…) dans le fichier .docx.
    commands.saveSettings = function () {
        var props = Api.GetDocument().GetCustomProperties();
        return props ? props.Add('KalyptikExamen2027', Asc.scope.settings) : false;
    };

    // Pose, met à jour ou retire le repère de compétences du paragraphe du curseur.
    commands.setMarker = function () {
        var doc = Api.GetDocument();
        var p = doc.GetCurrentParagraph();
        if (!p) return 'nopara';
        var sdt = null;
        for (var j = 0; j < p.GetElementsCount(); j++) {
            var e = p.GetElement(j);
            if (e && e.GetClassType && e.GetClassType() === 'inlineLvlSdt') {
                var t = e.GetTag();
                if (t && t.indexOf('kx27q:') === 0) sdt = e;
            }
        }
        if (Asc.scope.remove) {
            if (sdt) sdt.Delete(false);
            return 'removed';
        }
        if (!sdt) {
            sdt = Api.CreateInlineLvlSdt();
            p.AddInlineLvlSdt(sdt);
        }
        sdt.SetTag('kx27q:' + Asc.scope.data);
        sdt.SetAlias('Compétences évaluées');
        // Texte du repère en morceaux : {t: texte, c: [r, g, b] (couleur), b: gras}
        sdt.RemoveAllElements();
        var parts = Asc.scope.display || [];
        for (var k = 0; k < parts.length; k++) {
            var run = Api.CreateRun();
            run.AddText(parts[k].t);
            run.SetFontSize(18);
            var col = parts[k].c || [96, 96, 96];
            run.SetColor(col[0], col[1], col[2]);
            run.SetItalic(false);
            run.SetBold(!!parts[k].b);
            sdt.AddElement(run, k);
        }
        return 'ok';
    };

    // Réécrit le texte affiché de tous les repères (codes modifiés, affichage on/off).
    commands.refreshMarkers = function () {
        var doc = Api.GetDocument();
        var ccs = doc.GetAllContentControls() || [];
        var displays = Asc.scope.displays || {};
        var n = 0;
        for (var i = 0; i < ccs.length; i++) {
            var tag = ccs[i].GetTag ? ccs[i].GetTag() : '';
            if (!tag || tag.indexOf('kx27q:') !== 0 || !(tag.slice(6) in displays)) continue;
            ccs[i].RemoveAllElements();
            var parts = displays[tag.slice(6)] || [];
            for (var k = 0; k < parts.length; k++) {
                var run = Api.CreateRun();
                run.AddText(parts[k].t);
                run.SetFontSize(18);
                var col = parts[k].c || [96, 96, 96];
                run.SetColor(col[0], col[1], col[2]);
                run.SetItalic(false);
                run.SetBold(!!parts[k].b);
                ccs[i].AddElement(run, k);
            }
            n++;
        }
        return n;
    };

    // Insère (ou remplace) la grille d'évaluation des compétences en fin de document.
    commands.buildGrid = function () {
        var g = Asc.scope.grid;
        var doc = Api.GetDocument();
        var old = doc.GetContentControlsByTag('kx27grid') || [];
        for (var i = 0; i < old.length; i++) old[i].Delete(false);
        if (!g.rows.length) return 'empty';

        var sdt = Api.CreateBlockLvlSdt();
        sdt.SetTag('kx27grid');
        sdt.SetAlias("Grille d'évaluation des compétences");
        var content = sdt.GetContent();
        content.RemoveAllElements();

        var title = Api.CreateParagraph();
        title.AddText(g.title).SetBold(true);
        title.SetSpacingAfter(120);
        title.SetKeepNext(true);
        content.Push(title);

        var cols = 2 + g.levels.length;
        var table = Api.CreateTable(cols, g.rows.length + 1);
        table.SetWidth('percent', 100);
        table.SetTableBorderTop('single', 4, 0, 0, 0, 0);
        table.SetTableBorderBottom('single', 4, 0, 0, 0, 0);
        table.SetTableBorderLeft('single', 4, 0, 0, 0, 0);
        table.SetTableBorderRight('single', 4, 0, 0, 0, 0);
        table.SetTableBorderInsideH('single', 4, 0, 0, 0, 0);
        table.SetTableBorderInsideV('single', 4, 0, 0, 0, 0);

        var put = function (row, col, text, bold) {
            var para = table.GetCell(row, col).GetContent().GetElement(0);
            var run = para.AddText(text);
            if (bold) run.SetBold(true);
            if (row === 0 || col >= 2) para.SetJc('center');
        };
        var header = ['Compétence', 'Questions'].concat(g.levels);
        for (var c = 0; c < header.length; c++) put(0, c, header[c], true);
        for (var r = 0; r < g.rows.length; r++) {
            // Compétence : code en gras dans sa couleur, cellule teintée de la même couleur
            var row = g.rows[r], col = row.color || [96, 96, 96];
            var cell = table.GetCell(r + 1, 0);
            var cp = cell.GetContent().GetElement(0);
            var code = cp.AddText(row.code);
            code.SetBold(true);
            code.SetColor(col[0], col[1], col[2]);
            cp.AddText(' – ' + row.label);
            var tint = function (v) { return Math.round(v + (255 - v) * 0.85); };
            cell.SetShd('clear', tint(col[0]), tint(col[1]), tint(col[2]), false);
            put(r + 1, 1, g.rows[r].questions, false);
            for (var l = 0; l < g.levels.length; l++) put(r + 1, 2 + l, '', false);
        }
        table.SetTableLook(true, true, false, false, false, false);
        content.Push(table);

        doc.Push(sdt);
        doc.Push(Api.CreateParagraph());
        return 'ok';
    };

    // Mise en forme 2027 : Arial 12, aligné à gauche, interligne 1,15.
    // Les titres gardent leur taille ; les équations ne sont pas modifiées.
    commands.applyFormat = function () {
        var F = Asc.scope.format;
        var doc = Api.GetDocument();
        var isSelection = Asc.scope.scope === 'selection';
        var paras = [];
        if (isSelection) {
            var range = doc.GetRangeBySelect();
            paras = range ? range.GetAllParagraphs() : [];
        } else {
            paras = doc.GetAllParagraphs();
            var tp = doc.GetDefaultTextPr();
            tp.SetFontFamily(F.font);
            tp.SetFontSize(F.sizeHalfPoints);
            var pp = doc.GetDefaultParaPr();
            pp.SetJc(F.align);
            pp.SetSpacingLine(F.lineSpacing, F.lineRule);
            var normal = doc.GetStyle('Normal');
            if (normal) {
                normal.GetTextPr().SetFontFamily(F.font);
                normal.GetTextPr().SetFontSize(F.sizeHalfPoints);
                normal.GetParaPr().SetJc(F.align);
                normal.GetParaPr().SetSpacingLine(F.lineSpacing, F.lineRule);
            }
        }
        var walk = function (el, keepSize) {
            var type = el && el.GetClassType ? el.GetClassType() : '';
            if (type === 'run') {
                el.SetFontFamily(F.font);
                if (!keepSize) el.SetFontSize(F.sizeHalfPoints);
            } else if (type === 'hyperlink' || type === 'inlineLvlSdt') {
                for (var k = 0; k < el.GetElementsCount(); k++) walk(el.GetElement(k), keepSize);
            }
        };
        var count = 0;
        for (var i = 0; i < paras.length; i++) {
            var p = paras[i];
            var style = p.GetStyle ? p.GetStyle() : null;
            var styleName = style && style.GetName ? String(style.GetName()) : '';
            var isHeading = /^(heading|titre|title|sous-titre|subtitle)/i.test(styleName);
            var jc = p.Paragraph.Get_CompiledPr2(false).ParaPr.Jc;
            if (jc === AscCommon.align_Justify || jc === AscCommon.align_Distributed) p.SetJc(F.align);
            if (!isHeading) p.SetSpacingLine(F.lineSpacing, F.lineRule);
            for (var j = 0; j < p.GetElementsCount(); j++) walk(p.GetElement(j), isHeading);
            count++;
        }
        return count;
    };

    // Analyse : textes des paragraphes (sans les équations) et écarts de mise en forme.
    commands.analyze = function () {
        var doc = Api.GetDocument();
        var F = Asc.scope.format;
        var paras = doc.GetAllParagraphs();
        var out = {texts: [], justified: 0, font: {}, size: 0, spacing: 0, underline: 0, latin: []};
        var walk = function (el, isHeading) {
            var type = el && el.GetClassType ? el.GetClassType() : '';
            if (type === 'run') {
                if (el.Run.Is_Empty()) return;
                var pr = el.Run.Get_CompiledPr(false);
                var name = pr.RFonts && pr.RFonts.Ascii ? pr.RFonts.Ascii.Name : '';
                if (name && name !== F.font && name !== 'Cambria Math') out.font[name] = (out.font[name] || 0) + 1;
                if (!isHeading && pr.FontSize && Math.abs(pr.FontSize * 2 - F.sizeHalfPoints) > 0.1) out.size++;
                if (pr.Underline) out.underline++;
            } else if (type === 'hyperlink' || type === 'inlineLvlSdt') {
                if (type === 'inlineLvlSdt' && String(el.GetTag()).indexOf('kx27q:') === 0) return;
                for (var k = 0; k < el.GetElementsCount(); k++) walk(el.GetElement(k), isHeading);
            }
        };
        for (var i = 0; i < paras.length; i++) {
            var p = paras[i];
            var text = p.GetText({Math: false, Numbering: false});
            out.texts.push(text);
            if (!/\S/.test(text)) continue;
            var style = p.GetStyle ? p.GetStyle() : null;
            var isHeading = /^(heading|titre|title|sous-titre|subtitle)/i.test(style && style.GetName ? String(style.GetName()) : '');
            var ppr = p.Paragraph.Get_CompiledPr2(false).ParaPr;
            if (ppr.Jc === AscCommon.align_Justify || ppr.Jc === AscCommon.align_Distributed) out.justified++;
            if (!isHeading && ppr.Spacing && Math.abs(ppr.Spacing.Line - 1.15) > 0.01) out.spacing++;
            for (var j = 0; j < p.GetElementsCount(); j++) walk(p.GetElement(j), isHeading);
        }
        var latin = Asc.scope.latin || [];
        for (var l = 0; l < latin.length; l++) {
            var ranges = doc.Search(latin[l], false) || [];
            var bad = 0;
            for (var r = 0; r < ranges.length; r++) {
                var tpr = ranges[r].GetTextPr();
                if (!tpr || !tpr.GetItalic()) bad++;
            }
            if (bad) out.latin.push({text: latin[l], count: bad});
        }
        return JSON.stringify(out);
    };

    // Corrections : remplacements de texte, ordinaux (suffixe en exposant),
    // locutions latines en italique, souligné remplacé par du gras.
    commands.applyFixes = function () {
        var doc = Api.GetDocument();
        var fixes = Asc.scope.fixes || [];
        var done = 0;
        for (var i = 0; i < fixes.length; i++) {
            var f = fixes[i];
            if (f.fix === 'replace' || f.fix === 'ordinal') {
                doc.SearchAndReplace({searchString: f.found, replaceString: f.replacement, matchCase: true});
                if (f.fix === 'ordinal') {
                    var digits = (f.replacement.match(/^\d+/) || [''])[0].length;
                    var ranges = doc.Search(f.replacement, true) || [];
                    for (var r = 0; r < ranges.length; r++) {
                        var sub = ranges[r].GetRange(digits, f.replacement.length);
                        if (sub) sub.SetVertAlign('superscript');
                    }
                }
                done++;
            } else if (f.fix === 'italic') {
                var lr = doc.Search(f.found, false) || [];
                for (var k = 0; k < lr.length; k++) lr[k].SetItalic(true);
                done++;
            } else if (f.fix === 'underline') {
                var paras = doc.GetAllParagraphs();
                var walk = function (el) {
                    var type = el && el.GetClassType ? el.GetClassType() : '';
                    if (type === 'run') {
                        if (el.Run.Get_CompiledPr(false).Underline) { el.SetUnderline(false); el.SetBold(true); }
                    } else if (type === 'hyperlink') {
                        for (var m = 0; m < el.GetElementsCount(); m++) walk(el.GetElement(m));
                    }
                };
                for (var p = 0; p < paras.length; p++)
                    for (var e = 0; e < paras[p].GetElementsCount(); e++) walk(paras[p].GetElement(e));
                done++;
            }
        }
        return done;
    };

    if (typeof module === 'object' && module.exports) module.exports = commands;
    else root.Examen2027Commands = commands;
})(this);
