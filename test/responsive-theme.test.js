import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export async function runResponsiveThemeTests(it) {
  console.log('\n--- Testing Responsive Layouts & Semantic Theme Tokens (Bugs 1 & 2 Fixes) ---');

  const baseCss = fs.readFileSync(path.join(ROOT, 'css', 'base.css'), 'utf-8');
  const componentsCss = fs.readFileSync(path.join(ROOT, 'css', 'components.css'), 'utf-8');
  const hudJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'hud.js'), 'utf-8');

  await it('Bug 2: No filter: invert() hacks exist anywhere in CSS', () => {
    assert(!baseCss.includes('filter: invert'), 'base.css must not use filter: invert');
    assert(!componentsCss.includes('filter: invert'), 'components.css must not use filter: invert');
    assert(!baseCss.includes('invert('), 'base.css must not contain invert()');
    assert(!componentsCss.includes('invert('), 'components.css must not contain invert()');
  });

  await it('Bug 2: Dark Mode CSS tokens match exact specification', () => {
    assert(baseCss.includes('--bg-primary: #0a0a0a;'), 'Dark mode must have #0a0a0a bg-primary');
    assert(baseCss.includes('--bg-surface: #141414;'), 'Dark mode must have #141414 bg-surface');
    assert(baseCss.includes('--bg-card: #141414;'), 'Dark mode must have #141414 bg-card');
    assert(baseCss.includes('--bg-elevated: #1f1f1f;'), 'Dark mode must have #1f1f1f bg-elevated');
    assert(baseCss.includes('--border-color: #262626;'), 'Dark mode must have #262626 border');
    assert(baseCss.includes('--text-primary: #f5f5f5;'), 'Dark mode must have #f5f5f5 text-primary');
    assert(baseCss.includes('--text-secondary: #888888;'), 'Dark mode must have #888888 text-secondary');
    assert(baseCss.includes('--btn-primary-bg: #ffffff;'), 'Dark mode primary btn bg must be #ffffff');
    assert(baseCss.includes('--btn-primary-text: #0a0a0a;'), 'Dark mode primary btn text must be #0a0a0a');
  });

  await it('Bug 2: Light Mode CSS tokens match exact soft paper palette specification', () => {
    assert(baseCss.includes('--bg-primary: #f4f4f5;'), 'Light mode must have #f4f4f5 soft zinc paper bg');
    assert(baseCss.includes('--bg-surface: #ffffff;'), 'Light mode must have #ffffff surface');
    assert(baseCss.includes('--bg-card: #ffffff;'), 'Light mode must have #ffffff card');
    assert(baseCss.includes('--bg-elevated: #f4f4f5;'), 'Light mode must have #f4f4f5 elevated');
    assert(baseCss.includes('--border-color: #e4e4e7;'), 'Light mode must have #e4e4e7 border');
    assert(baseCss.includes('--border-muted: #d4d4d8;'), 'Light mode must have #d4d4d8 border-muted');
    assert(baseCss.includes('--text-primary: #18181b;'), 'Light mode must have #18181b deep charcoal text');
    assert(baseCss.includes('--text-secondary: #52525b;'), 'Light mode must have #52525b slate gray text');
    assert(baseCss.includes('--btn-primary-bg: #18181b;'), 'Light mode primary btn bg must be #18181b');
    assert(baseCss.includes('--btn-primary-text: #ffffff;'), 'Light mode primary btn text must be #ffffff');
    assert(baseCss.includes('--btn-secondary-bg: #f4f4f5;'), 'Light mode secondary btn bg must be #f4f4f5');
    assert(baseCss.includes('--btn-secondary-text: #18181b;'), 'Light mode secondary btn text must be #18181b');
    assert(baseCss.includes('--btn-secondary-border: #d4d4d8;'), 'Light mode secondary btn border must be #d4d4d8');
    assert(baseCss.includes('--card-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);'), 'Light mode must have soft shadow');
  });

  await it('Bug 2: Emojis and icons are protected against filter inversion', () => {
    assert(baseCss.includes('filter: none !important;'), 'Icons must have filter: none !important');
    assert(baseCss.includes('.tab-icon'), 'tab-icon must be protected');
    assert(baseCss.includes('.hud-streak-pill'), 'hud-streak-pill must be protected');
  });

  await it('Bug 1: Top HUD counts wrap labels in span.hud-count-label for responsive hiding', () => {
    assert(hudJs.includes('class="hud-count-label"'), 'hud.js must wrap text labels in hud-count-label');
  });

  await it('Bug 1: Clean Flexbox on top-hud-bar with no absolute coordinate collisions', () => {
    assert(componentsCss.includes('.top-hud-bar {'), 'top-hud-bar selector must exist');
    assert(componentsCss.includes('justify-content: space-between;'), 'top-hud-bar must use space-between');
    assert(componentsCss.includes('.hud-counts {'), 'hud-counts selector must exist');
    assert(componentsCss.includes('text-overflow: ellipsis;'), 'hud-counts must truncate if squeezed');
  });

  await it('Bug 1: Viewport <= 960px hides top text nav buttons to prevent header collision (covers 900x700)', () => {
    assert(componentsCss.includes('@media (max-width: 960px)'), 'Breakpoints must include max-width: 960px');
    assert(componentsCss.includes('#nav-btn-vocab,'), 'nav-btn-vocab must be targeted in media query');
    assert(componentsCss.includes('#nav-btn-quiz,'), 'nav-btn-quiz must be targeted in media query');
    assert(componentsCss.includes('display: none !important;'), 'nav buttons must be hidden in narrow viewports');
  });

  await it('Bug 1: Viewport <= 480px hides hud-count-label to prevent Lv.1 badge overlap (covers 390x844 portrait)', () => {
    assert(componentsCss.includes('.hud-counts .hud-count-label'), 'hud-count-label must be targeted at max-width: 480px');
    assert(componentsCss.includes('width: 36px;'), 'hud-exp-track should be compact on phone portrait');
  });

  await it('Bug 1: Dedicated mobile landscape protection ensures zero vertical clipping (covers 844x390 landscape)', () => {
    assert(componentsCss.includes('@media (orientation: landscape) and (max-height: 500px) and (max-width: 960px)'), 'Landscape short media query must exist');
    assert(componentsCss.includes('padding-bottom: 44px;'), 'Landscape layout must reserve compact bottom padding');
  });
}
