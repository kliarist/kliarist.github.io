# Development Guidelines for Agents & Contributors

This document outlines the coding standards, commit conventions, and best practices for this project.

---

## 🧹 Code Organization & Structure

### File Naming Conventions

**JavaScript Files:**
- Use lowercase with hyphens (kebab-case) or camelCase
- ✅ `randomiser.js`, `main.js`, `controls.js`
- ❌ `Randomiser.js`, `Main.js` (avoid PascalCase for files)

**CSS Files:**
- Use lowercase with hyphens
- ✅ `gameboy.css`, `common.css`, `emulator.css`

### Project Structure

Follow standard web project organization:

```
project/
├── index.html           # Main entry point
├── js/
│   ├── game/           # Game-specific modules
│   ├── emulator/       # Emulator modules
│   └── lib/            # Third-party libraries
├── css/
│   ├── common.css      # Shared styles
│   └── specific.css    # Page-specific styles
└── assets/
    ├── images/
    ├── audio/
    └── fonts/
```

### CSS Best Practices

1. **NO Inline Styles** - Always use external CSS files
2. **NO Inline Scripts** - Move all JavaScript to external .js files
3. **Organize by Purpose**:
   - `common.css` - Shared styles across pages
   - `component.css` - Component-specific styles
4. **Use Meaningful Class Names** - `.mode-switch`, `.btn-direction`, `.label-select`
5. **Group Related Styles** - Keep related selectors together
6. **Use IDs for JavaScript hooks** - Use classes for styling, IDs for JS interaction

### JavaScript Best Practices

1. **NO Inline Scripts** - All JavaScript must be in external files
2. **Organize by Feature**:
   - `touch-controls.js` - Mobile touch controls
   - `controls.js` - Keyboard controls
   - `main.js` - Game logic
3. **Use Descriptive File Names** - Clear purpose from filename

### Code Cleanliness Checklist

Before committing, ensure:
- [ ] Files follow naming conventions (lowercase)
- [ ] Code is properly organized in folders
- [ ] No inline CSS unless absolutely necessary
- [ ] CSS is split into logical files (common, specific)
- [ ] All paths are updated after restructuring
- [ ] Both desktop and mobile versions tested

---

## 📝 Commit Standards

### Conventional Commits

All commits **MUST** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tooling
- **revert**: Reverts a previous commit

#### Examples

✅ **Good commits:**
```
feat(ui): add START/SELECT button labels
fix(controls): correct D-pad direction mapping for mobile
docs(readme): update installation instructions
refactor(audio): simplify music playback logic
style(css): increase D-pad size for better mobile UX
chore(cleanup): remove redundant backup files
```

❌ **Bad commits:**
```
Add button labels (START/SELECT/A/B), update README, enlarge D-pad, clean up redundant files
fixed stuff
updates
WIP
```

#### Scope Guidelines

Common scopes for this project:
- `ui` - User interface components
- `controls` - Input handling (keyboard, touch)
- `audio` - Sound and music
- `game` - Game logic (blocks, scoring, levels)
- `css` - Styling changes
- `docs` - Documentation

---

## 🔢 Semantic Versioning (SemVer)

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0) - Incompatible API changes or breaking changes
- **MINOR** (0.1.0) - New features, backward-compatible
- **PATCH** (0.0.1) - Bug fixes, backward-compatible

### Pre-release & Metadata

- Pre-release: `1.0.0-alpha`, `1.0.0-beta.1`
- Build metadata: `1.0.0+20130313144700`

### Examples

- `0.1.0` - Initial release with basic features
- `0.2.0` - Added mobile touch controls
- `0.2.1` - Fixed D-pad button mapping
- `1.0.0` - First stable release
- `1.1.0` - Added high score tracking
- `1.1.1` - Fixed score display bug

### Version Bumping Rules

1. **Breaking changes** → MAJOR version
   - Changed control scheme completely
   - Removed features
   - Major UI overhaul

2. **New features** → MINOR version
   - Added pause functionality
   - Added button labels
   - New game modes

