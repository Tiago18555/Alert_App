# Alert Client App

Este projeto é uma aplicação móvel desenvolvida com **Ionic** e **Angular**, utilizando **Capacitor** para integração com dispositivos Android. O aplicativo se conecta a um backend via **SignalR** para monitoramento e alertas.

---

## Passo a Passo para Build

Siga as etapas abaixo para configurar e compilar o projeto localmente.

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v18+)
- [Ionic CLI](https://ionicframework.com/docs/intro/cli) (`npm install -g @ionic/cli`)
- [Android Studio](https://developer.android.com/studio) (com SDK Android configurado)

### 2. Instalação de Dependências
No diretório raiz do projeto, execute:
```bash
npm install
```

### 3. Configuração do Ambiente (.env)
O aplicativo utiliza um script para sincronizar as variáveis do arquivo `.env` com os arquivos de ambiente do Angular automaticamente.
1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Edite o arquivo `.env` e ajuste a `SIGNALR_URL`:
   ```env
   SIGNALR_URL=https://sua-url-do-backend.com
   ```

**Nota:** Os arquivos em `src/environments/` agora são gerados automaticamente sempre que você executa `npm start` ou `npm run build`. Não os edite manualmente.

Para rodar a sincronização manualmente:
```bash
npm run config
```

### 4. Build da Web
Gere os arquivos estáticos do Angular:
```bash
npm run build
```

### 5. Sincronização com Android
Sincronize o build da web com o projeto nativo Android:
```bash
npx cap sync
```

---

## 📱 Teste com ADB (Android Debug Bridge)

Para testar o aplicativo diretamente em um dispositivo físico ou emulador.

### 1. Conectar o Dispositivo
Habilite o "Depuração USB" nas opções de desenvolvedor do seu Android e conecte-o ao PC. Verifique a conexão:
```bash
adb devices
```

### 2. Executar o App
Você pode abrir o projeto no Android Studio para rodar manualmente ou usar o CLI:
```bash
npx cap run android
```

### 3. Comandos Úteis do ADB
- **Logcat (Logs em tempo real):**
  Filtre os logs para ver o que está acontecendo no app:
  ```bash
  adb logcat | grep "Capacitor"
  ```
- **Instalar APK manualmente:**
  ```bash
  adb install android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Redirecionamento de porta (se estiver usando backend local):**
  Se o seu servidor estiver rodando no `localhost:5000` do PC:
  ```bash
  adb reverse tcp:5000 tcp:5000
  ```

---

## 🛠️ Geração do Arquivo .env

Para automatizar a criação do arquivo `.env` em ambientes de CI/CD ou novos setups, você pode usar o seguinte comando no terminal:

```bash
echo "SIGNALR_URL=https://alert-system-tdde.onrender.com" > .env
```

Ou, se desejar criar um script simples para garantir que as variáveis sejam aplicadas ao build do Angular, considere adicionar um script de pré-build que leia o `.env` e atualize o `environment.ts`.

---

## 📝 Notas Adicionais
- **Foreground Service:** O app utiliza um serviço de primeiro plano para manter a conexão SignalR ativa. Certifique-se de conceder as permissões necessárias no dispositivo.
- **Permissões:** O app requer permissões de notificações e internet.
