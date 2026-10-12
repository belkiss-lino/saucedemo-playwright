import { test as setup, expect } from '../src/fixtures/pages';
import { USERS, STORAGE_STATE } from '../src/data/users';

setup('autenticar como standard_user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await expect(page).toHaveURL(/\/inventory\.html$/);

  await page.context().storageState({ path: STORAGE_STATE });
});