3. **Bug fixes** → PATCH version
   - Fixed button alignment
   - Corrected audio playback
   - Fixed mobile responsiveness

---

## 🧹 Clean Code Principles

### JavaScript Standards

#### 1. **Naming Conventions**
```javascript
// Use camelCase for variables and functions
let gameStart = false;
function checkRowComplete() { }

// Use PascalCase for classes
class BlockManager { }

// Use UPPER_CASE for constants
const MAX_LEVEL = 10;
const GRID_WIDTH = 12;
```

#### 2. **Function Guidelines**
- Keep functions small and focused (single responsibility)
- Use descriptive names (verb + noun)
- Avoid deep nesting (max 3 levels)
- Return early to reduce complexity

```javascript
// ✅ Good
function checkIfPossible(leftOff, topOff) {
  if (!currentBlock) return false;
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (currentBlock[row][col] === 1) {
        if (staticGrid[topOff + row][leftOff + col] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

// ❌ Bad
function check(l, t) {
  // unclear what this does
}
```

#### 3. **Comments**
- Only comment **why**, not **what**
- Code should be self-documenting
- Remove commented-out code
- Update comments when code changes

```javascript
// ❌ Bad
// Set game start to false
gameStart = false;

// ✅ Good
// Browsers require user interaction before playing audio
if (!themeSong.isPlaying()) {
  themeSong.loop();
}
```

#### 4. **Variable Declarations**
- Use `const` by default
- Use `let` only when reassignment is needed
- Never use `var`
- Declare variables close to usage

```javascript
// ✅ Good
const MAX_SPEED = 1;
let currentSpeed = 30;

// ❌ Bad
var speed;
```

#### 5. **Avoid Magic Numbers**
```javascript
// ❌ Bad
if (score > 1000) { }

// ✅ Good
const LEVEL_UP_THRESHOLD = 1000;
if (score > LEVEL_UP_THRESHOLD) { }
```

### CSS Standards

#### 1. **Naming**
- Use kebab-case for class names
- Use BEM methodology when appropriate
- Avoid IDs for styling

```css
/* ✅ Good */
.gameboy { }
.gameboy__screen { }
.gameboy__button--active { }

/* ❌ Bad */
#myButton { }
.GameBoy { }
```

#### 2. **Organization**
- Group related properties
- Use shorthand where appropriate
- Consistent spacing and indentation

```css
/* ✅ Good */
.button {
  /* Positioning */
  position: absolute;
  top: 50px;
  left: 100px;
  
  /* Box model */
  width: 40px;
  height: 40px;
  padding: 10px;
  
  /* Visual */
  background: #444;
  border-radius: 5px;
}
```

### HTML Standards

#### 1. **Semantic HTML**
- Use semantic tags when possible
- Proper heading hierarchy
- Meaningful IDs and classes

```html
<!-- ✅ Good -->
<button id="btnStart" class="game-button">START</button>

<!-- ❌ Bad -->
<div id="btn1" onclick="...">START</div>
```

#### 2. **Accessibility**
- Add alt text to images
- Use ARIA labels when needed
- Ensure keyboard navigation works

---

## 🔍 Code Review Checklist

Before committing, verify:

- [ ] Code follows naming conventions
- [ ] Functions are focused and small
- [ ] No commented-out code
- [ ] No console.log() statements (use proper debugging)
- [ ] No magic numbers
- [ ] Commit message follows conventional commits
- [ ] Changes are tested on both desktop and mobile
- [ ] No redundant files added
- [ ] Code is properly formatted

---

## 🚀 Deployment Process

1. Make changes locally
2. Test thoroughly (desktop + mobile)
3. Stage changes: `git add <files>`
4. Commit with conventional format: `git commit -m "feat(scope): description"`
5. Push to GitHub: `git push origin main`
6. Verify deployment at https://kliarist.github.io/
7. Wait ~1 minute for GitHub Pages to update

---

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [BEM Methodology](http://getbem.com/)
- [JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

---

*This document is a living guide. Update as the project evolves.*
