import { test, expect } from '../src/fixtures/pages';
import { type SortOption } from '../src/pages/InventoryPage';
import { PRODUCTS, TOTAL_PRODUCTS } from '../src/data/products';

test.describe('Vitrine de produtos', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('exibe todos os produtos do catálogo com nome e preço @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(TOTAL_PRODUCTS);

    const expectedNames = Object.values(PRODUCTS).map((p) => p.name);
    await expect(inventoryPage.itemNames).toHaveText(expectedNames);
  });

  test.describe('Ordenação', () => {
    const byName = (a: string, b: string) => a.localeCompare(b);

    const nameScenarios: { option: SortOption; label: string; compare: typeof byName }[] = [
      { option: 'az', label: 'nome de A a Z', compare: byName },
      { option: 'za', label: 'nome de Z a A', compare: (a, b) => byName(b, a) },
    ];

    for (const { option, label, compare } of nameScenarios) {
      test(`ordena por ${label}`, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option);

        const names = await inventoryPage.getNames();
        expect(names).toEqual([...names].sort(compare));
      });
    }

    const priceScenarios: { option: SortOption; label: string; compare: (a: number, b: number) => number }[] = [
      { option: 'lohi', label: 'menor preço', compare: (a, b) => a - b },
      { option: 'hilo', label: 'maior preço', compare: (a, b) => b - a },
    ];

    for (const { option, label, compare } of priceScenarios) {
      test(`ordena por ${label}`, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option);

        const prices = await inventoryPage.getPrices();
        expect(prices).toEqual([...prices].sort(compare));
      });
    }
  });

  test.describe('Adicionar e remover do carrinho', () => {
    test('adicionar produto atualiza o contador e troca o botão para "Remove"', async ({
      inventoryPage,
    }) => {
      await expect(inventoryPage.header.cartBadge).toBeHidden();

      await inventoryPage.addToCart(PRODUCTS.backpack.name);

      await expect(inventoryPage.header.cartBadge).toHaveText('1');
      await expect(inventoryPage.removeButton(PRODUCTS.backpack.name)).toBeVisible();
    });

    test('contador soma vários produtos', async ({ inventoryPage }) => {
      await inventoryPage.addToCart(
        PRODUCTS.backpack.name,
        PRODUCTS.bikeLight.name,
        PRODUCTS.onesie.name,
      );

      await expect(inventoryPage.header.cartBadge).toHaveText('3');
    });

    test('remover produto atualiza o contador', async ({ inventoryPage }) => {
      await inventoryPage.addToCart(PRODUCTS.backpack.name, PRODUCTS.bikeLight.name);
      await expect(inventoryPage.header.cartBadge).toHaveText('2');

      await inventoryPage.removeFromCart(PRODUCTS.backpack.name);

      await expect(inventoryPage.header.cartBadge).toHaveText('1');
      await expect(inventoryPage.addToCartButton(PRODUCTS.backpack.name)).toBeVisible();
    });
  });
});
