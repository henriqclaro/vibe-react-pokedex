# App PokeAPI

## ⚠️ Este projeto foi desenvolvido com o auxílio de Inteligência Artificial (Google Antigravity) para fins educacionais.

Aplicativo mobile e web construído com **Expo SDK 55** + **React Native 0.83.6**, consumindo a [PokéAPI](https://pokeapi.co) para navegar pelas informações dos Pokémon.

---

## Tecnologias

| Pacote | Versão |
|---|---|
| Expo SDK | 55.0.0 |
| React Native | 0.83.6 |
| React | 19.2.0 |
| @react-navigation/bottom-tabs | ^7.3.10 |
| expo-status-bar | ~55.0.6 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-screens | ~4.23.0 |
| react-native-web | ^0.21.0 |

---

## Pré-requisitos

- **Node.js** >= 18.0.0
- **npm**
- Para testar em um dispositivo físico: aplicativo **[Expo Go](https://expo.dev/go)**

---

## Instalação

```sh
npm install
```

---

## Como Executar

### Servidor de Desenvolvimento (Expo Go)

```sh
npx expo start
```

Escaneie o código QR com o Expo Go (Android) ou com a câmera do iPhone (iOS).

### Web

```sh
npx expo start --web
# ou pressione 'w' no terminal após iniciar o servidor de desenvolvimento
```

---

## Estrutura do Projeto

```
PokeAPI/
├── assets/              # Ícones e tela de splash
├── src/
│   ├── screens/
│   │   ├── SeasonsScreen.tsx   # Navegar por Pokémon por região
│   │   ├── SearchScreen.tsx    # Buscar Pokémon por nome ou ID
│   │   └── TypesScreen.tsx     # Navegar por Pokémon por tipo
│   ├── components/
│   │   ├── PokemonCard.tsx         # Card do grid
│   │   ├── PokemonDetailModal.tsx  # Ficha detalhada completa (status, informações, movimentos)
│   │   ├── SearchCard.tsx          # Card de resultado de busca
│   │   └── CustomDrawer.tsx        # Menu lateral de opções de filtro
│   ├── services/
│   │   └── api.ts           # Chamadas da PokéAPI + cache em memória
│   ├── styles/
│   │   └── theme.ts         # Design tokens (cores, espaçamento, tipografia)
│   └── types/
│       └── pokemon.ts       # Interfaces TypeScript
├── App.tsx              # Raiz de navegação + barra de abas personalizada animada
├── index.js             # Ponto de entrada (registerRootComponent)
├── app.json             # Configuração do Expo
├── babel.config.js      # babel-preset-expo
└── metro.config.js      # expo/metro-config
```

---

## Telas

- **Seasons** — Navegue por Pokémon por geração/região (Kanto → Paldea)
- **Search** — Busque Pokémon por nome ou número da Pokédex
- **Types** — Navegue por Pokémon filtrados por tipo (Fogo, Água, Elétrico…)

Todas as telas compartilham um design system unificado em modo escuro e animação de entrada no cabeçalho. Tocar em qualquer card de Pokémon abre uma ficha detalhada com abas para Tipos, Status Base, Informações da Pokédex e Movimentos.

---

## Comandos Úteis

```sh
# Limpar o cache do Metro se algo parecer desatualizado
npx expo start --clear

# Verificar a compatibilidade dos pacotes do Expo
npx expo install --check

# Verificação de tipos com TypeScript (esperado 0 erros)
npx tsc --noEmit
```

---

## Recursos

- [Documentação do Expo](https://docs.expo.dev)
- [PokéAPI](https://pokeapi.co)
- [React Navigation v7](https://reactnavigation.org)
- [Expo Go](https://expo.dev/go)
