# SauceDemo · Testes E2E com Playwright + TypeScript

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

Suíte de testes automatizados ponta a ponta (E2E) para o [SauceDemo](https://www.saucedemo.com), um e-commerce de demonstração. Ela cobre os fluxos críticos de uma loja virtual: login, vitrine, carrinho e checkout.

## O que este projeto demonstra

- **Page Object Model (POM):** cada tela tem sua classe, com locators e ações separados das verificações.
- **Fixtures customizadas:** os Page Objects chegam prontos nos testes, sem `new` repetido.
- **Login reaproveitado (storage state):** o login é feito uma vez e a sessão é reutilizada, o que deixa a suíte mais rápida.
- **Testes orientados a dados:** um mesmo teste roda para vários cenários, como credenciais inválidas e campos obrigatórios.
- **Regras de negócio validadas:** o teste confere subtotal, imposto (8%) e total do pedido, além do texto da tela.
- **Seletores estáveis:** usa os atributos `data-test` do site e locators por papel e texto (`getByRole`).
- **Execução em mais de um navegador:** Chromium e Firefox.
- **CI com GitHub Actions:** a suíte roda a cada push e o relatório HTML fica disponível como artefato.
- **Evidências de falha:** screenshot, vídeo e trace são salvos automaticamente.

## Cobertura

| Área | Cenários |
|---|---|
| Login | Login válido; usuário vazio; senha vazia; senha incorreta; usuário inexistente; usuário bloqueado; fechar mensagem de erro; bloqueio de acesso direto sem login |
| Vitrine | Catálogo completo; ordenação A-Z, Z-A, menor e maior preço; adicionar e remover itens com atualização do contador |
| Carrinho | Itens com nome e preço; remover item; "Continue Shopping"; persistência após recarregar a página |
| Checkout | Fluxo completo com cálculo de subtotal, imposto e total; campos obrigatórios (nome, sobrenome, CEP); cancelar em cada etapa |
| Sessão | Logout; bloqueio após logout; "Reset App State" |

São **29 testes por navegador**, além do setup de autenticação.

## Estrutura

```
├── .github/workflows/playwright.yml   # pipeline de CI
├── playwright.config.ts               # configuração (baseURL, navegadores, relatórios)
├── src/
│   ├── data/          # massa de teste: usuários, produtos, mensagens, clientes
│   ├── fixtures/      # fixtures que entregam os Page Objects aos testes
│   ├── pages/         # Page Objects (uma classe por tela + header compartilhado)
│   └── utils/         # funções auxiliares (ex.: converter "$29.99" em número)
└── tests/
    ├── auth.setup.ts  # faz login uma vez e salva a sessão
    ├── login.spec.ts
    ├── inventory.spec.ts
    ├── cart.spec.ts
    ├── checkout.spec.ts
    └── session.spec.ts
```

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
npx playwright install
npm test
```

| Comando | Descrição |
|---|---|
| `npm test` | Executa a suíte completa (Chromium + Firefox) |
| `npm run test:chromium` | Executa apenas no Chromium |
| `npm run test:headed` | Executa com o navegador visível |
| `npm run test:ui` | Abre o UI Mode do Playwright |
| `npm run test:smoke` | Executa apenas os testes marcados com `@smoke` |
| `npm run report` | Abre o relatório HTML da última execução |
| `npm run typecheck` | Valida os tipos do TypeScript |

Execução em outro ambiente:

```bash
BASE_URL=https://outro-ambiente.com npm test
```

## Decisões técnicas

- **Seletores `data-test`:** atributos dedicados a testes, independentes de estilo e texto. Configurado via `testIdAttribute` para uso com `getByTestId()`.
- **Produtos localizados pelo nome visível:** torna os testes mais legíveis e próximos da perspectiva do usuário do que IDs gerados.
- **Massa de dados centralizada (`src/data`):** mensagens, preços e usuários mantidos em um único ponto, o que reduz o custo de manutenção.
- **Credenciais via variável de ambiente:** a senha é lida de `SAUCE_PASSWORD`, com fallback para a credencial pública do SauceDemo.
