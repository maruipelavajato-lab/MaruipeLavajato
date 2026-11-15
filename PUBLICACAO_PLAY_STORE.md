# Guia Oficial de Publicação, Assinatura Automática e Atualizações — Google Play Store

**Aplicativo:** Maruípe Lava Jato  
**Package ID (`applicationId`):** `com.maruipelavajato.app`  
**Target SDK:** Android 15 (API 35) | **Min SDK:** Android 6.0 (API 23)  
**Desenvolvedor:** Maruípe Lava Jato Estética Automotiva (Vitória/ES)  
**E-mail de Suporte:** `maruipelavajato@gmail.com`  

---

## 1. Como o GitHub Actions gera seu APK e AAB automaticamente
Este projeto já inclui o fluxo oficial `.github/workflows/android-release.yml`.  
Sempre que você enviar os arquivos para o repositório `maruipelavajato-lab/MaruipeLavajato` no GitHub (ou clicar em **Actions → Build Android Release APK & AAB → Run workflow**), o próprio servidor do GitHub:
1. Instala Node 20, Java 17 e Android SDK 35.
2. Compila o site/app (`npm run build` + `npx cap sync android`).
3. Compila e assina **`Maruipe-Lava-Jato-PlayStore.aab`** e **`Maruipe-Lava-Jato-Zion.apk`**.
4. Executa verificações automáticas reais com **`apksigner verify`** e **`aapt2 dump permissions`**.
5. Disponibiliza os dois arquivos prontos para download direto na aba **Releases** (`releases/latest`) e **Actions** do GitHub.

---

## 2. Como configurar a Chave de Assinatura Permanente (Obrigatório antes da Play Store)
A Google Play Store exige que **todas as atualizações futuras** tenham a **mesma chave de assinatura** do primeiro envio.

### Passo A — Criar o Keystore oficial uma única vez
Em qualquer terminal (Windows PowerShell/Git Bash, Mac, Linux ou Google Cloud Shell), gere o arquivo:
```bash
keytool -genkeypair -v -keystore maruipe-upload-keystore.jks \
  -storetype PKCS12 -alias maruipe_upload -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Maruipe Lava Jato, OU=Estetica Automotiva, O=Maruipe Lava Jato Estetica Automotiva, L=Vitoria, ST=ES, C=BR"
```
Guarde o arquivo `maruipe-upload-keystore.jks` e a senha escolhida em **dois locais seguros privados** (ex.: Google Drive privado + pendrive). **Nunca publique esse arquivo no GitHub.**

### Passo B — Converter em Base64 e salvar nos Secrets do GitHub
Converta o arquivo para texto Base64:
- **Linux/Mac:** `base64 -w 0 maruipe-upload-keystore.jks`
- **Windows PowerShell:** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("maruipe-upload-keystore.jks"))`

No seu repositório GitHub, acesse **Settings → Secrets and variables → Actions → New repository secret** e crie estes 4 segredos:
- `ANDROID_KEYSTORE_BASE64` → o texto Base64 gerado acima
- `ANDROID_KEYSTORE_PASSWORD` → a senha do keystore
- `ANDROID_KEY_ALIAS` → `maruipe_upload`
- `ANDROID_KEY_PASSWORD` → a senha da chave

---

## 3. Como publicar atualizações futuras
1. Altere o código e incremente a versão em `android/app/build.gradle`:
   - `versionCode` (sempre número inteiro maior: `1` → `2` → `3`...)
   - `versionName` (`"1.0.0"` → `"1.0.1"`...)
2. Faça push para o GitHub (ou rode manualmente o workflow em **Actions**).
3. Baixe `Maruipe-Lava-Jato-PlayStore.aab` na aba **Releases** e envie na Google Play Console.

---

## 4. Checklist de Segurança & Google Play Console
1. **Assinatura do Google Play (Play App Signing):** mantenha ativada na Google Play Console ao enviar o `.aab`.
2. **URL de Política de Privacidade:** `https://maruipe-lavajato-one.vercel.app/privacidade.html`
3. **Variável do Agente IA Zion na Vercel:** configure `GEMINI_API_KEY` (chave padrão `AIza...` de `aistudio.google.com/apikey`) em **Vercel → Settings → Environment Variables** e faça **Redeploy**.
4. **Permissões e Hardening do Manifesto:**
   - Apenas `android.permission.INTERNET`
   - `android:allowBackup="false"`, `android:usesCleartextTraffic="false"`, `network_security_config.xml` bloqueando HTTP puro e `webContentsDebuggingEnabled: false`.

---

## 5. Versão Nativa iOS (iPhone / iPad — App Store & TestFlight)
O projeto nativo iOS (`ios/App/App.xcworkspace`) já está configurado com o Bundle ID `com.maruipelavajato.app`, ícone 1024×1024 opaco e bloqueio HTTP (`NSAppTransportSecurity`).

* **Fluxo automático:** `.github/workflows/ios-release.yml` (executa em `macos-latest`).
* **Por que iPhone exige Apple Developer / TestFlight:** diferente do Android (que permite baixar e instalar o `.apk` direto no celular), a Apple bloqueia instalação direta de `.ipa` pelo navegador por políticas do iOS. Para distribuir aos clientes sem atalho:
  1. Cadastre os Secrets da sua conta Apple Developer no GitHub (`APPLE_CERTIFICATE_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_PROVISION_PROFILE_BASE64`, `APPLE_TEAM_ID`).
  2. O GitHub Actions gera automaticamente o `Maruipe-Lava-Jato-iOS.ipa` assinado para enviar ao **App Store Connect / TestFlight**.
  3. Cole o link da **App Store** ou **TestFlight** no **Painel Admin → Link Apple App Store (IOS_APP_LINK)** do site.

