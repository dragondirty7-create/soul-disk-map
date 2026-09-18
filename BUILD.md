# Soul Disk Map — build instructions

A personal-use cosmetic rebrand of WinDirStat. Branding only: window title, icon,
and one added About line. Scanning, cleanup, and all other behavior are untouched.

## Upstream version

| | |
|---|---|
| Repository | https://github.com/windirstat/windirstat |
| Tag | `release/v2.8.0` |
| Commit | `579dd76d6870b4efbb9497644698155fdab84284` |
| Tag date | 2026-08-02 |

`release/v2.8.0` is the newest **stable** tag. Newer `beta/v2.8.1`–`beta/v2.8.5`
tags exist and were deliberately not used.

## Prerequisites

- **Visual Studio 2022 Build Tools** (toolset `v143`) with:
  - `Microsoft.VisualStudio.Workload.VCTools`
  - `Microsoft.VisualStudio.Component.VC.Tools.x86.x64`
  - `Microsoft.VisualStudio.Component.VC.ATLMFC` — **required**; the project sets
    `<UseOfMfc>Static</UseOfMfc>`, so MFC must be present or the build fails.
  - A Windows 10/11 SDK
- Node.js — only if you want to regenerate the icon. Not needed to build.

CMake is **not** required. The project is a single MSBuild solution.

Installing the Build Tools needs an elevated (UAC) prompt:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --accept-package-agreements --accept-source-agreements --override "--passive --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.VC.ATLMFC --add Microsoft.VisualStudio.Component.Windows11SDK.22621"
```

## Apply the branding

```bash
git clone https://github.com/windirstat/windirstat.git upstream
cd upstream
git checkout -b soul-disk-map release/v2.8.0
git apply ../soul-disk-map-branding.patch
```

The patch is self-contained: it carries the icon as a git binary diff, so no
separate asset copy is needed.

## Build (portable executable)

Do **not** use the repo's `build.cmd`. It also code-signs, builds an MSI, builds
MSIX store packages, and makes 7-Zip archives — none of which are wanted here.
Build the solution directly instead:

```bat
"C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=amd64
msbuild windirstat.sln /p:Configuration=Release /p:Platform=x64 /m
```

The portable executable lands in `build\WinDirStat_x64.exe`. It is fully
self-contained (MFC is linked statically) and can be copied and renamed to
`SoulDiskMap.exe`.

## What the patch changes

Four lines across two files, plus one new icon:

| File | Change |
|---|---|
| `windirstat/windirstat.rc` | `AFX_IDS_APP_TITLE` → `"Soul Disk Map"` |
| `windirstat/windirstat.rc` | `IDR_MAINFRAME ICON` → `res\SoulDiskMap.ico` |
| `windirstat/res/langs/lang_en.txt` | Prepends `Soul Disk Map — based on WinDirStat` to the About text |
| `windirstat/res/langs/lang_en.txt` | `IDS_ABOUT_TITLE` → `About Soul Disk Map` |
| `windirstat/res/SoulDiskMap.ico` | New original icon (added, not replacing) |

Deliberately **not** changed:

- `LICENSE.md`, `windirstat/res/license.txt`, `CONTRIBUTORS.md` — untouched.
- All About credits: Bernhard Seifert, Oliver Schneider, Bryan Berns; the
  KDirStat / Stefan Hundhammer attribution; the "Thanks To" list; and
  `Copyright © WinDirStat Team` all remain, verbatim and in place. The branding
  line is *added above* them, not substituted for them.
- `version.rc` — file properties still report WinDirStat and the upstream
  version. Left alone on purpose so the binary stays honest about its origin.
- `res/WinDirStat.ico` — kept in the tree; the new icon is a separate file.
- No source (`.cpp`/`.h`) file is modified. No scanning, deletion, or cleanup
  code is touched.

Only `lang_en.txt` is rebranded. Other languages keep the upstream About text.
The window title comes from the neutral string table, so it reads "Soul Disk Map"
in every language.

## Regenerating the icon

```bash
NODE_PATH=/path/to/a/node_modules/with/sharp node icon-source/make-ico.js \
  upstream/windirstat/res/SoulDiskMap.ico icon-source/soul-disk-map-icon.svg /tmp/preview.png
```

Source art is `icon-source/soul-disk-map-icon.svg` — an original dark-and-teal
treemap disk. The script renders it at 16/24/32/48/64/128/256 px and packs a
PNG-compressed multi-resolution `.ico`.
