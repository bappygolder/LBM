# Resources

Design assets, reference files, and exported icons for the Local Task Manager (LTM).

---

## What goes here

- App icons / logo exports (PNG, SVG, ICNS)
- Brand reference files (colour swatches, typography guides)
- Screenshots and screen recordings for documentation
- Exported design files (Figma exports, etc.)

## What does NOT go here

- Source code or scripts → goes in `../` (project root or `Sources/`)
- Documentation → goes in `../docs/` or `../TaskTracker/` (as `.md` files)
- Build output → the `build/` directory at the project root

---

## Adding a resource

1. Drop the file into this folder.
2. Open `resources.html` in a text editor.
3. Add an entry to the `LTM_RESOURCES` array in `resources.html`:

```js
{ name: "App Icon (PNG 512×512)", file: "resources/app-icon-512.png", type: "image" },
```

4. Commit the file and the updated `resources.html` to git.

---

## Note on builds

Files in this folder **are tracked in git** but are **not included in the macOS app build**. The build script (`../build.sh`) only reads from `../Sources/` and `../Resources/` (the root-level `Resources/` folder containing `AppIcon.icns`). This `TaskTracker/resources/` folder is completely separate.
