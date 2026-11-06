/**
 * Author: Võ Anh Ben - CE190709
 */

import { test, expect } from '@playwright/test';
import { createSeed } from '../../src/data/seed.js';
import { STORAGE_KEY, SESSION_KEY } from '../../src/services/dataService.js';

async function login(page) {
  await page.getByLabel('Username', { exact: true }).fill('Admin');
  await page.getByLabel('Password', { exact: true }).fill('Admin');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
}
async function navigate(page, label) {
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: label, exact: true })
    .click();
}
const configs = [
  {
    entity: 'categories',
    page: 'Category',
    singular: 'category',
    plural: 'categories',
    field: 'Category name',
    name: 'Sports desk',
    seed: 'Campus life',
    id: 'cat-campus',
    start: 7,
  },
  {
    entity: 'news',
    page: 'News',
    singular: 'article',
    plural: 'articles',
    field: 'Title',
    name: 'Campus sports story',
    seed: 'A new semester, a fresh beginning',
    id: 'news-welcome',
    start: 15,
  },
  {
    entity: 'users',
    page: 'Users',
    singular: 'user',
    plural: 'users',
    field: 'Username',
    name: 'sports.editor',
    seed: 'linh.editor',
    id: 'user-linh',
    start: 23,
  },
];
async function fillRecord(page, config, name = config.name) {
  const modal = page.getByRole('dialog');
  await modal.getByLabel(config.field, { exact: true }).fill(name);
  if (config.entity === 'news') {
    await modal
      .getByLabel('Content', { exact: true })
      .fill('A new story about campus sports and the student community.');
    await modal.getByLabel('Category', { exact: true }).selectOption('cat-campus');
    await modal.getByLabel('Tags (comma separated)').fill('sports, campus');
  }
  if (config.entity === 'users') await modal.getByLabel('Mock password').fill('Mock123');
}
async function createRecord(page, config) {
  await page
    .getByRole('button', { name: `Create ${config.singular}`, exact: true })
    .first()
    .click();
  await fillRecord(page, config);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: `Create ${config.singular}`, exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
const row = (page, name) => page.getByTestId('record-row').filter({ hasText: name });

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page._applicationErrors = errors;
  await page.goto('/');
});
test.afterEach(async ({ page }) => {
  expect(page._applicationErrors, 'No runtime or browser console errors').toEqual([]);
});

test('T01 Login rejects empty credentials', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter your username and password.');
  await expect(page.getByRole('navigation')).toHaveCount(0);
});
test('T02 Login rejects wrong username, wrong password and lowercase credentials', async ({
  page,
}) => {
  for (const [username, password] of [
    ['wrong', 'Admin'],
    ['Admin', 'wrong'],
    ['admin', 'Admin'],
  ]) {
    await page.getByLabel('Username', { exact: true }).fill(username);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Incorrect');
    await expect(page.getByRole('navigation')).toHaveCount(0);
  }
});
test('T03 Admin/Admin opens the dashboard with AI logo', async ({ page }) => {
  await login(page);
  const logo = page.getByAltText('FUNews AI-generated logo');
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
});
test('T04 Logout clears session and keeps management inaccessible after reload', async ({
  page,
}) => {
  await login(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY)).toBeNull();
});
test('T05 Menu contains all five required pages', async ({ page }) => {
  await login(page);
  for (const label of ['Dashboard', 'Category', 'News', 'Users', 'Settings'])
    await expect(
      page.getByRole('navigation').getByRole('button', { name: label, exact: true }),
    ).toBeVisible();
});
test('T06 All menus navigate without a document reload', async ({ page }) => {
  await login(page);
  await page.evaluate(() => {
    window.navigationMarker = 'same-document';
  });
  for (const label of ['Category', 'News', 'Users', 'Settings', 'Dashboard']) {
    await navigate(page, label);
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.navigationMarker)).toBe('same-document');
  }
});

