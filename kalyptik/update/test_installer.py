"""Exercise the generated Windows helper without launching a real installer."""
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class InstallerTests(unittest.TestCase):
    def test_visible_installer_outcomes(self):
        with tempfile.TemporaryDirectory(prefix='kalyptik-updater-test-') as folder:
            target = Path(folder)
            subprocess.run(['git', 'init', '-q', folder], check=True)
            patches = ROOT / 'kalyptik/patches/desktop-apps'
            first = patches / '0005-integrated-windows-updater.patch'
            for rel in re.findall(r'^\+\+\+ b/(.+)$', first.read_text(encoding='utf-8'), re.M):
                dest = target / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(subprocess.check_output(
                    ['git', '-C', str(ROOT / 'desktop-apps'), 'show', 'HEAD:' + rel]))
            for name in [first.name, '0006-visible-update-installer.patch']:
                subprocess.run(['git', '-C', folder, 'apply', str(patches / name)], check=True)
            source = (target / 'win-linux/src/cascapplicationmanagerwrapper.cpp').read_text(encoding='utf-8')
            body = source.split('const QString script = QStringLiteral(', 1)[1].split('.arg(', 1)[0]
            script = ''.join(json.loads(s) for s in re.findall(r'"(?:\\.|[^"\\])*"', body))
            script = script.replace('%1', "'C:/test/setup.exe'").replace('%2', "'C:/test/app.exe'").replace('%3', '12345')
            # Only intercept dialog display; the actual generated control flow runs unchanged.
            script = re.sub(r'Add-Type -AssemblyName System.Windows.Forms; .*? \| Out-Null', "$global:messageShown = $true", script)
            for code in ['0', '3010', '2', 'throw']:
                with self.subTest(outcome=code):
                    fake = "throw 'UAC cancelled'" if code == 'throw' else 'return [pscustomobject]@{ExitCode=' + code + '}'
                    harness = '''
$ErrorActionPreference = 'Stop'
$global:deleted = @()
$global:messageShown = $false
function Get-Process { param($Id, $ErrorAction) return $null }
function Remove-Item { param($LiteralPath, [switch]$Force) $global:deleted += $LiteralPath }
function Start-Process {
 param($FilePath, $ArgumentList, $Verb, $WindowStyle, [switch]$Wait, [switch]$PassThru, $ErrorAction)
 $global:launch = $PSBoundParameters
 ''' + fake + '''
}
''' + script + '''
[pscustomobject]@{launch=$global:launch; deleted=$global:deleted; message=$global:messageShown} | ConvertTo-Json -Compress -Depth 4
'''
                    path = target / 'harness.ps1'
                    path.write_text(harness, encoding='utf-8-sig')
                    result = subprocess.check_output(['powershell.exe', '-NoProfile', '-File', str(path)])
                    data = json.loads(result)
                    self.assertEqual(data['launch']['WindowStyle'], 'Normal')
                    self.assertEqual(data['launch']['Verb'], 'RunAs')
                    self.assertTrue(data['launch']['Wait'])
                    self.assertNotIn('/VERYSILENT', data['launch']['ArgumentList'])
                    self.assertNotIn('/SUPPRESSMSGBOXES', data['launch']['ArgumentList'])
                    self.assertEqual(data['launch']['FilePath'], 'C:/test/setup.exe')
                    self.assertEqual('C:/test/setup.exe' in data['deleted'], code in ['0', '3010'])
                    self.assertEqual(data['message'], code not in ['0', '3010'])


if __name__ == '__main__':
    unittest.main()
