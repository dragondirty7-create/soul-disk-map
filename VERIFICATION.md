# Soul Disk Map — verification report

Date: 2026-09-15. Everything below was observed on this machine, not inferred.

## Upstream version

| | |
|---|---|
| Repository | https://github.com/windirstat/windirstat |
| Tag | `release/v2.8.0` (newest **stable** tag) |
| Commit | `579dd76d6870b4efbb9497644698155fdab84284` |
| Tag date | 2026-08-02 |
| Newer tags not used | `beta/v2.8.1` … `beta/v2.8.5` (all beta) |

The running binary independently confirms this: its About dialog prints
`Git Commit: 579dd76d6870b4efbb9497644698155fdab84284`, captured at build time
by the project's own MSBuild step.

## Toolchain

| | |
|---|---|
| Visual Studio 2022 Build Tools | 17.14.37710.0 |
| MSVC | 14.44.35207, toolset `v143` |
| Components | VCTools, VC.Tools.x86.x64, **VC.ATLMFC**, Windows 11 SDK 22621 |
| CMake | not required, not installed |

Build command (portable, production labelling as upstream ships it):

```
msbuild windirstat.sln /p:Configuration=Release /p:Platform=x64 /p:ExternalCompilerOptions=/DPRODUCTION=1
```

## Artifact

| | |
|---|---|
| Path | `portable/SoulDiskMap-x64/SoulDiskMap.exe` |
| Size | 4,530,688 bytes |
| SHA-256 | `851147d83def7911047f0844095221ca5ad3ef3a281f209f0c3653f748267c88` |
| Dependencies | none — MFC linked statically (`UseOfMfc=Static`) |

`LICENSE.md` and `CONTRIBUTORS.md` are shipped alongside the executable.

## Verified

| Check | Result | How |
|---|---|---|
| Launches | Pass | Process starts, main window appears |
| Window title | **"Soul Disk Map 2.8.0"** | Read from the live window (`MainWindowTitle`), and visible in the captured title bar |
| Icon | Pass | Dark teal disk-map icon renders in the title bar and in the About dialog — see `verify-titlebar.png` |
| About caption | **"About Soul Disk Map"** | Live window text of the dialog |
| About branding line | **"Soul Disk Map — based on WinDirStat"**, first line | `verify-about.png` |
| Upstream credits intact | Pass | Same dialog still shows "WinDirStat - Directory Statistics", the tagline, "Programmed for Microsoft Windows by Bernhard Seifert, Oliver Schneider, Bryan Berns", the KDirStat / Stefan Hundhammer attribution, windirstat.net, and "Copyright © WinDirStat Team" |
| License notices | Pass | About dialog retains its **License** tab; `LICENSE.md`, `res/license.txt`, `CONTRIBUTORS.md` show a zero-byte `git diff` |
| Scan correctness | Pass | See below |
| Patch reproducibility | Pass | Applied to a clean `release/v2.8.0` checkout in a throwaway clone; icon byte-identical (md5 match) |

### Scan test

Scanned `test-scan-folder/` (created for this test; none of your real data was
touched) via `SoulDiskMap.exe <path> /saveto scan-result.csv`:

| Reported | Expected | Match |
|---|---|---|
| 5 files, 4 folders | 5 files, 4 folders | yes |
| 4,600,020 logical bytes | 4,600,020 | exact |
| `alpha` 3,000,000 | 3,000,000 | yes |
| `beta` 1,500,000 (incl. `nested` 500,000) | 1,500,000 | yes |
| `gamma` 100,000 | 100,000 | yes |
| `readme.txt` 20 | 20 | yes |

Full output in `scan-result.csv`.

## Known side effect (functional, minor)

The CSV export column `WinDirStat Attributes` is now written as
**`Soul Disk Map Attributes`**. That column name is derived from the app title
string (`AFX_IDS_APP_TITLE`) in `CsvLoader.cpp`, so renaming the app renames the
column.

Consequence: CSV interchange with a stock WinDirStat build loses *that one
column*. `CsvLoader` looks the header up in a map and silently skips unknown
columns, so nothing crashes and every other field still loads — but the
WinDirStat-specific attribute flags would not carry across in either direction.

This was **not** fixed, because decoupling the column name from the app title
requires a source change and the agreed scope is cosmetic branding only. Flagging
it rather than silently widening scope. If CSV parity matters, say so and it is a
small, contained follow-up.

## Not built / not tested

- **x86 and ARM64** — only x64 was built.
- **Deletion and cleanup** — deliberately untested, per instruction. No delete,
  move, reorganize, format, or migrate operation was performed at any point.
- **MSI / MSIX / code signing / 7-Zip archives** — skipped on purpose; the repo's
  `build.cmd` does all of these and was not used.
- **Non-English UI** — only `lang_en.txt` was rebranded. Other languages keep the
  upstream About text. The window title is language-neutral and reads "Soul Disk
  Map" everywhere.
- **File properties / version metadata** — `version.rc` was left untouched, so
  Explorer's Details tab still reports WinDirStat and the upstream version. This
  was intentional.
- **Long-running or whole-drive scans** — only the small test folder was scanned.

## Note on an earlier build failure

The first build attempt failed with `C1083: Cannot open compiler intermediate
file ... .pch: Invalid argument`. This was transient contention with the Visual
Studio installer still finalizing; a clean rebuild after the installer fully
exited succeeded with no source changes. Recorded here so the error is not
mistaken for a defect in the patch.
