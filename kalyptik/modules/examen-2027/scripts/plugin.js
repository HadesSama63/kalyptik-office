/*
 * Examen 2027 — panneau du traitement de texte.
 *  - mise en forme des sujets (Arial 12, aligné à gauche, interligne 1,15) ;
 *  - vérification typographique (scripts/rules.js) avec corrections ;
 *  - compétences évaluées, associées à chaque question (repère dans le texte) ;
 *  - grille d'évaluation des compétences en fin de document.
 * Les compétences sont enregistrées dans le document (propriété personnalisée
 * « KalyptikExamen2027 ») : elles suivent le fichier .docx.
 */
(function (window) { 'use strict';
    var R = window.Examen2027Rules, C = window.Examen2027Commands;
    var plugin = window.Asc.plugin;

    var LEVELS = ['Maîtrise insuffisante', 'Maîtrise fragile', 'Maîtrise satisfaisante', 'Très bonne maîtrise'];
    var MATHS = [['CH', 'Chercher'], ['MO', 'Modéliser'], ['RE', 'Représenter'],
                 ['RA', 'Raisonner'], ['CA', 'Calculer'], ['CO', 'Communiquer']];

    var state = {
        settings: {competences: [], show: true, title: "Grille d'évaluation des compétences", levels: LEVELS},
        markers: [],          // repères des questions, dans l'ordre du document
        current: null,        // paragraphe du curseur
        issues: []            // résultats de l'analyse
    };

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) {
        return String(s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; });
    };
    var visible = function (s) { return esc(s).replace(/ /g, '⍽').replace(/ /g, '·'); };
    var status = function (text) { $('status').textContent = text || ''; };

    function run(command, scope, callback) {
        window.Asc.scope = scope || {};
        plugin.callCommand(command, false, true, callback);
    }

    function parse(json, fallback) {
        try { return JSON.parse(json); } catch (e) { return fallback; }
    }

    // ------------------------------------------------------------ état du document

    function refresh(done) {
        run(C.readState, {}, function (json) {
            var s = parse(json, null);
            if (!s) return done && done();
            if (s.settings) {
                var saved = parse(s.settings, null);
                if (saved && saved.competences) {
                    state.settings.competences = saved.competences;
                    state.settings.show = saved.show !== false;
                }
            }
            state.markers = (s.markers || []).map(function (m) { return parse(m, {c: []}); });
            state.current = s.current;
            render();
            done && done();
        });
    }

    function saveSettings(done) {
        run(C.saveSettings, {settings: JSON.stringify({
            competences: state.settings.competences, show: state.settings.show, version: 1})}, done);
    }

    function compById(id) {
        for (var i = 0; i < state.settings.competences.length; i++)
            if (state.settings.competences[i].id === id) return state.settings.competences[i];
        return null;
    }

    function displayFor(marker) {
        if (!state.settings.show) return '​';
        var codes = (marker.c || []).map(function (id) { var c = compById(id); return c ? c.code : null; })
                                    .filter(Boolean);
        return codes.length ? ' [' + codes.join(', ') + ']' : '​';
    }

    // Repère proposé : début de la question (« 1. », « 2. a) », « b) »…)
    function guessLabel(text) {
        var m = /^\s*(?:(Exercice|Partie)\s+([A-Z0-9]+)\b)?[\s.:–-]*(?:(\d+(?:\.\d+)*)[.)]?)?\s*(?:([a-z])\))?/i.exec(text || '');
        if (!m) return '';
        var parts = [];
        if (m[1]) parts.push((/^e/i.test(m[1]) ? 'Ex. ' : 'Partie ') + m[2]);
        var q = (m[3] || '') + (m[4] ? (m[3] ? ' ' : '') + m[4] + ')' : '');
        if (q) parts.push(q);
        return parts.join(' – ');
    }

    // ------------------------------------------------------------ rendu

    function render() {
        renderCompetences();
        renderQuestion();
        renderSummary();
    }

    function renderCompetences() {
        var list = state.settings.competences;
        $('competences').innerHTML = list.length ? list.map(function (c) {
            return '<div class="item"><span class="comp-code">' + esc(c.code) + '</span>' +
                   '<span class="body">' + esc(c.label) + '</span>' +
                   '<button class="link" data-del="' + esc(c.id) + '">Supprimer</button></div>';
        }).join('') : '<p class="hint">Aucune compétence : ajoutez-les ci-dessous.</p>';
        $('btn-preset').style.display = list.length ? 'none' : '';
    }

    function renderQuestion() {
        var cur = state.current;
        var marker = cur && cur.marker ? parse(cur.marker, {c: []}) : null;
        $('current-text').textContent = cur && /\S/.test(cur.text) ? cur.text : 'Placez le curseur dans une question du sujet.';
        $('question-label').value = marker && marker.l ? marker.l : guessLabel(cur && cur.text);
        var selected = marker ? marker.c : [];
        $('question-comps').innerHTML = state.settings.competences.map(function (c) {
            return '<label class="check"><input type="checkbox" value="' + esc(c.id) + '"' +
                   (selected.indexOf(c.id) >= 0 ? ' checked' : '') + '> <b>' + esc(c.code) + '</b> ' + esc(c.label) + '</label>';
        }).join('');
        var can = !!(cur && /\S/.test(cur.text)) && state.settings.competences.length > 0;
        $('btn-tag').disabled = !can;
        $('btn-tag').textContent = marker ? 'Mettre à jour' : 'Associer à la question';
        $('btn-untag').disabled = !marker;
    }

    function gridRows() {
        return state.settings.competences.map(function (c) {
            var qs = [];
            state.markers.forEach(function (m, i) {
                if ((m.c || []).indexOf(c.id) >= 0) qs.push(m.l || ('Q' + (i + 1)));
            });
            return {label: c.code + ' – ' + c.label, questions: qs.join(', ') || '—', used: qs.length};
        });
    }

    function renderSummary() {
        var n = state.markers.length, comps = state.settings.competences.length;
        $('grid-summary').textContent = n
            ? n + ' question' + (n > 1 ? 's' : '') + ' associée' + (n > 1 ? 's' : '') + ' ; ' + comps + ' compétence' + (comps > 1 ? 's' : '') + ' définie' + (comps > 1 ? 's' : '') + '.'
            : 'Associez au moins une question à des compétences pour construire la grille.';
        $('show-markers').checked = state.settings.show;
        $('btn-grid').disabled = !n;
    }

    // ------------------------------------------------------------ compétences

    function addCompetence(code, label) {
        code = String(code || '').trim().toUpperCase();
        label = String(label || '').trim();
        if (!label) return status('Indiquez l\'intitulé de la compétence.');
        if (!code) code = label.slice(0, 2).toUpperCase();
        state.settings.competences.push({id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), code: code, label: label});
    }

    function onAddCompetence() {
        addCompetence($('new-code').value, $('new-label').value);
        $('new-code').value = $('new-label').value = '';
        saveSettings(function () { render(); status('Compétence ajoutée.'); });
    }

    function onPreset() {
        MATHS.forEach(function (c) { addCompetence(c[0], c[1]); });
        saveSettings(function () { render(); status('Les 6 compétences de mathématiques sont ajoutées.'); });
    }

    function onDeleteCompetence(id) {
        state.settings.competences = state.settings.competences.filter(function (c) { return c.id !== id; });
        saveSettings(function () { refreshAllMarkers(function () { render(); status('Compétence supprimée.'); }); });
    }

    // ------------------------------------------------------------ questions

    function onTag(remove) {
        var ids = Array.prototype.map.call(document.querySelectorAll('#question-comps input:checked'), function (i) { return i.value; });
        if (!remove && !ids.length) return status('Cochez au moins une compétence.');
        var marker = {l: $('question-label').value.trim(), c: ids};
        run(C.setMarker, {remove: !!remove, data: JSON.stringify(marker), display: displayFor(marker)}, function (res) {
            if (res === 'nopara') return status('Placez le curseur dans une question.');
            refresh(function () { status(remove ? 'Compétences retirées de la question.' : 'Question associée aux compétences.'); });
        });
    }

    function refreshAllMarkers(done) {
        // les repères sont identifiés par leur texte d'origine : on relit l'état d'abord
        run(C.readState, {}, function (json) {
            var s = parse(json, {markers: []});
            var map = {};
            (s.markers || []).forEach(function (raw) { map[raw] = displayFor(parse(raw, {c: []})); });
            run(C.refreshMarkers, {displays: map}, function () { refresh(done); });
        });
    }

    function onShowMarkers() {
        state.settings.show = $('show-markers').checked;
        saveSettings(function () { refreshAllMarkers(function () { status(state.settings.show ? 'Compétences affichées dans l\'énoncé.' : 'Compétences masquées dans l\'énoncé.'); }); });
    }

    function onGrid() {
        refresh(function () {
            var rows = gridRows().filter(function (r) { return r.used; });
            run(C.buildGrid, {grid: {title: state.settings.title, levels: state.settings.levels, rows: rows}}, function (res) {
                status(res === 'empty' ? 'Aucune question associée : la grille n\'a pas été insérée.'
                                       : 'Grille insérée en fin de document (' + rows.length + ' compétence' + (rows.length > 1 ? 's' : '') + ').');
            });
        });
    }

    // ------------------------------------------------------------ mise en forme et vérification

    function onFormat() {
        run(C.applyFormat, {format: R.FORMAT, scope: $('format-scope').value}, function (n) {
            status('Mise en forme 2027 appliquée à ' + (n || 0) + ' paragraphe' + (n > 1 ? 's' : '') + '.');
        });
    }

    function collectIssues(result) {
        var map = {}, out = [];
        (result.texts || []).forEach(function (text) {
            R.check(text).forEach(function (i) {
                var key = i.rule + '|' + i.found;
                if (map[key]) map[key].count++;
                else { i.count = 1; map[key] = i; out.push(i); }
            });
        });
        var fmt = function (rule, title, message, count, fix, found) {
            out.unshift({rule: rule, title: title, message: message, count: count, fix: fix, found: found || '', replacement: null});
        };
        var fonts = Object.keys(result.font || {});
        if (result.underline) fmt('souligne', 'Texte souligné', 'On évite le souligné : le gras sert à mettre en évidence (questions MDL, renvois aux annexes).', result.underline, 'underline');
        (result.latin || []).forEach(function (l) {
            fmt('latin', 'Locution latine « ' + l.text + ' »', 'Les locutions latines non francisées s\'écrivent en italique.', l.count, 'italic', l.text);
        });
        if (result.spacing) fmt('interligne', 'Interligne', 'L\'interligne est fixé à 1,15.', result.spacing, 'format');
        if (result.size) fmt('taille', 'Taille du texte', 'Le texte des exercices est en taille 12.', result.size, 'format');
        if (fonts.length) fmt('police', 'Police ' + fonts.join(', '), 'Le texte des exercices est en Arial.', fonts.reduce(function (s, f) { return s + result.font[f]; }, 0), 'format');
        if (result.justified) fmt('justifie', 'Texte justifié', 'Les textes sont alignés à gauche (non justifiés).', result.justified, 'format');
        return out;
    }

    function renderIssues() {
        var issues = state.issues;
        if (!issues.length) {
            $('analysis').innerHTML = '<p class="ok">Aucun écart détecté avec les règles typographiques.</p>';
            $('btn-fix-all').disabled = true;
            return;
        }
        $('analysis').innerHTML = issues.map(function (i, n) {
            var detail = i.replacement != null
                ? '<code>' + visible(i.found) + '</code> → <code>' + visible(i.replacement) + '</code>'
                : (i.found ? '<code>' + visible(i.found) + '</code>' : '');
            var fixable = !!i.fix;
            return '<div class="item">' +
                (fixable ? '<input type="checkbox" data-issue="' + n + '" checked>' : '<span style="width:13px"></span>') +
                '<div class="body"><div class="title">' + esc(i.title) + (i.count > 1 ? ' <span class="count">×' + i.count + '</span>' : '') + '</div>' +
                '<div class="msg">' + esc(i.message) + (fixable ? '' : ' <i>(à corriger à la main)</i>') + '</div>' +
                (detail ? '<div>' + detail + '</div>' : '') +
                (i.found ? '<button class="link" data-find="' + n + '">Voir dans le document</button>' : '') +
                '</div></div>';
        }).join('');
        $('btn-fix-all').disabled = false;
    }

    function onAnalyze() {
        status('Analyse du sujet…');
        run(C.analyze, {format: R.FORMAT, latin: R.LATIN_ITALIC}, function (json) {
            state.issues = collectIssues(parse(json, {texts: []}));
            renderIssues();
            status(state.issues.length ? state.issues.length + ' point' + (state.issues.length > 1 ? 's' : '') + ' à revoir.' : 'Sujet conforme.');
        });
    }

    function onFixSelected() {
        var chosen = Array.prototype.map.call(document.querySelectorAll('#analysis input[data-issue]:checked'), function (c) {
            return state.issues[+c.getAttribute('data-issue')];
        });
        var needFormat = chosen.some(function (i) { return i.fix === 'format'; });
        var fixes = chosen.filter(function (i) { return i.fix && i.fix !== 'format'; })
                          .map(function (i) { return {found: i.found, replacement: i.replacement, fix: i.fix}; });
        var finish = function () { status('Corrections appliquées.'); onAnalyze(); };
        var applyText = function () { fixes.length ? run(C.applyFixes, {fixes: fixes}, finish) : finish(); };
        if (needFormat) run(C.applyFormat, {format: R.FORMAT, scope: 'document'}, applyText);
        else applyText();
    }

    function onFind(i) {
        var issue = state.issues[i];
        if (issue && issue.found) plugin.executeMethod('SearchNext', [{searchString: issue.found, matchCase: true}, true]);
    }

    // ------------------------------------------------------------ événements

    function bind() {
        $('btn-format').onclick = onFormat;
        $('btn-analyze').onclick = onAnalyze;
        $('btn-fix-all').onclick = onFixSelected;
        $('btn-add-comp').onclick = onAddCompetence;
        $('new-label').onkeydown = function (e) { if (e.key === 'Enter') onAddCompetence(); };
        $('btn-preset').onclick = onPreset;
        $('btn-tag').onclick = function () { onTag(false); };
        $('btn-untag').onclick = function () { onTag(true); };
        $('btn-grid').onclick = onGrid;
        $('show-markers').onchange = onShowMarkers;
        $('competences').onclick = function (e) {
            var id = e.target.getAttribute && e.target.getAttribute('data-del');
            if (id) onDeleteCompetence(id);
        };
        $('analysis').onclick = function (e) {
            var i = e.target.getAttribute && e.target.getAttribute('data-find');
            if (i !== null && i !== undefined) onFind(+i);
        };
    }

    var timer = null;
    plugin.event_onTargetPositionChanged = function () {
        clearTimeout(timer);
        timer = setTimeout(function () { refresh(); }, 350);
    };

    plugin.onThemeChanged = function (theme) {
        plugin.onThemeChangedBase && plugin.onThemeChangedBase(theme);
        var root = document.documentElement.style;
        ['background-normal', 'background-toolbar', 'text-normal', 'text-secondary', 'border-regular-control'].forEach(function (k) {
            if (theme && theme[k]) root.setProperty('--' + k, theme[k]);
        });
    };

    plugin.init = function () {
        bind();
        refresh();
    };

    plugin.button = function () {};

    window.Examen2027Panel = {guessLabel: guessLabel, collectIssues: collectIssues, state: state, displayFor: displayFor, gridRows: gridRows};
})(window);
