import { test, expect } from '../src/fixtures/pages';
import { PRODUCTS } from '../src/data/products';

test.describe('Sessão e menu lateral', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('logout leva de volta à tela de login', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('depois do logout não é possível voltar à vitrine', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();
    await page.goto('/inventory.html');

    await expect(loginPage.loginButton).toBeVisible();
  });

  test('"Reset App State" esvazia o carrinho', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack.name, PRODUCTS.onesie.name);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    await inventoryPage.header.resetAppState();

    await expect(inventoryPage.header.cartBadge).toBeHidden();
  });
});
