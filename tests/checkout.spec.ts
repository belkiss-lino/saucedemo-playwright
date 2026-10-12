import { test, expect } from '../src/fixtures/pages';
import { PRODUCTS, TAX_RATE } from '../src/data/products';
import { VALID_CUSTOMER, type Customer } from '../src/data/customers';
import { CHECKOUT_COMPLETE, CHECKOUT_ERRORS } from '../src/data/messages';
import { roundMoney } from '../src/utils/price';

test.describe('Checkout', () => {
  const cartProducts = [PRODUCTS.backpack, PRODUCTS.bikeLight];

  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(...cartProducts.map((p) => p.name));
    await inventoryPage.header.openCart();
    await cartPage.checkout();
  });

  test('fluxo completo de compra com cálculo correto dos valores @smoke', async ({
    page,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await test.step('preencher dados do cliente', async () => {
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
      await checkoutInfoPage.fillInfo(VALID_CUSTOMER);
      await checkoutInfoPage.continue();
    });

    await test.step('conferir resumo e valores', async () => {
      await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
      await expect(checkoutOverviewPage.itemNames).toHaveText(cartProducts.map((p) => p.name));

      const expectedSubtotal = roundMoney(cartProducts.reduce((sum, p) => sum + p.price, 0));
      const expectedTax = roundMoney(expectedSubtotal * TAX_RATE);
      const expectedTotal = roundMoney(expectedSubtotal + expectedTax);

      expect(await checkoutOverviewPage.getSubtotal()).toBe(expectedSubtotal);
      expect(await checkoutOverviewPage.getTax()).toBe(expectedTax);
      expect(await checkoutOverviewPage.getTotal()).toBe(expectedTotal);
    });

    await test.step('finalizar pedido', async () => {
      await checkoutOverviewPage.finish();

      await expect(page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(checkoutCompletePage.completeHeader).toHaveText(CHECKOUT_COMPLETE.header);
      await expect(checkoutCompletePage.completeText).toHaveText(CHECKOUT_COMPLETE.text);
    });

    await test.step('carrinho é esvaziado após a compra', async () => {
      await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
    });
  });

  const missingFieldScenarios: { field: string; data: Partial<Customer>; error: string }[] = [
    {
      field: 'primeiro nome',
      data: { lastName: VALID_CUSTOMER.lastName, postalCode: VALID_CUSTOMER.postalCode },
      error: CHECKOUT_ERRORS.firstNameRequired,
    },
    {
      field: 'sobrenome',
      data: { firstName: VALID_CUSTOMER.firstName, postalCode: VALID_CUSTOMER.postalCode },
      error: CHECKOUT_ERRORS.lastNameRequired,
    },
    {
      field: 'CEP',
      data: { firstName: VALID_CUSTOMER.firstName, lastName: VALID_CUSTOMER.lastName },
      error: CHECKOUT_ERRORS.postalCodeRequired,
    },
  ];

  for (const { field, data, error } of missingFieldScenarios) {
    test(`não avança sem preencher ${field}`, async ({ page, checkoutInfoPage }) => {
      await checkoutInfoPage.fillInfo(data);
      await checkoutInfoPage.continue();

      await expect(checkoutInfoPage.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }

  test('cancelar na etapa de dados volta para o carrinho', async ({ page, checkoutInfoPage }) => {
    await checkoutInfoPage.cancel();

    await expect(page).toHaveURL(/\/cart\.html$/);
  });

  test('cancelar no resumo volta para a vitrine sem perder o carrinho', async ({
    page,
    checkoutInfoPage,
    checkoutOverviewPage,
    inventoryPage,
  }) => {
    await checkoutInfoPage.fillInfo(VALID_CUSTOMER);
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText(String(cartProducts.length));
  });
});
