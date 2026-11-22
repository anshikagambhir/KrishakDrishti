import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INDIAN_LANGUAGES, getTranslation } from '../i18n/languages.js';

describe('Indian Regional Languages & Localization Test Suite', () => {
  it('1. Verifies 22 Constitutional Scheduled Languages + Indian English are registered', () => {
    assert.strictEqual(INDIAN_LANGUAGES.length, 23, 'Must contain 23 Indian languages');

    const expectedCodes = [
      'hi', 'pa', 'mr', 'en', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'or', 'as',
      'ur', 'mai', 'sat', 'ks', 'ne', 'kok', 'sd', 'doi', 'mni', 'brx', 'sa',
    ];

    for (const code of expectedCodes) {
      const found = INDIAN_LANGUAGES.find((l) => l.code === code);
      assert.ok(found, `Language code ${code} must be present in INDIAN_LANGUAGES`);
      assert.ok(found.name.length > 0, `Language ${code} must have an English name`);
      assert.ok(found.nativeName.length > 0, `Language ${code} must have a native script display name`);
      assert.ok(found.bcp47.includes('-'), `Language ${code} must have a valid BCP-47 tag (e.g. hi-IN)`);
    }
  });

  it('2. Verifies primary core languages have verified status', () => {
    const verifiedCodes = ['hi', 'pa', 'mr', 'en'];
    for (const code of verifiedCodes) {
      const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
      assert.strictEqual(lang?.validationStatus, 'verified', `${code} must have verified validation status`);
    }
  });

  it('3. Verifies translation dictionary key parity across verified languages', () => {
    const defaultDict = getTranslation('en');
    assert.ok(defaultDict, 'English default dictionary must exist');
    assert.ok(defaultDict.brandName, 'Brand name must be present');
    assert.ok(defaultDict.nav, 'Nav keys must be present');

    const requiredNavKeys: Array<keyof typeof defaultDict.nav> = [
      'dashboard', 'farms', 'profile', 'cropHealth', 'fieldMap',
      'mandi', 'weather', 'devices', 'aiAssistant', 'alerts', 'fpo',
    ];

    for (const langCode of ['hi', 'pa', 'mr', 'en'] as const) {
      const dict = getTranslation(langCode);
      assert.ok(dict, `Translation dictionary for ${langCode} must exist`);
      for (const key of requiredNavKeys) {
        assert.ok(
          dict.nav[key] && dict.nav[key].length > 0,
          `Nav translation for ${key} must not be empty in ${langCode}`
        );
      }
    }
  });

  it('4. Confirms Hindi localization matches authentic agricultural terminology', () => {
    const hi = getTranslation('hi');
    assert.strictEqual(hi.brandName, 'कृषक दृष्टि');
    assert.strictEqual(hi.nav.farms, 'खेत व फसलें');
    assert.strictEqual(hi.nav.mandi, 'लाइव मंडी भाव व तुलना');
    assert.strictEqual(hi.nav.cropHealth, 'फसल स्वास्थ्य व एआई जांच');
    assert.strictEqual(hi.nav.weather, 'मौसम व जोखिम अलर्ट');
  });

  it('5. Confirms Punjabi localization matches authentic Gurmukhi agricultural terminology', () => {
    const pa = getTranslation('pa');
    assert.strictEqual(pa.brandName, 'ਕ੍ਰਿਸ਼ਕ ਦ੍ਰਿਸ਼ਟੀ');
    assert.strictEqual(pa.nav.farms, 'ਖੇਤ ਅਤੇ ਫ਼ਸਲਾਂ');
    assert.strictEqual(pa.nav.mandi, 'ਲਾਈਵ ਮੰਡੀ ਭਾਅ');
    assert.strictEqual(pa.nav.cropHealth, 'ਫ਼ਸਲ ਸਿਹਤ ਤੇ ਏਆਈ ਜਾਂਚ');
    assert.strictEqual(pa.nav.weather, 'ਮੌਸਮ ਤੇ ਜੋਖਮ ਚੇਤਾਵਨੀ');
  });
});
