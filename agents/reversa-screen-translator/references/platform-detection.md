# Platform Detection

Heuristics that `reversa-screen-translator` uses to classify the source platform of legacy code from the content of `_reversa_sdd/inventory.md` and the source code itself. Use together with `references/adapter-pairs.md` to choose the adapter.

The confidence scale applied by classification:

- 🟢 **CONFIRMED**: at least one strong signature (header, namespace, unique marker) is present.
- 🟡 **INFERRED**: extension and general pattern match, but no unique signature.
- 🔴 **GAP**: source code artifact missing; classification based only on `inventory.md`.
- ⚠️ **AMBIGUOUS**: two plausible platforms tied (e.g., Classic ASP vs ASP.NET WebForms in older projects).

## Signature Table

| Source Slug | Typical Extension | Strong Signature | Weak Signature |
|---|---|---|---|
| `cobol-ansi-tui` | `.cob`, `.cbl`, `.cpy` | `PROCEDURE DIVISION.` + `DISPLAY`/`ACCEPT` + `\x1B[` sequences, box-drawing Unicode (`╔ ╗ ┌ ┐`) | only `PROCEDURE DIVISION` (no ANSI = COBOL batch) |
| `cobol-screen-section` | `.cob`, `.cbl` | `SCREEN SECTION` + `LINE`, `COLUMN`, `FOREGROUND-COLOR` attributes | `SCREEN SECTION` without details |
| `ncurses-c` | `.c`, `.h` | `#include <ncurses.h>` or `<curses.h>` + `WINDOW *`, `wprintw`, `mvwaddstr` | `printf` + `\033[` (hand-crafted TUI) |
| `delphi-vcl` | `.pas`, `.dfm`, `.dpr` | `unit `, `interface`, `TForm`, `TPanel`, `TButton` in `.dfm` | plain `.pas` without `.dfm` (likely CLI) |
| `delphi-firemonkey` | `.pas`, `.fmx` | `TForm` in `.fmx` file (FireMonkey) | only `.pas` |
| `vb6` | `.frm`, `.bas`, `.cls`, `.vbp` | `VERSION 5.00` in header, `Begin VB.Form`, `Begin VB.CommandButton` | plain `.bas` (module without UI) |
| `vbnet-winforms` | `.vb` + `Designer.vb` | `Inherits System.Windows.Forms.Form` | only `Module ... Sub Main` (CLI) |
| `csharp-winforms` | `.cs`, `.designer.cs` | `using System.Windows.Forms;` + `partial class ... : Form` | only `using System;` |
| `csharp-wpf` | `.xaml`, `.cs` | `xmlns="http://schemas.microsoft.com/winfx/..."` + `<Window>`, `<Grid>` | only `.cs` without `.xaml` |
| `win32-mfc` | `.cpp`, `.h`, `.rc` | `BEGIN_MESSAGE_MAP`, `CDialog`, `WinMain`, `IDD_*` in `.rc` | standalone `WinMain` |
| `win32-raw` | `.cpp`, `.h` | `WinMain` + `RegisterClass`, `CreateWindow`, `WM_*` messages | only `WinMain` |
| `asp-classic` | `.asp`, `.inc` | `<%@ Language=VBScript %>` or `<%@ Language=JScript %>` + `Response.Write` | `.asp` without `<%@` |
| `aspnet-webforms` | `.aspx`, `.aspx.cs`, `.aspx.vb` | `<%@ Page Language="C#"`, `runat="server"`, `<asp:` controls | plain `.aspx` |
| `jsp` | `.jsp`, `.jspf` | `<%@ page language="java" %>`, `<jsp:`, `<%! %>` | `.jsp` with only HTML |
| `php-server-rendered` | `.php` | `<?php ... ?>` + inline HTML + `mysql_*` or `mysqli_*` | only `.php` in `api/` folder (likely REST API, not UI) |
| `html-legacy-jquery` | `.html`, `.htm`, `.js` | `jQuery`/`$.ajax` + server-side form submits, no SPA framework | static HTML (no dynamic JS) |
| `android-xml-java` | `res/layout/*.xml`, `*.java` | `<LinearLayout>`/`<RelativeLayout>`/`<ConstraintLayout>` + `Activity extends`, `setContentView(R.layout...)` | only Java without `res/layout/` |
| `android-xml-kotlin` | `res/layout/*.xml`, `*.kt` | same as above + Kotlin `Activity()` + `setContentView(R.layout...)` | only Kotlin without `res/layout/` |
| `android-compose` | `*.kt` | `@Composable`, `setContent { ... }` | without `setContent` |
| `ios-xib-objc` | `.xib`, `.m`, `.h`, `.storyboard` | `UIViewController` + `*.xib` or `*.storyboard` referenced | only `*.m` without XIB |
| `ios-xib-swift` | `.xib`, `.swift`, `.storyboard` | Swift `UIViewController` + XIB/Storyboard | only `*.swift` without XIB |
| `ios-swiftui` | `*.swift` | `View` + `var body: some View`, `App` lifecycle | without `var body` |
| `flutter` | `*.dart`, `pubspec.yaml` | `import 'package:flutter/material.dart'` + `StatelessWidget`/`StatefulWidget` | without `material.dart` |
| `react-class` | `*.jsx`, `*.tsx` | `class ... extends React.Component` + `render()` | only `*.tsx` (likely modern) |
| `react-hooks` | `*.jsx`, `*.tsx` | `function ... ({...}) { return <...>; }` + `useState`, `useEffect` | (not legacy, it's a target) |

## Additional Indicators

- **Directory structure**:
  - `forms/`, `Forms/` → Delphi, VB6, .NET WinForms.
  - `views/`, `templates/` → MVC server-side (ASP, JSP, PHP).
  - `app/src/main/res/layout/` → Android.
  - `Storyboard.storyboard` or `*.xib` in root → legacy iOS.
  - `Pages/` in Razor project → ASP.NET.
- **Build files**:
  - `*.dpr` (Delphi), `*.vbp` (VB6), `*.csproj` (.NET), `pom.xml`/`build.gradle` (Java/Android), `Podfile` (iOS), `pubspec.yaml` (Flutter).
- **Version strings in comments or headers**: VB6 marks `VERSION 5.00`; Delphi 7 marks `{$OBJECT}`; .NET with `<TargetFramework>net48</TargetFramework>` indicates legacy WinForms.

## When Two Platforms Tie

- **Classic ASP vs ASP.NET WebForms**: `.asp` files without `.aspx` → Classic. `.aspx` + `.asp` in the same project → migrating project, mark ⚠️ AMBIGUOUS and ask.
- **VB6 vs VB.NET**: `.frm` + `.vbp` → VB6. `.vb` + `.designer.vb` + `.vbproj` → VB.NET WinForms.
- **Delphi VCL vs FireMonkey**: `.dfm` → VCL. `.fmx` → FireMonkey. Both in project → mark ⚠️ AMBIGUOUS.
- **Android Java vs Kotlin**: `.java` + `.kt` in the same project → project in migration; classify per file.
- **iOS Storyboard vs XIB**: both supported; treat as one class (`ios-xib-*`). Difference goes into capture detail.

## When Nothing Matches

Record `EC-01` (unknown source platform) and offer the user a "raw" template where they describe the screen in structured prose, with mandatory sections:

- Identity.
- Layout in ASCII art or screenshot.
- List of fields / components.
- Messages / literal labels.
- Events and transitions.
- Validations.

The agent then generates `target_screens.md` with `spec.kind: raw-prose` and marks in `screen_deviation_log.md` that the screen did not pass through the adapter.
