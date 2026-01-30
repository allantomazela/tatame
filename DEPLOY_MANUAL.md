# Deploy manual (atualização no servidor)

Use este fluxo quando quiser atualizar o servidor enviando o build manualmente (sem GitHub Actions).

---

## 1. Gerar o deploy (já feito)

- **Build:** `npm run build` → gera a pasta `dist/`
- **Pacote:** `tatame-deploy.zip` na raiz do projeto (conteúdo de `dist/`)

Para regenerar no futuro:

```powershell
npm run build
Compress-Archive -Path "dist\*" -DestinationPath "tatame-deploy.zip" -Force
```

---

## 2. Enviar para o servidor

### Opção A: SCP (envio do zip e extração no servidor)

No PowerShell (substitua `usuario` e `servidor`):

```powershell
scp tatame-deploy.zip usuario@servidor:/tmp/
```

No servidor (SSH):

```bash
cd /var/www/tatame
sudo rm -rf assets index.html *.js *.css *.ico *.png *.svg *.txt
sudo unzip -o /tmp/tatame-deploy.zip -d /var/www/tatame
sudo chown -R www-data:www-data /var/www/tatame
rm /tmp/tatame-deploy.zip
```

### Opção B: Enviar pasta `dist/` direto

No PowerShell:

```powershell
scp -r dist/* usuario@servidor:/var/www/tatame/
```

(Ajuste usuário e caminho conforme seu servidor; pode ser necessário usar um usuário com permissão em `/var/www/tatame` e depois `sudo chown`.)

### Opção C: SFTP

1. Conecte por SFTP ao servidor.
2. Envie todo o conteúdo de `dist/` (ou o conteúdo extraído de `tatame-deploy.zip`) para `/var/www/tatame/`, sobrescrevendo os arquivos existentes.

---

## 3. No servidor

- Garanta que o Nginx (ou Apache) está configurado para servir `/var/www/tatame/` com fallback SPA para `index.html` (veja `nginx-tatamebrasil-root.conf`).
- Se alterou algo no Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

---

## 4. Variáveis de ambiente (build)

O `tatame-deploy.zip` foi gerado com as variáveis de ambiente do **momento do build**. Se você rodou `npm run build` na sua máquina, o app usa o Supabase definido no seu `.env` (ou vazio se não tiver). Para produção:

- **Recomendado:** Use o deploy via GitHub Actions (push em `main`), que usa os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de produção no build.
- **Deploy manual em prod:** Antes de rodar `npm run build`, defina no terminal:
  - Windows (PowerShell): `$env:VITE_SUPABASE_URL="https://SEU_PROJECT.supabase.co"; $env:VITE_SUPABASE_ANON_KEY="sua_anon_key"; npm run build`
  - Linux/macOS: `VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run build`  
  Depois gere o zip e envie para o servidor como acima.

---

*O arquivo `tatame-deploy.zip` está no `.gitignore` e não deve ser commitado.*
