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
        const candidates = (assets || []).filter(a => a.name.toLowerCase().endsWith(ext || '\0') && !/redist/i.test(a.name));
        return candidates.find(a => /kalyptik/i.test(a.name)) || candidates[0];
    }

    function escape(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function show(latest, asset, notesUrl) {
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
            <div data-status style="display:none;color:var(--text-secondary, #555);margin-bottom:12px"></div>
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
            if ( act == 'download' ) {
                const canInstall = asset && /-x64\.exe$/i.test(asset.name) &&
                    /^sha256:[0-9a-f]{64}$/i.test(asset.digest || '') &&
                    Number.isSafeInteger(asset.size) && asset.size > 0 && asset.size <= 1500000000 &&
                    window.sdk && typeof window.sdk.execCommand == 'function';
                if ( canInstall ) {
                    if ( !window.confirm('Télécharger et vérifier la mise à jour ? Une seconde confirmation sera demandée avant la fermeture des documents et l’installation.') )
                        return;
                    card.querySelector('[data-status]').textContent = 'Préparation du téléchargement…';
                    card.querySelector('[data-status]').style.display = 'block';
                    window.sdk.execCommand('kalyptik:update', JSON.stringify({
                        url: asset.browser_download_url,
                        digest: asset.digest,
                        size: asset.size,
                    }));
                } else if ( asset && asset.browser_download_url ) {
                    window.open(asset.browser_download_url);
                } else window.open(notesUrl);
            }
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
                show(latest, asset, rel.html_url);
            })
            .catch(() => {});   // hors ligne : on réessaiera plus tard
    }

    function onNativeMessage(cmd, param) {
        if ( cmd == 'app:update' ) {
            try {
                const div = document.createElement('div');
                div.innerHTML = param;
                const update = JSON.parse(div.textContent);
                const card = document.getElementById('kalyptik-update');
                const status = card && card.querySelector('[data-status]');
                if ( update.state == 'ready' ) {
                    if ( window.confirm('Le téléchargement est terminé et vérifié. Kalyptik Office va demander la sauvegarde des documents ouverts, se fermer, installer la mise à jour puis redémarrer. Continuer ?') )
                        window.sdk.execCommand('kalyptik:update-install', '');
                    else if ( status ) status.textContent = 'Mise à jour téléchargée ; installation annulée.';
                } else if ( update.state == 'downloading' && status ) {
                    status.textContent = update.progress >= 0 ?
                        `Téléchargement de la mise à jour… ${update.progress}%` :
                        'Téléchargement de la mise à jour…';
                } else if ( update.state == 'error' ) {
                    if ( status ) status.textContent = update.message || 'Le téléchargement ou la vérification a échoué.';
                    else window.alert(update.message || 'Le téléchargement ou la vérification a échoué.');
                }
            } catch (e) {
                const status = document.querySelector('#kalyptik-update [data-status]');
                if ( status ) status.textContent = 'La réponse du programme de mise à jour est invalide.';
                else window.alert('La réponse du programme de mise à jour est invalide.');
            }
            return;
        }
        if ( cmd != 'app:version' ) return;
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
