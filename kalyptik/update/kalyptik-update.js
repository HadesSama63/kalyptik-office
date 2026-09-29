/*
 * Kalyptik Office : avertit l'utilisateur quand une nouvelle version est publiée.
 *
 * Au démarrage (puis toutes les 12 h), compare la version installée à la
 * dernière version publiée sur GitHub (Releases du dépôt Kalyptik Office) et
 * affiche une carte « Nouvelle version disponible » avec le lien de
 * téléchargement du bon paquet (installeur Windows, .deb, .rpm).
 * Voir kalyptik/update/README.md.
 */
+function () { 'use strict';
    const REPO = 'HadesSama63/kalyptik-office';
    const API = `https://api.github.com/repos/${REPO}/releases/latest`;
    const INTERVAL = 12 * 3600 * 1000;
    const DISMISSED = 'kalyptik-update-dismissed';

    const numbers = v => (String(v).match(/\d+/g) || []).map(Number);
    const isNewer = (a, b) => {
        const x = numbers(a), y = numbers(b);
        for ( let i = 0; i < Math.max(x.length, y.length); i++ ) {
            const d = (x[i] || 0) - (y[i] || 0);
            if ( d ) return d > 0;
        }
        return false;
    };

    const storage = {
        get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    };

    function pickAsset(assets, app) {
        const pkg = (app.pkg || '').toLowerCase();
        const ext = pkg == 'deb' ? '.deb' : pkg == 'rpm' ? '.rpm' :
                    (pkg == 'exe' || /win/i.test(navigator.platform)) ? '.exe' : null;
        return ext && (assets || []).find(a => a.name.toLowerCase().endsWith(ext));
    }

    function escape(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function show(latest, downloadUrl, notesUrl) {
        document.getElementById('kalyptik-update') && document.getElementById('kalyptik-update').remove();
        const card = document.createElement('div');
        card.id = 'kalyptik-update';
        card.setAttribute('role', 'status');
        card.style.cssText = [
            'position:fixed', 'right:20px', 'bottom:20px', 'z-index:1000', 'max-width:340px',
            'padding:16px 18px', 'border-radius:12px', 'font-size:13px', 'line-height:1.45',
            'background:var(--background-normal-element-light, #fff)', 'color:var(--text-normal, #000)',
            'border:1px solid var(--border-regular-control, #ccc)', 'box-shadow:0 8px 24px rgba(0,0,0,.18)',
        ].join(';');
        card.innerHTML = `
            <div style="font-weight:600;font-size:14px;margin-bottom:4px">Nouvelle version disponible</div>
            <div style="color:var(--text-secondary, #555);margin-bottom:12px">
                Kalyptik Office ${escape(latest)} apporte les dernières nouveautés et corrections.</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <button data-act="download" style="border:0;border-radius:6px;padding:6px 14px;cursor:pointer;
                    background:var(--background-primary-button, #1D748F);color:var(--text-inverse, #fff)">Télécharger</button>
                <a href="#" data-act="notes" class="link" style="color:var(--text-link, #1D748F)">Nouveautés</a>
                <a href="#" data-act="later" style="margin-left:auto;color:var(--text-secondary, #555)">Plus tard</a>
            </div>`;
        card.addEventListener('click', e => {
            const act = e.target.getAttribute && e.target.getAttribute('data-act');
            if ( !act ) return;
            e.preventDefault();
            if ( act == 'download' ) window.open(downloadUrl);
            else if ( act == 'notes' ) window.open(notesUrl);
            else { storage.set(DISMISSED, latest); card.remove(); }
        });
        document.body.appendChild(card);
    }

    let app = null, timer = null;

    function check() {
        if ( !app || !app.version || typeof fetch != 'function' ) return;
        fetch(API, {headers: {Accept: 'application/vnd.github+json'}, cache: 'no-store'})
            .then(r => r.ok ? r.json() : null)
            .then(rel => {
                if ( !rel || rel.draft || rel.prerelease || !rel.tag_name ) return;
                const latest = rel.tag_name.replace(/^v/i, '');
                if ( !isNewer(latest, app.version) || storage.get(DISMISSED) == latest ) return;
                const asset = pickAsset(rel.assets, app);
                show(latest, asset ? asset.browser_download_url : rel.html_url, rel.html_url);
            })
            .catch(() => {});   // hors ligne : on réessaiera plus tard
    }

    function onNativeMessage(cmd, param) {
        if ( !/^app:version$/.test(cmd) ) return;
        try {
            const div = document.createElement('div');
            div.innerHTML = param;
            app = JSON.parse(div.textContent);
        } catch (e) { return; }
        check();
        timer || (timer = setInterval(check, INTERVAL));
    }

    if ( window.sdk && typeof window.sdk.on == 'function' )
        window.sdk.on('on_native_message', onNativeMessage);

    window.KalyptikUpdate = {isNewer: isNewer, check: check};
}();
