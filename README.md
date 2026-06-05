# PokeAPI App

## ATENÇÃO: ESTE PROJETO FOI DESENVOLVIDO COM O AUXÍLIO DE INTELIGÊNCIA ARTIFICIAL, NO AMBIENTE GOOGLE ANTIGRAVITY, PARA FINS EDUCACIONAIS.

App mobile e web construído com **Expo SDK 55** + **React Native 0.83.6**, consumindo a [PokéAPI](https://pokeapi.co) para exibir informações sobre Pokémon.

---

## Tecnologias

| Pacote | Versão |
|--------|--------|
| Expo SDK | 55.0.0 |
| React Native | 0.83.6 |
| React | 19.2.0 |
| @react-navigation/native | ^7.1.6 |
| @react-navigation/bottom-tabs | ^7.3.10 |
| expo-status-bar | ~55.0.6 |
| react-native-safe-area-context | ~5.6.0 |
| react-native-screens | ~4.23.0 |
| react-native-web | ^0.21.0 |
| @expo/metro-runtime | ~55.0.11 |

---

## Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **yarn**
- Para Android: Android Studio + emulador configurado
- Para iOS: macOS + Xcode
- Para testar no dispositivo físico: app **[Expo Go](https://expo.dev/go)**

---

## Instalação

```sh
npm install
```

---

## Como executar

### Dev server (mobile — Expo Go)

```sh
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android) ou com a câmera do iPhone (iOS).

### Web

```sh
npx expo start --web
# ou pressione 'w' no terminal após iniciar o dev server
```

### Android (emulador / dispositivo)

```sh
npx expo run:android
```

### iOS (apenas macOS)

```sh
npx expo run:ios
```

---

## Estrutura do projeto

```
PokeAPI/
├── assets/              # Ícones e splash screen
├── src/
│   ├── screens/         # Telas do app
│   │   ├── SeasonsScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── TypesScreen.tsx
│   ├── components/      # Componentes reutilizáveis
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonDetailModal.tsx
│   │   ├── SearchCard.tsx
│   │   └── CustomDrawer.tsx
│   ├── services/        # Chamadas à PokéAPI
│   └── styles/
│       └── theme.ts     # Design tokens / cores
├── App.tsx              # Navegação e root component
├── index.js             # Entry point (registerRootComponent)
├── app.json             # Configuração Expo
├── babel.config.js      # Preset: babel-preset-expo
└── metro.config.js      # Bundler: expo/metro-config
```

---

## Telas

- **Seasons** — Lista de gerações/regiões Pokémon
- **Search** — Busca de Pokémon por nome ou número
- **Types** — Explorador de tipos (Fogo, Água, Elétrico…)

---

## Comandos úteis

```sh
# Verificar saúde do projeto Expo
npx expo-doctor@latest

# Checar e corrigir versões de dependências
npx expo install --check

# Build para produção (requer conta Expo / EAS)
npx eas build
```

---

## Troubleshooting

**Web não abre / erro `react-native-web`**
```sh
npx expo install react-native-web react-dom @expo/metro-runtime
```

**Bundler travado com cache**
```sh
npx expo start --clear
```

**Conflito de dependências ao instalar**
```sh
npm install --legacy-peer-deps
```

---

## Recursos

- [Documentação Expo](https://docs.expo.dev)
- [PokéAPI](https://pokeapi.co)
- [React Navigation v7](https://reactnavigation.org)
- [Expo Go](https://expo.dev/go)
