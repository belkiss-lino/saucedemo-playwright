import { test, expect } from '../src/fixtures/pages';
import { PRODUCTS } from '../src/data/products';

test.describe('Carrinho', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack.name, PRODUCTS.bikeLight.name);
    await inventoryPage.header.openCart();
  });

  test('lista os produtos adicionados com nome e preço @smoke', async ({ page, cartPage }) => {
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.header.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText([PRODUCTS.backpack.name, PRODUCTS.bikeLight.name]);

    await expect(cartPage.item(PRODUCTS.backpack.name)).toContainText(`$${PRODUCTS.backpack.price}`);
    await expect(cartPage.item(PRODUCTS.bikeLight.name)).toContainText(`$${PRODUCTS.bikeLight.price}`);
  });

  test('remover item tira o produto da lista e atualiza o contador', async ({ cartPage }) => {
    await cartPage.removeItem(PRODUCTS.backpack.name);

    await expect(cartPage.item(PRODUCTS.backpack.name)).toHaveCount(0);
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test('"Continue Shopping" volta para a vitrine mantendo o carrinho', async ({
    page,
    cartPage,
    inventoryPage,
  }) => {
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
  });

  test('carrinho continua com os itens depois de recarregar a página', async ({ page, cartPage }) => {
    await page.reload();

    await expect(cartPage.items).toHaveCount(2);
  });
});
