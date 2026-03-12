# 📚 Painel de Ferramentas ENEM - Guia de Implementação

## 📋 Visão Geral

Este é um painel modular para ferramentas de estudo do ENEM. Ele permite adicionar e gerenciar múltiplas ferramentas em um único lugar, com navegação intuitiva e responsiva.

---

## 🎯 Arquivos Criados

- **painel.html** - Estrutura base do painel com menu lateral
- **painel.css** - Estilos responsivos
- **painel.js** - Lógica de navegação e gerenciamento de ferramentas

---

## 🚀 Como Usar

### Abrir o Painel

1. Abra o arquivo `painel.html` em seu navegador
2. O painel carregará com a ferramenta "Organizador de Redação" ativa por padrão
3. Clique nos botões do menu lateral para navegar entre ferramentas

---

## 🛠️ Ferramentas Includas

1. **✍️ Organizador de Redação** - Sua ferramenta ENEM (carregada via iframe)
2. **📖 Resumidor de Textos** - Em desenvolvimento
3. **📅 Cronograma de Estudos** - Em desenvolvimento  
4. **🧠 Técnicas de Memorização** - Em desenvolvimento
5. **❓ Banco de Questões** - Em desenvolvimento

---

## 📝 Como Adicionar Novas Ferramentas

### Método 1: Adicionar uma ferramenta HTML nativa

#### Passo 1: Adicionar botão no HTML

Abra `painel.html` e adicione um novo item no `<ul id="ferramentas-lista">`:

```html
<li>
  <button class="ferramenta-btn" data-ferramenta="minhaferramenta">
    <span class="ferramenta-icon">🎨</span>
    <span class="ferramenta-nome">Minha Ferramenta</span>
  </button>
</li>
```

#### Passo 2: Adicionar seção de conteúdo

Ainda em `painel.html`, adicione uma `<section>` em `.ferramentas-container`:

```html
<section id="minhaferramenta" class="ferramenta-content">
  <h2>Minha Ferramenta</h2>
  <p>Conteúdo aqui...</p>
</section>
```

#### Passo 3: Registrar no painel.js

Abra `painel.js` e adicione à object `FERRAMENTAS`:

```javascript
const FERRAMENTAS = {
  redacao: { ... },
  minhaferramenta: {
    titulo: 'Minha Ferramenta',
    descricao: 'Descrição breve',
    icon: '🎨'
  }
};
```

### Método 2: Adicionar ferramenta via JavaScript (Dinâmico)

Use a função `adicionarFerramenta()` no seu código:

```javascript
adicionarFerramenta('minhaferramenta', {
  titulo: 'Minha Ferramenta',
  descricao: 'Descrição breve',
  icon: '🎨',
  html: '<div class="ferramenta-content"><h2>Conteúdo da ferramenta</h2></div>'
});

// Depois, carregar a ferramenta
carregarFerramenta('minhaferramenta');
```

### Método 3: Carregar ferramenta via iframe

Para carregar um arquivo HTML externo (como você fez com a Redação):

```html
<section id="minhaferramenta" class="ferramenta-content">
  <iframe src="meu-arquivo.html" class="ferramenta-iframe" style="border:none;"></iframe>
</section>
```

---

## 🎨 Personalização

### Cores do Painel

Os estilos usam variáveis CSS. Edite em `painel.css`:

```css
:root {
  --accent: #db2777;           /* Cor de destaque */
  --bg: #110b10;               /* Fundo principal */
  --sidebar-bg: #0d0708;       /* Fundo da sidebar */
  ...
}
```

### Largura da Sidebar

Em `painel.css`:

```css
.sidebar {
  width: 280px;  /* Altere para seu tamanho desejado */
}
```

---

## 📱 Responsividade

O painel é totalmente responsivo:

- **Desktop (> 1024px)** - Sidebar fixa, layout de coluna
- **Tablet (768px - 1024px)** - Sidebar ligeramente reduzida
- **Mobile (< 768px)** - Sidebar colapsável com menu toggle

---

## 🔄 Gerenciar Estado da Ferramenta

### Salvar ferramenta ativa

