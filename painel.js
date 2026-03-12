// =============================================
// Painel Premium — painel.js
// =============================================

const FERRAMENTAS = {
  redacao: {
    titulo: 'Organizador de Redação',
    descricao: 'Monte sua redação passo a passo seguindo a estrutura ideal',
    icon: '✍️',
    status: 'Ativo',
    statusClass: 'status-ativo'
  },
  cronograma: {
    titulo: 'Cronograma de Estudos',
    descricao: 'Planeje e acompanhe suas tarefas de estudo do dia',
    icon: '📅',
    status: 'Ativo',
    statusClass: 'status-ativo'
  }
};

const FRASES = [
  '"O segredo de progredir é começar." — Mark Twain',
  '"Disciplina é escolher entre o que você quer agora e o que você mais quer."',
  '"Não importa o quão devagar você vá, desde que não pare." — Confúcio',
  '"O sucesso é a soma de pequenos esforços repetidos dia após dia."',
  '"A persistência é o caminho do êxito." — Charles Chaplin',
  '"A educação é a arma mais poderosa para mudar o mundo." — Mandela',
  '"Cada dia é uma nova oportunidade de aprender algo que não sabia."',
  '"Você não precisa ser perfeito para começar."',
  '"O conhecimento é o único tesouro que aumenta quando é compartilhado."',
  '"O futuro pertence àqueles que se preparam para ele hoje."',
];

const SUBS = {
  manha: 'Bora começar o dia com tudo. Seu painel está pronto.',
  tarde: 'Continue firme. Cada hora de estudo conta.',
  noite: 'Estudar à noite mostra dedicação. Orgulhe-se.',
  madrugada: 'Descanse bem para render mais amanhã. 💤',
};

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  inicializarHero();
  gerarCardsFerramentas();
  configurarEventos();
  atualizarRelogio();
  setInterval(atualizarRelogio, 30000);
});

// =============================================
// HERO DINÂMICO
// =============================================

function inicializarHero() {
  const agora = new Date();
  const hora = agora.getHours();

  // Saudação
  let saudacao, sub;
  if (hora >= 5 && hora < 12) {
    saudacao = 'Bom dia,';
    sub = SUBS.manha;
  } else if (hora >= 12 && hora < 18) {
    saudacao = 'Boa tarde,';
    sub = SUBS.tarde;
  } else if (hora >= 18 && hora < 24) {
    saudacao = 'Boa noite,';
    sub = SUBS.noite;
  } else {
    saudacao = 'Boa noite,';
    sub = SUBS.madrugada;
  }

  document.getElementById('hero-greeting').textContent = saudacao;
  document.getElementById('hero-sub').textContent = sub;

  // Data
  const opcoesData = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('info-data').textContent = agora.toLocaleDateString('pt-BR', opcoesData);
  
  const diaSemana = agora.toLocaleDateString('pt-BR', { weekday: 'long' });
  document.getElementById('info-dia-semana').textContent = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  // Hora
  atualizarRelogio();

  // Tarefas de hoje
  atualizarInfoTarefas();

  // Frase do dia
  const indiceFrase = Math.floor(agora.getTime() / 86400000) % FRASES.length;
  document.getElementById('frase-hero').textContent = FRASES[indiceFrase];
}

function atualizarRelogio() {
  const agora = new Date();
  const hora = agora.getHours().toString().padStart(2, '0');
  const min = agora.getMinutes().toString().padStart(2, '0');
  const el = document.getElementById('info-hora');
  if (el) el.textContent = `${hora}:${min}`;
}

function atualizarInfoTarefas() {
  try {
    const dados = JSON.parse(localStorage.getItem('estudo_tarefas') || '{}');
    const hoje = new Date().toISOString().split('T')[0];
    if (dados.data === hoje && dados.tarefas) {
      const total = dados.tarefas.length;
      const feitas = dados.tarefas.filter(t => t.concluida).length;
      document.getElementById('info-tarefas').textContent = `${feitas}/${total}`;
    } else {
      document.getElementById('info-tarefas').textContent = '0';
    }
  } catch (e) {
    document.getElementById('info-tarefas').textContent = '0';
  }
}

// =============================================
// FERRAMENTAS
// =============================================

function gerarCardsFerramentas() {
  const grid = document.getElementById('grid-ferramentas');

  grid.innerHTML = Object.entries(FERRAMENTAS).map(([id, f]) => `
    <div class="ferramenta-card" onclick="abrirFerramenta('${id}')" role="button" tabindex="0">
      <div class="ferramenta-card-icon">${f.icon}</div>
      <h3 class="ferramenta-card-titulo">${f.titulo}</h3>
      <p class="ferramenta-card-descricao">${f.descricao}</p>
      <span class="ferramenta-card-status ${f.statusClass}">${f.status}</span>
    </div>
  `).join('');
}

function configurarEventos() {
  const btnVoltar = document.getElementById('btn-voltar');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', voltarTelaInicial);
  }

  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.classList.contains('ferramenta-card')) {
      document.activeElement.click();
    }
  });
}

function abrirFerramenta(ferramentaId) {
  if (!FERRAMENTAS[ferramentaId]) return;

  document.getElementById('tela-inicial').classList.remove('active');
  document.getElementById('tela-ferramenta').classList.add('active');
  document.getElementById('ferramenta-titulo').textContent = FERRAMENTAS[ferramentaId].titulo;

  document.querySelectorAll('.ferramenta-content').forEach(c => c.classList.remove('active'));

  const ferramenta = document.getElementById(ferramentaId);
  if (ferramenta) ferramenta.classList.add('active');
}

function voltarTelaInicial() {
  document.getElementById('tela-ferramenta').classList.remove('active');
  document.getElementById('tela-inicial').classList.add('active');

  // Atualizar info ao voltar
  atualizarInfoTarefas();
  atualizarRelogio();
}
