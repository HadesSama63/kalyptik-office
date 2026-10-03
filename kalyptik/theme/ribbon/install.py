#!/usr/bin/env python3
"""Install the ribbon overlay before Grunt bundles the desktop editors.

Preflight all integration points before writing, and fail on upstream drift.
Run twice safely. Sources remain in kalyptik/; no submodule commit is required.
"""
import argparse
import base64
from pathlib import Path
import shutil

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
EDITORS = ('documenteditor', 'spreadsheeteditor', 'presentationeditor', 'pdfeditor', 'visioeditor')


def replace_once(text, before, after, path):
    if after in text:
        return text
    if text.count(before) != 1:
        raise RuntimeError(f'Point d’intégration modifié dans {path}: {before!r}')
    return text.replace(before, after, 1)


def install(root):
    common = root / 'web-apps/apps/common/main'
    mixtbar = common / 'lib/component/Mixtbar.js'
    text = mixtbar.read_text(encoding='utf-8')
    edits = (
        ("    'backbone',", "    'backbone',\n    'common/main/lib/component/KalyptikRibbon',"),
        ('], function (Backbone) {', '], function (Backbone, KalyptikRibbon) {'),
        ('                config.tabs = options.tabs;',
         '                KalyptikRibbon.decorate(this.$layout[0], options.config);\n\n'
         '                config.tabs = options.tabs;'),
    )
    for before, after in edits:
        text = replace_once(text, before, after, mixtbar)
    writes = {mixtbar: text}
    for editor in EDITORS:
        app = root / 'web-apps/apps' / editor / 'main/resources/less/app.less'
        source = app.read_text(encoding='utf-8')
        marker = '@import "../../../../common/main/resources/less/kalyptik/ribbon.less";'
        if marker not in source:
            source = source.rstrip() + '\n\n// Kalyptik ribbon overlay (installed at build time).\n' + marker + '\n'
        writes[app] = source

    assets = ('ribbon.less', 'plus-jakarta-sans-latin-wght-normal.woff2', 'FONT-LICENSE.txt')
    for name in ('KalyptikRibbon.js', *assets):
        if not (HERE / name).is_file():
            raise FileNotFoundError(HERE / name)
    target = common / 'resources/less/kalyptik'
    target.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(HERE / 'KalyptikRibbon.js', common / 'lib/component/KalyptikRibbon.js')
    for name in assets:
        shutil.copyfile(HERE / name, target / name)
    css = (HERE / 'ribbon.less').read_text(encoding='utf-8')
    font = base64.b64encode((HERE / assets[1]).read_bytes()).decode('ascii')
    writes[target / 'ribbon.less'] = replace_once(
        css, 'KALYPTIK_FONT_BASE64', font, HERE / 'ribbon.less')
    for path, content in writes.items():
        path.write_text(content, encoding='utf-8', newline='\n')
    print(f'Rubans Kalyptik : {len(EDITORS)} éditeurs, police locale et groupes installés.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    install(parser.parse_args().root.resolve())
