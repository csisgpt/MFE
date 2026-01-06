import { test, expect } from '@playwright/test';

test('insurance request approval flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin or user').fill('Employee One');
  await page.locator('select').selectOption('employee');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto('/insurance/requests/create');
  await page.getByPlaceholder('Employee').fill('Employee One');
  await page.getByRole('spinbutton').fill('750');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Employee One')).toBeVisible();

  await page.getByTestId('role-switch').click();
  await page.getByText('Admin').click();

  await page.goto('/insurance/admin/requests');
  await page.waitForSelector('tbody tr');
  await page.locator('tbody tr').first().click();
  await page.getByRole('button', { name: 'Approve' }).click();

  await page.getByTestId('role-switch').click();
  await page.getByText('Employee').click();
  await page.goto('/insurance/requests');
  await expect(page.getByText('approved')).toBeVisible();
});

test('admission decision updates ops KPIs', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin or user').fill('Reviewer One');
  await page.locator('select').selectOption('reviewer');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto('/admission/applications');
  await page.waitForSelector('tbody tr');
  await page.locator('tbody tr').first().click();
  await page.getByRole('button', { name: 'Decision' }).click();
  await page.getByRole('button', { name: 'Submit decision' }).click();

  await page.goto('/ops');
  const acceptedCard = page.getByText('Accepted admissions').locator('..');
  await expect(acceptedCard.locator('.kpi')).toHaveText('1');
});
