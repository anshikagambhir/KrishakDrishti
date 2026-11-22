import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// WCAG relative luminance calculation according to W3C spec
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

describe('Accessibility (A11y) & WCAG 2.1 AA Compliance Verification Suite', () => {
  it('1. Brand Primary Color (#1B4D3E) meets WCAG AAA contrast (>= 7:1) against white', () => {
    const ratio = getContrastRatio('#1B4D3E', '#FFFFFF');
    assert.ok(
      ratio >= 7.0,
      `Primary color contrast ratio ${ratio.toFixed(2)}:1 must meet WCAG AAA standard (>= 7.0:1)`
    );
  });

  it('2. Main Text Foreground (#1A231E) meets WCAG AAA contrast against background (#F9FAF6)', () => {
    const ratio = getContrastRatio('#1A231E', '#F9FAF6');
    assert.ok(
      ratio >= 7.0,
      `Text foreground contrast ratio ${ratio.toFixed(2)}:1 must meet WCAG AAA standard (>= 7.0:1)`
    );
  });

  it('3. Critical Alert Color (#C62828) meets WCAG AA contrast (>= 4.5:1) against white', () => {
    const ratio = getContrastRatio('#C62828', '#FFFFFF');
    assert.ok(
      ratio >= 4.5,
      `Critical alert contrast ratio ${ratio.toFixed(2)}:1 must meet WCAG AA standard (>= 4.5:1)`
    );
  });

  it('4. Stylesheet verifies prefers-reduced-motion media query for motion sensitivity', () => {
    const cssPath = path.resolve(process.cwd(), 'src', 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(
      cssContent.includes('@media (prefers-reduced-motion: reduce)'),
      'globals.css must include prefers-reduced-motion media query'
    );
    assert.ok(
      cssContent.includes('animation-duration: 0.01ms') || cssContent.includes('animation: none'),
      'prefers-reduced-motion block must suppress animations'
    );
  });

  it('5. Stylesheet includes visible focus indicators (:focus-visible) for keyboard navigation', () => {
    const cssPath = path.resolve(process.cwd(), 'src', 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(
      cssContent.includes(':focus-visible'),
      'globals.css must specify :focus-visible rules for keyboard accessibility'
    );
    assert.ok(
      cssContent.includes('outline:'),
      ':focus-visible must provide clear visual outline'
    );
  });

  it('6. Stylesheet includes screen-reader only utility (.sr-only)', () => {
    const cssPath = path.resolve(process.cwd(), 'src', 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(
      cssContent.includes('.sr-only'),
      'globals.css must define .sr-only utility for assistive technology'
    );
  });
});
