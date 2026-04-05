# Instalação do infsh CLI no Windows

1. Abra o PowerShell como administrador.
2. Execute o comando abaixo para baixar o instalador:

```
irm https://raw.githubusercontent.com/inference-sh/skills/main/cli-install.ps1 | iex
```

3. Após a instalação, faça login:

```
infsh login
```

4. Agora você poderá rodar comandos como:

```
infsh app run google/gemini-3-pro-image-preview --input '{"prompt": "Seu prompt aqui", "images": ["CAMINHO/DA/IMAGEM"]}'
```

Se precisar de ajuda com algum passo, me avise!