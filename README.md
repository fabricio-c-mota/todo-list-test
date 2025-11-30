# Todo List - React Native com Expo

## 👥 Integrantes do Grupo

| Nome Completo | Matrícula |
|---------------|-----------|
| Matusalen Costa Alves | 2024116TADS0005 |
| Fabricio de Carvalho Mota | 2024116TADS0002 |
| Cícero Andrade Santos | 2024116TADS0040 |
| Cairon Ferreira Prado | 2024116TADS0045 |

**Disciplina:** Engenharia de Software 3  
**Professor:** Me. Mayllomn Veras

---

## 📋 Descrição do Projeto

Este projeto é uma aplicação de lista de tarefas (Todo List) desenvolvida em **React Native** utilizando **Expo**. A aplicação permite ao usuário:

- Criar novas tarefas com título e descrição
- Visualizar lista de tarefas pendentes e concluídas
- Marcar tarefas como concluídas ou pendentes
- Editar tarefas existentes
- Excluir tarefas
- Alternar entre temas claro e escuro

---

## 🏗️ Arquitetura e Padrões Aplicados

### MVVM (Model-View-ViewModel)

O projeto segue o padrão **MVVM** com a seguinte estrutura:

```
src/
├── model/
│   ├── entities/
│   │   └── task.ts              # Entidade Task (interface)
│   ├── repository/
│   │   ├── ITaskRepository.ts   # Interface do repositório
│   │   └── LocalTaskRepository.ts # Implementação local
│   └── service/
│       ├── ITaskService.ts      # Interface do serviço
│       └── TaskService.ts       # Lógica de negócio
├── view/
│   ├── TaskListScreen.tsx       # Tela de listagem
│   ├── TaskCreateScreen.tsx     # Tela de criação
│   ├── TaskDetailScreen.tsx     # Tela de detalhes/edição
│   └── theme/                   # Contexto de tema
└── viewmodel/
    ├── useTasks.ts              # ViewModel para listagem
    ├── useTaskCreate.ts         # ViewModel para criação
    └── useTaskDetail.ts         # ViewModel para detalhes
```

- **Model:** Contém as entidades, repositórios e serviços que encapsulam a lógica de dados e regras de negócio.
- **View:** Componentes React Native responsáveis pela interface do usuário.
- **ViewModel:** Hooks personalizados que gerenciam o estado e a comunicação entre View e Model.

### Injeção de Dependência (DI)

A injeção de dependência é aplicada através de:

1. **Interfaces:** `ITaskRepository` e `ITaskService` definem contratos que permitem trocar implementações.
2. **Constructor Injection:** O `TaskService` recebe o repositório via construtor:
   ```typescript
   constructor(repository: IRepository) {
       this.repository = repository;
   }
   ```
3. **ViewModels:** Recebem o serviço como parâmetro, facilitando testes com mocks:
   ```typescript
   export function useTasks(taskService: ITaskService) { ... }
   ```

### Testes Automatizados

Os testes foram implementados utilizando **Jest** e **React Native Testing Library**:

- **Testes de Unidade:** Testam isoladamente Repository, Service e ViewModels
- **Mocks:** Utilização de mocks para simular dependências
- **Cobertura:** 100% de cobertura em `TaskService.ts` e `LocalTaskRepository.ts`

```
tests/
├── LocalTaskRepository.test.ts  # 28 testes
├── TaskService.test.ts          # 55 testes
├── useTasks.test.ts             # Testes do ViewModel
├── useTaskCreate.test.ts        # Testes do ViewModel
├── useTaskDetail.test.ts        # Testes do ViewModel
└── utils/
    └── testUtils.ts             # Utilitários para testes
```

---

## 🚀 Passo a Passo para Executar o App

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Emulador Android/iOS ou dispositivo físico com Expo Go

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/watusalen/todo-list-test.git
   cd todo-list-test
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto:**
   ```bash
   npm start
   ```

4. **Abra o app:**
   - **Android:** Pressione `a` no terminal ou escaneie o QR Code com o Expo Go
   - **iOS:** Pressione `i` no terminal ou escaneie o QR Code com a câmera
   - **Web:** Pressione `w` no terminal

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento Expo |
| `npm run android` | Inicia no emulador Android |
| `npm run ios` | Inicia no simulador iOS |
| `npm run web` | Inicia no navegador web |

---

## 🧪 Passo a Passo para Executar os Testes

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes com Cobertura Detalhada

```bash
npm test -- --verbose
```

### Executar Testes de um Arquivo Específico

```bash
# Testes do Repository
npm test -- --testPathPattern="LocalTaskRepository"

# Testes do Service
npm test -- --testPathPattern="TaskService"

# Testes dos ViewModels
npm test -- --testPathPattern="useTasks|useTaskCreate|useTaskDetail"
```

### Visualizar Relatório de Cobertura

Após executar os testes, o relatório de cobertura é gerado automaticamente na pasta `coverage/`. Para visualizar:

```bash
# Abra o relatório HTML no navegador
open coverage/lcov-report/index.html
```

### Resultado Esperado

```
Test Suites: 6 passed, 6 total
Tests:       95 passed, 95 total

Cobertura:
- LocalTaskRepository.ts: 100%
- TaskService.ts: 100%
- ViewModels: ~88%
```

---

## 📁 Estrutura do Projeto

```
todo-list-test/
├── src/
│   ├── App.tsx                  # Componente principal
│   ├── model/                   # Camada Model (MVVM)
│   ├── view/                    # Camada View (MVVM)
│   └── viewmodel/               # Camada ViewModel (MVVM)
├── tests/                       # Testes automatizados
├── coverage/                    # Relatórios de cobertura
├── package.json                 # Dependências do projeto
├── jest.config.ts               # Configuração do Jest
└── tsconfig.json                # Configuração do TypeScript
```

---

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **Jest** - Framework de testes
- **React Native Testing Library** - Testes de componentes
- **React Navigation** - Navegação entre telas

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos na disciplina de Engenharia de Software 3.
