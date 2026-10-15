/*
 * Kalyptik Office : polices manquantes à l'ouverture d'un document (KalyptWrite).
 *
 * Compare les polices utilisées par le texte du document à celles installées :
 *  - police libre connue      -> proposée au téléchargement (dossier personnel
 *                                kalyptik-fonts, pris en compte au redémarrage) ;
 *  - police scolaire gratuite -> lien pour la trouver (redistribution interdite) ;
 *  - police Microsoft          -> équivalent libre conseillé ;
 *  - police inconnue           -> avertissement (peut-être payante).
 * Le catalogue est ci-dessous ; voir kalyptik/fonts/README.md.
 */
+function () { 'use strict';
    if ( !window.AscDesktopEditor ) return;

    const GF = 'https://raw.githubusercontent.com/google/fonts/main/';
    const styles4 = (dir, base) => ['Regular', 'Bold', 'Italic', 'BoldItalic'].map(s => `${GF}${dir}/${base}-${s}.ttf`);

    // Polices libres (OFL / Apache) téléchargeables : nom -> fichiers
    const FREE = {
        'Lato': styles4('ofl/lato', 'Lato'),
        'Poppins': styles4('ofl/poppins', 'Poppins'),
        'Carlito': styles4('ofl/carlito', 'Carlito'),
        'Caladea': styles4('ofl/caladea', 'Caladea'),
        'Patrick Hand': [GF + 'ofl/patrickhand/PatrickHand-Regular.ttf'],
        'Delius': [GF + 'ofl/delius/Delius-Regular.ttf'],
        'Schoolbell': [GF + 'apache/schoolbell/Schoolbell-Regular.ttf'],
        'Indie Flower': [GF + 'ofl/indieflower/IndieFlower-Regular.ttf'],
        'Architects Daughter': [GF + 'ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf'],
        'Gloria Hallelujah': [GF + 'ofl/gloriahallelujah/GloriaHallelujah.ttf'],
        'Amatic SC': [GF + 'ofl/amaticsc/AmaticSC-Regular.ttf', GF + 'ofl/amaticsc/AmaticSC-Bold.ttf'],
        'Kalam': [GF + 'ofl/kalam/Kalam-Regular.ttf', GF + 'ofl/kalam/Kalam-Bold.ttf'],
        'Sniglet': [GF + 'ofl/sniglet/Sniglet-Regular.ttf'],
        'Short Stack': [GF + 'ofl/shortstack/ShortStack-Regular.ttf'],
        'Coming Soon': [GF + 'apache/comingsoon/ComingSoon-Regular.ttf'],
    };

    // Polices scolaires gratuites mais non redistribuables : préfixe du nom -> nom affiché
    const SCHOOL = {
        'belleallure': 'Belle Allure', 'ecolier': 'Écolier', 'cursivestandard': 'Cursive standard',
        'acceseditions': 'Accès Éditions', 'luciole': 'Luciole', 'seyes': 'Seyès', 'scriptecole': 'Script école',
    };

    // Polices Microsoft (non redistribuables) : équivalent libre
    const MICROSOFT = {
        'calibri': 'Carlito', 'cambria': 'Caladea', 'arial': 'Liberation Sans', 'timesnewroman': 'Liberation Serif',
        'couriernew': 'Liberation Mono', 'comicsansms': 'Comic Neue', 'centurygothic': 'Poppins',
        'verdana': 'Atkinson Hyperlegible', 'tahoma': 'Atkinson Hyperlegible', 'segoeui': 'Lato',
        'trebuchetms': 'Lato', 'georgia': 'Caladea', 'gillsansmt': 'Lato', 'garamond': 'Caladea',
        'bookantiqua': 'Caladea', 'candara': 'Lato', 'corbel': 'Lato', 'constantia': 'Caladea',
    };

    const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefixMatch = (map, name) => { const n = norm(name); for ( const k in map ) if ( n.startsWith(k) ) return map[k]; return null; };
    const freeEntry = name => { const n = norm(name); for ( const k in FREE ) if ( norm(k) == n ) return [k, FREE[k]]; return null; };
    const storage = {
        get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    };
    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    function documentFonts(api) {
        const doc = api.WordControl && api.WordControl.m_oLogicDocument;
        const fonts = {};
        if ( !doc || !doc.GetAllParagraphs ) return fonts;
        doc.GetAllParagraphs({All: true}).forEach(para => {
            para.CheckRunContent && para.CheckRunContent(run => {
                if ( run.Is_Empty && run.Is_Empty() ) return;
                const pr = run.Get_CompiledPr && run.Get_CompiledPr(false);
                const name = pr && pr.RFonts && pr.RFonts.Ascii && pr.RFonts.Ascii.Name;
                if ( name && name[0] != '+' ) fonts[name] = true;
            });
        });
        return fonts;
    }

    function installedFonts() {
        const map = (window.AscFonts && AscFonts.g_map_font_index) || {};
        const set = {};
        Object.keys(map).forEach(n => set[norm(n)] = true);
        return set;
    }

    function classify(missing) {
        const out = {free: [], school: [], microsoft: [], unknown: []};
        missing.forEach(name => {
            const f = freeEntry(name), s = prefixMatch(SCHOOL, name), m = MICROSOFT[norm(name)];
            if ( f ) out.free.push({name: f[0], files: f[1]});
            else if ( s ) out.school.push({name, label: s});
            else if ( m ) out.microsoft.push({name, alt: m});
            else out.unknown.push({name});
        });
        return out;
    }

    // Télécharge dans <données utilisateur>/kalyptik-fonts (créé par l'application).
    // Le dossier est déduit du chemin d'un premier fichier temporaire (dossier
    // de récupération du document : <données>/recover/<document>/...).
    function download(urls, done) {
        const ade = window.AscDesktopEditor;
        ade.DownloadFiles([urls[0]], [], files => {
            const tmp = String(Object.values(files || {})[0] || '').replace(/\\/g, '/');
            const m = tmp.match(/^(.*)\/recover\//i);
            ade.RemoveFile && tmp && ade.RemoveFile(tmp);
            if ( !m ) return done(false);
            const dir = m[1] + '/kalyptik-fonts/';
            ade.DownloadFiles(urls, urls.map(u => dir + decodeURIComponent(u.split('/').pop())),
                res => done(Object.keys(res || {}).length > 0));
        });
    }

    function show(groups, key) {
        const old = document.getElementById('kalyptik-fonts');
        old && old.remove();
        const card = document.createElement('div');
        card.id = 'kalyptik-fonts';
        card.setAttribute('role', 'dialog');
        card.style.cssText = ['position:fixed', 'right:20px', 'bottom:40px', 'z-index:10000', 'width:380px',
            'max-height:70vh', 'overflow:auto', 'padding:16px 18px', 'border-radius:12px', 'font-size:12px',
            'font-family:var(--font-family-base, Arial, Helvetica, sans-serif)',
            'line-height:1.45', 'background:var(--background-normal, #fff)', 'color:var(--text-normal, #000)',
            'border:1px solid var(--border-regular-control, #ccc)', 'box-shadow:0 8px 24px rgba(0,0,0,.2)'].join(';');
        const sub = 'color:var(--text-secondary, #555)';
        const link = 'color:var(--text-link, #1D748F);cursor:pointer;text-decoration:underline';
        let html = `<div style="font-weight:600;font-size:14px;margin-bottom:6px">Polices manquantes</div>
            <div style="${sub};margin-bottom:10px">Ce document utilise des polices absentes de cet ordinateur :
            elles sont remplacées, la mise en page peut différer de l'original.</div>`;
        if ( groups.free.length )
            html += `<div style="margin-bottom:8px"><b>Polices libres</b> : ${groups.free.map(f => esc(f.name)).join(', ')}<br>
                <button data-act="install" style="margin-top:6px;border:0;border-radius:6px;padding:5px 12px;cursor:pointer;
                background:var(--background-primary-dialog-button, #1D748F);color:#fff">Télécharger et installer</button>
                <span data-status style="${sub};margin-left:6px"></span></div>`;
        if ( groups.school.length )
            html += `<div style="margin-bottom:8px"><b>Polices scolaires</b> (gratuites, à télécharger sur le site de leur auteur) :<br>` +
                groups.school.map(s => `${esc(s.name)} — <a data-url="https://duckduckgo.com/?q=${encodeURIComponent('police ' + s.label + ' télécharger')}" style="${link}">trouver la police</a>`).join('<br>') + `</div>`;
        if ( groups.microsoft.length )
            html += `<div style="margin-bottom:8px"><b>Polices Microsoft</b> (fournies avec Windows ou Office, non téléchargeables ici) :<br>` +
                groups.microsoft.map(m => `${esc(m.name)} — équivalent libre : ${esc(m.alt)}`).join('<br>') + `</div>`;
        if ( groups.unknown.length )
            html += `<div style="margin-bottom:8px"><b>Autres polices</b> : ${groups.unknown.map(u => esc(u.name)).join(', ')}<br>
                <span style="${sub}">Peut-être payantes : demandez la police à l'auteur du document ou installez-la si vous en avez la licence.</span></div>`;
        html += `<div style="display:flex;gap:12px;justify-content:flex-end;margin-top:6px">
            <a data-act="never" style="${link}">Ne plus signaler ces polices</a>
            <a data-act="close" style="${link}">Fermer</a></div>`;
        card.innerHTML = html;
        card.addEventListener('click', e => {
            const t = e.target, act = t.getAttribute && t.getAttribute('data-act'), url = t.getAttribute && t.getAttribute('data-url');
            if ( url ) { e.preventDefault(); window.open(url); return; }
            if ( act == 'close' ) card.remove();
            else if ( act == 'never' ) { storage.set('kalyptik-fonts-ignored:' + key, '1'); card.remove(); }
            else if ( act == 'install' ) {
                const status = card.querySelector('[data-status]');
                t.disabled = true; status.textContent = 'Téléchargement…';
                const urls = [].concat(...groups.free.map(f => f.files));
                download(urls, ok => {
                    status.textContent = ok ? 'Installées : redémarrez Kalyptik Office pour les utiliser.'
                                            : 'Échec du téléchargement (connexion ?).';
                    t.disabled = ok;
                });
            }
        });
        document.body.appendChild(card);
    }

    function check(api) {
        try {
            const installed = installedFonts();
            if ( !Object.keys(installed).length ) return;
            const missing = Object.keys(documentFonts(api)).filter(n => !installed[norm(n)]).sort();
            if ( !missing.length ) return;
            const key = missing.map(norm).join(',');
            if ( storage.get('kalyptik-fonts-ignored:' + key) ) return;
            show(classify(missing), key);
        } catch (e) { console.log('kalyptik-fonts', e); }
    }

    let tries = 0;
    const wait = setInterval(() => {
        const api = window.editor;
        if ( api && api.asc_registerCallback ) {
            clearInterval(wait);
            api.asc_registerCallback('asc_onDocumentContentReady', () => setTimeout(() => check(api), 500));
        } else if ( ++tries > 240 ) clearInterval(wait);
    }, 250);

    window.KalyptikFonts = {classify: classify, norm: norm};
}();