A ferramenta ativa é salva automaticamente no `localStorage`:

```javascript
localStorage.setItem('ferramentaAtiva', 'redacao');
```

### Restaurar ferramenta ao recarregar

Ocorre automaticamente. A última ferramenta aberta será restaurada.

---

## 🎯 Funções Disponíveis no painel.js

### `carregarFerramenta(ferramentaId)`
Carrega uma ferramenta e atualiza o painel.

```javascript
carregarFerramenta('redacao');
```

### `adicionarFerramenta(id, config)`
Adiciona uma nova ferramenta dinamicamente.

```javascript
adicionarFerramenta('nova-ferramenta', {
  titulo: 'Nova Ferramenta',
  descricao: 'Descrição',
  icon: '⭐'
});
```

### `onFerramenta(ferramentaId, callback)`
Registra um callback quando uma ferramenta está ativa.

```javascript
onFerramenta('redacao', () => {
  console.log('Redação está ativa');
});
```

---

## 🔧 Exemplos de Implementação

### Exemplo 1: Adicionar Calculadora

**HTML:**
```html
<li>
  <button class="ferramenta-btn" data-ferramenta="calculadora">
    <span class="ferramenta-icon">🧮</span>
    <span class="ferramenta-nome">Calculadora</span>
  </button>
</li>
```

**Seção:**
```html
<section id="calculadora" class="ferramenta-content">
  <input type="number" placeholder="Digite um número">
  <button>Calcular</button>
  <p id="resultado"></p>
</section>
```

**painel.js:**
```javascript
FERRAMENTAS.calculadora = {
  titulo: 'Calculadora',
  descricao: 'Ferramenta de cálculos rápidos',
  icon: '🧮'
};
```

### Exemplo 2: Adicionar Dicionário

```javascript
adicionarFerramenta('dicionario', {
  titulo: 'Dicionário',
  descricao: 'Consulte significados e sinônimos',
  icon: '📕',
  html: `
    <div style="padding: 2rem;">
      <input type="text" placeholder="Buscar palavra..." style="width: 100%; padding: .5rem;">
      <div id="resultado-dicionario" style="margin-top: 2rem;"></div>
    </div>
  `
});
```

---

## 📊 Estrutura de Dados - FERRAMENTAS

Cada ferramenta é um objeto com:

```javascript
{
  titulo: string,        // Título exibido no header
  descricao: string,     // Descrição exibida no header
  icon: string          // Emoji ou ícone
}
```

---

## 🐛 Debug e Logs

O painel registra log no console. Abra o DevTools (F12) e veja:

```
🚀 Painel iniciado com sucesso!
📊 Ferramentas disponíveis: (5) ['redacao', 'resumo', 'cronograma', 'memorizar', 'questoes']
✓ Ferramenta carregada: redacao
```

---

## ✅ Checklist de Expansão

_Use este checklist quando for adicionar novas ferramentas:_

- [ ] Adicionar botão em `ferramentas-lista`
- [ ] Adicionar seção em `ferramentas-container`
- [ ] Registrar em `FERRAMENTAS` (painel.js)
- [ ] Testar navegação
- [ ] Testar responsividade em mobile
- [ ] Adicionar conteúdo/funcionalidade
- [ ] Testar localStorage

---

## 🎓 Próximos Passos

1. **Desenvolver ferramentas** - Implemente o conteúdo das ferramentas em desenvolvimento
2. **Adicionar banco de dados** - Considere usar LocalStorage ou uma API
3. **Sistema de usuário** - Salve progresso do usuário
4. **Tema escuro/claro** - Adicione toggle de tema
5. **Exportar dados** - Permita exportar resumos, cronogramas, etc.

---

## 💡 Dicas Úteis

- Mantenha as ferramentas modulares e independentes
- Use iframes para carregar ferramentas em arquivos HTML separados
- Aproveite o localStorage para persistência de dados
- Teste sempre em mobile!
- Use espaçamento e cores consistentes

---

## 📞 Suporte

Para adicionar uma ferramenta com funcionalidade específica, consulte os arquivos-exemplo ou a documentação de painel.js.

**Divirta-se desenvolvendo!** 🚀
