"""Run: python -m unittest discover -s kalyptik/theme/ribbon/tests"""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ribbon_install', SOURCE / 'install.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.mixtbar = self.root / 'web-apps/apps/common/main/lib/component/Mixtbar.js'
        self.mixtbar.parent.mkdir(parents=True)
        self.mixtbar.write_text(
            "define([\n    'backbone',\n], function (Backbone) {\n"
            '                config.tabs = options.tabs;\n});\n', encoding='utf-8')
        for editor in installer.EDITORS:
            app = self.root / f'web-apps/apps/{editor}/main/resources/less/app.less'
            app.parent.mkdir(parents=True)
            app.write_text('/* upstream styles */\n', encoding='utf-8')

    def snapshot(self):
        return {str(p.relative_to(self.root)): p.read_bytes()
                for p in self.root.rglob('*') if p.is_file()}

    def test_install_is_idempotent_and_embeds_font(self):
        installer.install(self.root)
        first = self.snapshot()
        installer.install(self.root)
        self.assertEqual(first, self.snapshot())
        css = self.root / 'web-apps/apps/common/main/resources/less/kalyptik/ribbon.less'
        self.assertIn('data:font/woff2;base64,d09GMg', css.read_text(encoding='utf-8'))
        self.assertNotIn('KALYPTIK_FONT_BASE64', css.read_text(encoding='utf-8'))
        self.assertEqual(self.mixtbar.read_text().count('KalyptikRibbon.decorate'), 1)

    def test_upstream_drift_fails_before_writing(self):
        self.mixtbar.write_text('// changed upstream component\n', encoding='utf-8')
        before = self.snapshot()
        with self.assertRaises(RuntimeError):
            installer.install(self.root)
        self.assertEqual(before, self.snapshot())

    def test_missing_editor_fails_before_writing(self):
        (self.root / 'web-apps/apps/pdfeditor/main/resources/less/app.less').unlink()
        before = self.snapshot()
        with self.assertRaises(FileNotFoundError):
            installer.install(self.root)
        self.assertEqual(before, self.snapshot())


if __name__ == '__main__':
    unittest.main()
