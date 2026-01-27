# Modo desenvolvimento – ver alterações no navegador

## URL correta

No modo desenvolvimento a aplicação fica na **raiz** do servidor:

- **Use:** `http://localhost:8080/`
- **Login:** `http://localhost:8080/login`

Não use `http://localhost:8080/tatame/` em dev; o prefixo `/tatame/` é só no build de produção.

## Como rodar

1. Na pasta do projeto: `l:\APPS\tatame`
2. Execute: `npm run dev`
3. Abra no navegador: **http://localhost:8080/**

## Alterações não aparecem?

Siga nesta ordem:

### 1. Confirme a URL

Certifique-se de estar em **http://localhost:8080/** (com barra no final ou sem).  
Se estiver em outra porta ou em `/tatame/`, o conteúdo pode ser outro ou antigo.

### 2. Hard refresh no navegador

- **Windows:** `Ctrl + Shift + R` ou `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

Isso ignora cache e recarrega os assets.

### 3. Limpar cache do Vite e reiniciar

```bash
npm run dev:clean
```

Esse comando remove o cache do Vite (`node_modules/.vite`) e sobe o servidor de desenvolvimento.  
Se preferir, apague manualmente a pasta `node_modules\.vite` e rode `npm run dev` de novo.

### 4. Watch em rede / Windows (polling)

Se você edita em rede ou o watcher não dispara (alterações não disparam HMR), use:

```bash
set VITE_WATCH_POLLING=1
npm run dev
```

No PowerShell:

```powershell
$env:VITE_WATCH_POLLING="1"; npm run dev
```

O Vite passará a usar polling para detectar mudanças nos arquivos.

### 5. Um único processo de dev

Feche outras abas/terminais que estejam rodando `npm run dev` nesse projeto. Deixe apenas um processo ativo na pasta `l:\APPS\tatame`.

## Resumo

| Ambiente   | URL principal        | Base (Vite) |
|-----------|----------------------|------------|
| Desenvolvimento | http://localhost:8080/ | `/`        |
| Produção (build) | conforme deploy (ex.: /tatame/) | `/tatame/` |

---

**Última atualização:** Janeiro 2025
