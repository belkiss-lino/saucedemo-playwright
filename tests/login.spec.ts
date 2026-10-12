import { test, expect } from '../src/fixtures/pages';
import { USERS } from '../src/data/users';
import { LOGIN_ERRORS } from '../src/data/messages';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('login com credenciais válidas leva à vitrine de produtos @smoke', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.title).toHaveText('Products');
  });

  const invalidScenarios = [
    {
      scenario: 'usuário vazio',
      username: '',
      password: USERS.standard.password,
      error: LOGIN_ERRORS.usernameRequired,
    },
    {
      scenario: 'senha vazia',
      username: USERS.standard.username,
      password: '',
      error: LOGIN_ERRORS.passwordRequired,
    },
    {
      scenario: 'senha incorreta',
      username: USERS.standard.username,
      password: 'senha_errada',
      error: LOGIN_ERRORS.invalidCredentials,
    },
    {
      scenario: 'usuário inexistente',
      username: 'usuario_que_nao_existe',
      password: USERS.standard.password,
      error: LOGIN_ERRORS.invalidCredentials,
    },
    {
      scenario: 'usuário bloqueado',
      username: USERS.lockedOut.username,
      password: USERS.lockedOut.password,
      error: LOGIN_ERRORS.lockedOut,
    },
  ];

  for (const { scenario, username, password, error } of invalidScenarios) {
    test(`exibe erro ao tentar logar com ${scenario}`, async ({ page, loginPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('mensagem de erro pode ser fechada', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.errorCloseButton.click();

    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('bloqueia acesso direto à vitrine sem estar logado', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERRORS.notLoggedIn('/inventory.html'));
  });
});
