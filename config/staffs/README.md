# 👥 Pasta de Staff (Imagens)

Coloque aqui as fotos dos membros da sua equipe para aparecerem no carrossel da tela de carregamento.

## 📌 Instruções:
1.  As imagens podem ser nos formatos **.png, .jpg ou .jpeg**.
    *   **Dica:** Use `.png` transparente para um efeito mais profissional.
2.  O nome do arquivo deve ser exatamente o mesmo que você colocar no `config.lua`.
    *   Exemplo no `config.lua`: `{ image = 'pedro.png', staff = 'Pedro - Admin' }`
    *   Arquivo na pasta: `config/staffs/pedro.png`

## 🛠️ Configuração:
No seu `config/config.lua`, você pode ativar ou desativar essa função em:
```lua
Config.ShowStaff = true -- true para mostrar, false para esconder
```

E adicionar os membros em:
```lua
Config.StaffList = {
    { image = 'staff1.png', staff = 'NOME DO STAFF' },
    -- ...
}
```
