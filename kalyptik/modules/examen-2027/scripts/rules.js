/*
 * Examen 2027 — règles typographiques des sujets d'examens de mathématiques.
 * Source : « Règles typographiques à respecter pour les énoncés des sujets
 * d'examens en mathématiques ». Fonctions pures, testées par tests/rules.test.js.
 *
 * check(text) renvoie une liste de problèmes :
 *   {rule, title, message, found, replacement, fix}
 *   - found       : texte exact trouvé (avec un peu de contexte) ;
 *   - replacement : texte corrigé, ou null si la correction est manuelle ;
 *   - fix         : 'replace' (remplacement simple), 'ordinal' (remplacement
 *                   puis exposant sur le suffixe), ou null (à vérifier).
 */
(function (root) { 'use strict';
    var NBSP = ' ';   // espace insécable (avant « : », dans les guillemets, milliers)
    var NNBSP = ' ';  // espace fine insécable (avant « ; ! ? »)
    var SPACES = '    ';

    function issue(rule, title, message, found, replacement, fix) {
        return {rule: rule, title: title, message: message, found: found,
                replacement: replacement === undefined ? null : replacement,
                fix: fix === undefined ? (replacement == null ? null : 'replace') : fix};
    }

    function each(re, text, fn) {
        var m, out = [];
        re.lastIndex = 0;
        while ((m = re.exec(text))) {
            var r = fn(m);
            if (r) out.push(r);
            if (m[0] === '') re.lastIndex++;
        }
        return out;
    }

    // Ponctuation haute ; ! ? : précédée d'une espace insécable (fine pour ; ! ?)
    function highPunctuation(text) {
        return each(/([^\s   («\[])( ?)([;!?:])(?!\/\/)/g, text, function (m) {
            var sign = m[3];
            if (sign == ':' && /\d/.test(m[1]) && /^\d/.test(text.slice(m.index + m[0].length))) return null; // 10:30
            if (sign == '?' && /[?!]/.test(m[1])) return null;                                                 // ?!
            var space = sign == ':' ? NBSP : NNBSP;
            return issue('ponctuation-haute', 'Espace avant « ' + sign + ' »',
                sign == ':' ? 'Les deux-points sont précédés d\'une espace insécable.'
                            : 'Les signes « ; ! ? » sont précédés d\'une espace fine insécable.',
                m[0], m[1] + space + sign);
        });
    }

    // Ponctuation haute suivie d'une espace (sauf fin, ponctuation, guillemet ou parenthèse fermants)
    function afterHighPunctuation(text) {
        return each(/([;!?])([A-Za-zÀ-ÿ0-9«(])/g, text, function (m) {
            return issue('ponctuation-apres', 'Espace après « ' + m[1] + ' »',
                'Un signe de ponctuation est suivi d\'une espace.', m[0], m[1] + ' ' + m[2]);
        });
    }

    // Virgule et point : collés à gauche, suivis d'une espace
    function lowPunctuation(text) {
        var out = each(/([A-Za-zÀ-ÿ0-9)\]»])[   ]+([,.])(?=\s|$)/g, text, function (m) {
            if (/\d/.test(m[1]) && /^[   ]?\d/.test(text.slice(m.index + m[0].length))) return null; // 3 , 5
            return issue('ponctuation-basse', 'Espace avant « ' + m[2] + ' »',
                'La virgule et le point sont collés au mot qui précède.', m[0], m[1] + m[2]);
        });
        out = out.concat(each(/([A-Za-zÀ-ÿ]{2,}),([A-Za-zÀ-ÿ]{2,})/g, text, function (m) {
            return issue('ponctuation-basse', 'Espace après la virgule',
                'La virgule est suivie d\'une espace.', m[0], m[1] + ', ' + m[2]);
        }));
        // Nombre décimal : la virgule n'est ni précédée ni suivie d'un blanc
        out = out.concat(each(/(\d)[   ]+,[   ]?(\d)/g, text, function (m) {
            return issue('nombre-decimal', 'Virgule décimale',
                'Dans un nombre décimal, la virgule n\'est ni précédée ni suivie d\'un blanc.', m[0], m[1] + ',' + m[2]);
        }));
        return out;
    }

    // Parenthèses et crochets collés au texte intérieur
    function brackets(text) {
        var out = each(/([(\[])[  ]+(\S)/g, text, function (m) {
            return issue('parentheses', 'Espace après « ' + m[1] + ' »',
                'Les parenthèses et crochets sont collés au texte intérieur.', m[0], m[1] + m[2]);
        });
        return out.concat(each(/(\S)[  ]+([)\]])/g, text, function (m) {
            if (/[;!?:]/.test(m[1])) return null;
            return issue('parentheses', 'Espace avant « ' + m[2] + ' »',
                'Les parenthèses et crochets sont collés au texte intérieur.', m[0], m[1] + m[2]);
        }));
    }

    // Guillemets français « » avec espaces insécables ; pas de guillemets anglais au premier niveau
    function quotes(text) {
        var out = each(/«(?:[  ]?)(\S)/g, text, function (m) {
            if (m[0] == '«' + NBSP + m[1]) return null;
            return issue('guillemets', 'Espace après « « »',
                'Le guillemet ouvrant est suivi d\'une espace insécable.', m[0], '«' + NBSP + m[1]);
        });
        out = out.concat(each(/(\S)(?:[  ]?)»/g, text, function (m) {
            if (m[0] == m[1] + NBSP + '»' || m[1] == NBSP) return null;
            return issue('guillemets', 'Espace avant « » »',
                'Le guillemet fermant est précédé d\'une espace insécable.', m[0], m[1] + NBSP + '»');
        }));
        return out.concat(each(/[“"]([^”"\n]{1,200})[”"]/g, text, function (m) {
            return issue('guillemets', 'Guillemets anglais',
                'Dans un texte français, on emploie les guillemets « » (les anglais seulement au second niveau).',
                m[0], '«' + NBSP + m[1].trim() + NBSP + '»');
        }));
    }

    // Ordinaux : 1er, 1re, 2e… (suffixe en exposant) ; n-ième
    function ordinals(text) {
        var out = each(/\b(1)(ère|ere|ière|iere)(?![A-Za-zÀ-ÿ])/g, text, function (m) {
            return issue('ordinal', 'Ordinal « ' + m[0] + ' »', 'On écrit 1re (et non 1ère), avec « re » en exposant.',
                m[0], '1re', 'ordinal');
        });
        out = out.concat(each(/\b(\d+)(ème|eme|ième|ieme|iè|è)(s?)(?![A-Za-zÀ-ÿ])/g, text, function (m) {
            return issue('ordinal', 'Ordinal « ' + m[0] + ' »', 'On écrit 2e, 3e… (et non 2ème), avec « e » en exposant.',
                m[0], m[1] + 'e' + m[3], 'ordinal');
        }));
        return out.concat(each(/\b([a-z])(ème|ième|eme)(?![A-Za-zÀ-ÿ])/g, text, function (m) {
            if (m[1] == 'i' || m[1] == 'j') return issue('ordinal', 'Ordinal « ' + m[0] + ' »',
                'Exceptions : i-ème, j-ème.', m[0], m[1] + '-ème');
            return issue('ordinal', 'Ordinal « ' + m[0] + ' »',
                'Un ordinal contenant une variable s\'écrit sans exposant : n-ième, p-ième.', m[0], m[1] + '-ième');
        }));
    }

    // Unités : symboles (min, h, s, L, mL, €), pas d'abréviation ni de point
    function units(text) {
        var out = each(/(\d)([   ]?)mn\b/g, text, function (m) {
            return issue('unite', 'Unité « mn »', 'La minute se note min (et non mn).', m[0], m[1] + m[2] + 'min');
        });
        out = out.concat(each(/(\d)([   ]?)H\b(?!\s?[A-Z])/g, text, function (m) {
            return issue('unite', 'Unité « H »', 'L\'heure se note h (et non H).', m[0], m[1] + m[2] + 'h');
        }));
        out = out.concat(each(/(\d)([   ]?)(EUR|E)\b(?![a-zà-ÿ])/g, text, function (m) {
            return issue('unite', 'Euro', 'L\'euro se note € (et non E ni EUR).', m[0], m[1] + m[2] + '€');
        }));
        out = out.concat(each(/(\d+)[   ]?€[   ]?(\d{2})\b/g, text, function (m) {
            return issue('unite', 'Somme d\'argent', 'Une somme s\'écrit 3,55 € (et non 3 € 55).', m[0], m[1] + ',' + m[2] + NBSP + '€');
        }));
        return out.concat(each(/(\d)[   ]?(km|cm|mm|kg|mg|min|ml|mL|cl|dl)\.(?=\s+[a-zà-ÿ])/g, text, function (m) {
            return issue('unite', 'Point après une unité', 'Les symboles d\'unité ne sont pas suivis d\'un point.',
                m[0], m[0].slice(0, -1));
        }));
    }

    // Nombres : tranches de 3 chiffres séparées par une espace insécable (partie entière)
    function groupDigits(int) {
        return int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    }
    function numbers(text) {
        var out = each(/(^|[^\d,. \/])(\d{5,})(?![\d])/g, text, function (m) {
            return issue('milliers', 'Nombre « ' + m[2] + ' »',
                'Les nombres s\'écrivent par tranches de 3 chiffres séparées par une espace insécable.',
                m[2], groupDigits(m[2]));
        });
        return out.concat(each(/\b(\d{1,3})((?: \d{3})+)(?![\d])/g, text, function (m) {
            return issue('milliers', 'Séparateur de milliers',
                'Les tranches de 3 chiffres sont séparées par une espace insécable (Ctrl+Maj+Espace).',
                m[0], m[0].replace(/ /g, NBSP));
        }));
    }

    // Multiplication : signe × et non la lettre x
    function multiplication(text) {
        return each(/(\d)([  ]?)[xX]([  ]?)(\d)/g, text, function (m) {
            return issue('multiplication', 'Signe de multiplication',
                'Pour multiplier, on emploie le signe × (et non la lettre x).', m[0], m[1] + m[2] + '×' + m[3] + m[4]);
        });
    }

    // Opérateurs dans le texte courant (à réserver aux formules centrées)
    function operators(text) {
        return each(/[A-Za-zÀ-ÿ]{3,}\s([=≤≥≠<>])\s[A-Za-zÀ-ÿ]{3,}/g, text, function (m) {
            return issue('operateur', 'Opérateur « ' + m[1] + ' » dans le texte',
                'Les opérateurs =, ≤, ≥… ne tiennent pas lieu de verbes dans le texte : à rédiger en français.', m[0], null);
        });
    }

    var TEXT_RULES = [highPunctuation, afterHighPunctuation, lowPunctuation, brackets, quotes,
                      ordinals, units, numbers, multiplication, operators];

    function check(text) {
        var out = [], seen = {};
        TEXT_RULES.forEach(function (rule) {
            rule(String(text || '')).forEach(function (i) {
                var key = i.rule + '|' + i.found;
                if (!seen[key]) { seen[key] = true; out.push(i); }
            });
        });
        return out;
    }

    // Locutions latines non francisées : en italique dans un texte en romain
    var LATIN_ITALIC = ['a priori', 'a fortiori', 'a posteriori', 'a contrario', 'i.e.', 'in fine', 'de facto', 'ad hoc'];

    var FORMAT = {font: 'Arial', sizeHalfPoints: 24, lineSpacing: 276, lineRule: 'auto', align: 'left'};

    var api = {check: check, groupDigits: groupDigits, LATIN_ITALIC: LATIN_ITALIC, FORMAT: FORMAT, NBSP: NBSP, NNBSP: NNBSP};
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Examen2027Rules = api;
})(this);