for (const config of configs) {
  test(`T${String(config.start).padStart(2, '0')} ${config.page} reads seeded records`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await expect(row(page, config.seed)).toBeVisible();
  });
  test(`T${String(config.start + 1).padStart(2, '0')} ${config.page} creates a valid record in dialog`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await createRecord(page, config);
    await expect(row(page, config.name)).toBeVisible();
    await expect(page.getByRole('status')).toContainText('created successfully');
  });
  test(`T${String(config.start + 2).padStart(2, '0')} ${config.page} rejects empty and whitespace-only forms`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    const count = await page.getByTestId('record-row').count();
    await page
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .first()
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').locator('.field-error').first()).toBeVisible();
    await fillRecord(page, config, '   ');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .click();
    await expect(
      page.getByRole('dialog').getByLabel(config.field, { exact: true }),
    ).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('record-row')).toHaveCount(count);
  });
  test(`T${String(config.start + 3).padStart(2, '0')} ${config.page} updates the selected ID after search`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await createRecord(page, config);
    await page.getByRole('textbox', { name: `Search ${config.plural}` }).fill(config.name);
    await page.getByRole('button', { name: `Edit ${config.name}`, exact: true }).click();
    const edited = `${config.name} updated`;
    await page.getByRole('dialog').getByLabel(config.field, { exact: true }).fill(edited);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    await expect(row(page, edited)).toBeVisible();
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await expect(row(page, config.seed)).toBeVisible();
  });
  test(`T${String(config.start + 4).padStart(2, '0')} ${config.page} delete cancel keeps the record`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await createRecord(page, config);
    await page.getByRole('button', { name: `Delete ${config.name}`, exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(config.name);
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(row(page, config.name)).toBeVisible();
  });
  test(`T${String(config.start + 5).padStart(2, '0')} ${config.page} delete confirm removes only the selected record`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await createRecord(page, config);
    await page.getByRole('button', { name: `Delete ${config.name}`, exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Delete ${config.singular}`, exact: true })
      .click();
    await expect(row(page, config.name)).toHaveCount(0);
    await expect(row(page, config.seed)).toBeVisible();
  });
  test(`T${String(config.start + 6).padStart(2, '0')} ${config.page} search ignores case and outer whitespace`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await page
      .getByRole('textbox', { name: `Search ${config.plural}` })
      .fill(`  ${config.seed.toUpperCase()}  `);
    await expect(page.getByTestId('record-row')).toHaveCount(1);
    await expect(row(page, config.seed)).toBeVisible();
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    expect(await page.getByTestId('record-row').count()).toBeGreaterThan(1);
  });
  test(`T${String(config.start + 7).padStart(2, '0')} ${config.page} no-result search offers clear filters`, async ({
    page,
  }) => {
    await login(page);
    await navigate(page, config.page);
    await page
      .getByRole('textbox', { name: `Search ${config.plural}` })
      .fill('nonexistent-record-xyz');
    await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(row(page, config.seed)).toBeVisible();
  });
}

test('T31 News stores valid category, author, status and tags', async ({ page }) => {
  await login(page);
  await navigate(page, 'News');
  await createRecord(page, configs[1]);
  const article = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).news.at(-1),
    STORAGE_KEY,
  );
  expect(article.categoryId).toBe('cat-campus');
  expect(article.createdBy).toBe('user-admin');
  expect(article.status).toBe(1);
  expect(article.tags).toEqual(['sports', 'campus']);
});
test('T32 Users displays numeric roles as Admin/Staff', async ({ page }) => {
  await login(page);
  await navigate(page, 'Users');
  await expect(row(page, 'Default administrator').locator('.role-badge')).toHaveText('Admin');
  await expect(row(page, 'linh.editor').locator('.role-badge')).toHaveText('Staff');
});
test('T33 Status displays Active/Inactive and filters correctly', async ({ page }) => {
  await login(page);
  for (const config of configs) {
    await navigate(page, config.page);
    await expect(page.locator('.status-badge.active').first()).toHaveText('Active');
    await expect(page.locator('.status-badge.inactive').first()).toHaveText('Inactive');
    await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('0');
    await expect(page.getByTestId('record-row')).toHaveCount(1);
    await expect(page.getByTestId('record-row').locator('.status-badge')).toHaveText('Inactive');
  }
});
test('T34 Empty category and news lists render without crashing', async ({ page }) => {
  const data = createSeed();
  data.news = [];
  data.categories = [];
  data.users = [data.users[0]];
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), {
    key: STORAGE_KEY,
    data,
  });
  await page.reload();
  await login(page);
  await expect(page.getByRole('heading', { name: 'Your next story starts here' })).toBeVisible();
  await navigate(page, 'Category');
  await expect(page.getByRole('heading', { name: 'No categories yet' })).toBeVisible();
  await navigate(page, 'News');
  await expect(page.getByRole('heading', { name: 'No articles yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Create article', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText(
    'Create a category before saving an article.',
  );
});
test('T35 CRUD data and session survive reload', async ({ page }) => {
  await login(page);
  await navigate(page, 'Category');
  await createRecord(page, configs[0]);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await navigate(page, 'Category');
  await expect(row(page, configs[0].name)).toBeVisible();
});
test('T36 Category dependency and authored-user deletion are blocked', async ({ page }) => {
  await login(page);
  await navigate(page, 'Category');
  await page.getByRole('button', { name: 'Delete Campus life', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('used by news');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Delete category', exact: true }),
  ).toBeDisabled();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await navigate(page, 'Users');
  await page.getByRole('button', { name: 'Delete linh.editor', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('article author');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Delete user', exact: true }),
  ).toBeDisabled();
});
test('T37 Duplicate category and username are rejected', async ({ page }) => {
  await login(page);
  for (const config of [configs[0], configs[2]]) {
    await navigate(page, config.page);
    await page
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .first()
      .click();
    await fillRecord(page, config, ` ${config.seed.toUpperCase()} `);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .click();
    await expect(
      page.getByRole('dialog').getByLabel(config.field, { exact: true }),
    ).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  }
});
test('T38 Modal does not leak values between Edit records and Create', async ({ page }) => {
  await login(page);
  await navigate(page, 'Category');
  for (const name of ['Campus life', 'Academics']) {
    await page.getByRole('button', { name: `Edit ${name}`, exact: true }).click();
    await expect(page.getByRole('dialog').getByLabel('Category name')).toHaveValue(name);
    await page.getByRole('dialog').getByLabel('Category name').fill('unsaved');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Create category', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Category name')).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(row(page, 'Campus life')).toBeVisible();
  await expect(row(page, 'Academics')).toBeVisible();
});
test('T39 News search combines category and status filters', async ({ page }) => {
  await login(page);
  await navigate(page, 'News');
  await page.getByRole('textbox', { name: 'Search articles' }).fill('campus');
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('cat-campus');
  await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('0');
  await expect(page.getByTestId('record-row')).toHaveCount(1);
  await expect(row(page, 'Find your community at the club fair')).toBeVisible();
});
test('T40 Settings validates and persists preferences', async ({ page }) => {
  await login(page);
  await navigate(page, 'Settings');
  await page.getByLabel('Display name').fill(' ');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByRole('alert')).toContainText('required');
  await page.getByLabel('Display name').fill('Ben');
  await page.getByLabel('Publication name').fill('Campus newsroom');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.locator('.header-user')).toContainText('Ben');
  await page.reload();
  await expect(page.locator('.header-user')).toContainText('Ben');
  await expect(page.locator('.welcome-banner')).toContainText('Campus newsroom');
});
test('T41 Malformed storage recovers and shows a warning', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{broken'), STORAGE_KEY);
  await page.reload();
  await login(page);
  await expect(page.getByRole('alert')).toContainText('Demo data has been loaded');
  await navigate(page, 'News');
  await expect(page.getByTestId('record-row')).toHaveCount(4);
});
test('T42 Admin mock account cannot be edited or deleted', async ({ page }) => {
  await login(page);
  await navigate(page, 'Users');
  await page.getByRole('button', { name: 'Edit Admin', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Username', { exact: true })).toBeDisabled();
  await expect(page.getByRole('dialog').getByLabel('Role')).toBeDisabled();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Delete Admin', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Delete user', exact: true }),
  ).toBeDisabled();
});
test('T43 Mobile layout, drawer navigation and dialog fit viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  expect(
    await page.locator('.skip-link').evaluate((link) => link.getBoundingClientRect().bottom),
  ).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await navigate(page, 'News');
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('T44 Reset form restores its initial values without mutating source', async ({ page }) => {
  await login(page);
  await navigate(page, 'Category');
  await page.getByRole('button', { name: 'Edit Campus life', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Category name').fill('Changed');
  await page.getByRole('dialog').getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Category name')).toHaveValue('Campus life');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(row(page, 'Campus life')).toBeVisible();
});
test('T45 Dashboard create action opens the article dialog', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Create article', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Create article', exact: true })).toBeVisible();
});
test('T46 Screenshot evidence for login, all pages, CRUD dialogs and mobile', async ({ page }) => {
  await page.screenshot({ path: 'docs/evidence/01-login.png', fullPage: true });
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.screenshot({ path: 'docs/evidence/02-login-error.png', fullPage: true });
  await login(page);
  await page.screenshot({ path: 'docs/evidence/03-dashboard.png', fullPage: true });
  for (const [index, config] of configs.entries()) {
    await navigate(page, config.page);
    await page.screenshot({
      path: `docs/evidence/0${index + 4}-${config.entity}.png`,
      fullPage: true,
    });
    await page
      .getByRole('button', { name: `Create ${config.singular}`, exact: true })
      .first()
      .click();
    await fillRecord(page, config);
    await page.screenshot({ path: `docs/evidence/create-${config.entity}.png`, fullPage: true });
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  }
  await navigate(page, 'Category');
  await page.getByRole('button', { name: 'Delete Career', exact: true }).click();
  await page.screenshot({ path: 'docs/evidence/delete-confirmation.png', fullPage: true });
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Campus life', exact: true }).click();
  await page.screenshot({ path: 'docs/evidence/edit-category.png', fullPage: true });
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search categories' }).fill('nothing-matches');
  await page.screenshot({ path: 'docs/evidence/search-no-results.png', fullPage: true });
  await navigate(page, 'Settings');
  await page.screenshot({ path: 'docs/evidence/07-settings.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await navigate(page, 'Dashboard');
  await page.screenshot({
    path: 'docs/evidence/08-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
});

test('T47 Blocked localStorage still allows login and in-memory CRUD', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    }),
  );
  await page.reload();
  await login(page);
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable');
  await navigate(page, 'Category');
  await createRecord(page, configs[0]);
  await expect(row(page, configs[0].name)).toBeVisible();
});

test('T48 Storage quota failure shows warning and retains in-memory changes', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === window.localStorage)
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.reload();
  await login(page);
  await navigate(page, 'News');
  await createRecord(page, configs[1]);
  await expect(row(page, configs[1].name)).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('unavailable or full');
});

test('T49 Delete through the only remaining article to an empty list', async ({ page }) => {
  await login(page);
  await navigate(page, 'News');
  for (const article of createSeed().news) {
    await page.getByRole('button', { name: `Delete ${article.title}`, exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete article', exact: true })
      .click();
  }
  await expect(page.getByTestId('record-row')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No articles yet' })).toBeVisible();
});
