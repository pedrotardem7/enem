// =============================================
// Organizador de Redação ENEM — script.js
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- SELETORES ----------
  const campos = {
    introContexto:    document.getElementById('intro-contexto'),
    introTese:        document.getElementById('intro-tese'),
    d1Argumento:      document.getElementById('d1-argumento'),
    d1Explicacao:     document.getElementById('d1-explicacao'),
    d1Repertorio:     document.getElementById('d1-repertorio'),
    d2Argumento:      document.getElementById('d2-argumento'),
    d2Explicacao:     document.getElementById('d2-explicacao'),
    d2Repertorio:     document.getElementById('d2-repertorio'),
    concRetomada:     document.getElementById('conc-retomada'),
    concAgente:       document.getElementById('conc-agente'),
    concAcao:         document.getElementById('conc-acao'),
    concMeio:         document.getElementById('conc-meio'),
    concFinalidade:   document.getElementById('conc-finalidade'),
    concDetalhamento: document.getElementById('conc-detalhamento'),
  };

  const statPalavras   = document.getElementById('stat-palavras');
  const statLinhas     = document.getElementById('stat-linhas');
  const statCaracteres = document.getElementById('stat-caracteres');
  const avisosBox      = document.getElementById('avisos');
  const checklistBar   = document.getElementById('checklist-bar');
  const checklistCount = document.getElementById('checklist-count');
  const btnGerar       = document.getElementById('btn-gerar');
  const btnFolha        = document.getElementById('btn-folha');
  const btnCopiar       = document.getElementById('btn-copiar');
  const btnLimpar      = document.getElementById('btn-limpar');
  const redacaoFinal   = document.getElementById('redacao-final');
  const redacaoTexto   = document.getElementById('redacao-texto');
  const toast          = document.getElementById('toast');

  // ---------- DICAS CONTEXTUAIS (botões ?) ----------

  document.querySelectorAll('.btn-dica').forEach(btn => {
    btn.addEventListener('click', () => {
      const dicaId = 'dica-' + btn.dataset.dica;
      const dicaEl = document.getElementById(dicaId);
      if (!dicaEl) return;

      const estaVisivel = !dicaEl.hidden;

      // Fecha todas as outras dicas abertas
      document.querySelectorAll('.dica-contextual').forEach(d => { d.hidden = true; });
      document.querySelectorAll('.btn-dica').forEach(b => { b.classList.remove('active'); });

      // Toggle da dica clicada
      if (!estaVisivel) {
        dicaEl.hidden = false;
        btn.classList.add('active');
      }
    });
  });

  // ---------- HELPERS ----------

  /** Retorna todo o texto da redação concatenado */
  function getTextoCompleto() {
    return Object.values(campos)
      .map(el => el.value.trim())
      .filter(Boolean)
      .join(' ');
  }

  /** Conta palavras de uma string */
  function contarPalavras(texto) {
    if (!texto.trim()) return 0;
    return texto.trim().split(/\s+/).length;
  }

  /**
   * Estima linhas de caderno ENEM (~33 caracteres por linha manuscrita)
   * Cada parágrafo novo ocupa ao menos 1 linha
   */
  function estimarLinhas(texto) {
    if (!texto.trim()) return 0;
    const paragrafos = texto.split(/\n+/).filter(p => p.trim());
    let linhas = 0;
    for (const p of paragrafos) {
      linhas += Math.max(1, Math.ceil(p.length / 33));
    }
    return linhas;
  }

  /** Mostra um toast temporário */
  function showToast(msg, duracao = 2500) {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, duracao);
  }

  // ---------- PROGRESSO VISUAL POR SEÇÃO ----------

  const secoes = {
    intro: {
      campos: [campos.introContexto, campos.introTese],
      step: document.querySelector('.progresso-step[data-secao="intro"]'),
    },
    d1: {
      campos: [campos.d1Argumento, campos.d1Explicacao, campos.d1Repertorio],
      step: document.querySelector('.progresso-step[data-secao="d1"]'),
    },
    d2: {
      campos: [campos.d2Argumento, campos.d2Explicacao, campos.d2Repertorio],
      step: document.querySelector('.progresso-step[data-secao="d2"]'),
    },
    conc: {
      campos: [campos.concRetomada, campos.concAgente, campos.concAcao, campos.concMeio, campos.concFinalidade, campos.concDetalhamento],
      step: document.querySelector('.progresso-step[data-secao="conc"]'),
    },
  };

  function atualizarProgresso() {
    const keys = Object.keys(secoes);
    const lines = document.querySelectorAll('.step-line');

    keys.forEach((key, i) => {
      const sec = secoes[key];
      const preenchidos = sec.campos.filter(c => c.value.trim()).length;
      const total = sec.campos.length;

      sec.step.classList.remove('partial', 'done');
      if (preenchidos === total) {
        sec.step.classList.add('done');
      } else if (preenchidos > 0) {
        sec.step.classList.add('partial');
      }

      // Atualizar linha entre steps
      if (i < lines.length) {
        lines[i].classList.remove('partial', 'done');
        // A linha fica "done" se a seção atual está completa
        if (preenchidos === total) {
          lines[i].classList.add('done');
        } else if (preenchidos > 0) {
          lines[i].classList.add('partial');
        }
      }
    });
  }

  // ---------- ATUALIZAR ESTATÍSTICAS ----------

  function atualizarStats() {
    const texto    = getTextoCompleto();
    const palavras = contarPalavras(texto);
    const linhas   = estimarLinhas(texto);
    const chars    = texto.length;

    // Palavras
    statPalavras.textContent = palavras;
    statPalavras.className = 'stat-value';
    if (palavras >= 220 && palavras <= 300) {
      statPalavras.classList.add('ok');
    } else if (palavras > 300 || (palavras > 0 && palavras < 220)) {
      statPalavras.classList.add('warn');
    }

    // Linhas
    statLinhas.textContent = linhas;
    statLinhas.className = 'stat-value';
    if (linhas > 30) {
      statLinhas.classList.add('over');
    } else if (linhas >= 25) {
      statLinhas.classList.add('warn');
    } else if (linhas > 0) {
      statLinhas.classList.add('ok');
    }

    // Caracteres
    statCaracteres.textContent = chars;
  }

  // ---------- AVISOS AUTOMÁTICOS ----------

  function atualizarAvisos() {
    const avisos = [];

    // Introdução vazia
    if (!campos.introContexto.value.trim() && !campos.introTese.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Sua introdução está vazia' });
    } else if (!campos.introTese.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Falta apresentar a tese na introdução' });
    }

    // Desenvolvimento 1
    if (!campos.d1Argumento.value.trim() && !campos.d1Explicacao.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Desenvolvimento 1 está vazio' });
    } else if (!campos.d1Repertorio.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Falta repertório sociocultural no Desenvolvimento 1' });
    }

    // Desenvolvimento 2
    if (!campos.d2Argumento.value.trim() && !campos.d2Explicacao.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Desenvolvimento 2 está vazio' });
    } else if (!campos.d2Repertorio.value.trim()) {
      avisos.push({ tipo: 'warn', msg: '⚠️ Falta repertório sociocultural no Desenvolvimento 2' });
    }

    // Conclusão — proposta de intervenção
    const propCampos = [
      { el: campos.concAgente,       nome: 'agente' },
      { el: campos.concAcao,         nome: 'ação' },
      { el: campos.concMeio,         nome: 'meio' },
      { el: campos.concFinalidade,   nome: 'finalidade' },
      { el: campos.concDetalhamento, nome: 'detalhamento' },
    ];

    const propVazios = propCampos.filter(c => !c.el.value.trim());
    if (propVazios.length === propCampos.length) {
      avisos.push({ tipo: 'error', msg: '❌ Falta proposta de intervenção (zera a Competência 5!)' });
    } else if (propVazios.length > 0) {
      const faltam = propVazios.map(c => c.nome).join(', ');
      avisos.push({ tipo: 'warn', msg: `⚠️ Proposta de intervenção incompleta — falta: ${faltam}` });
    }

    // Linhas
    const texto  = getTextoCompleto();
    const linhas = estimarLinhas(texto);
    if (linhas > 30) {
      avisos.push({ tipo: 'error', msg: `❌ Sua redação ultrapassou 30 linhas (≈${linhas} linhas). Reduza o texto!` });
    }

    // Palavras
    const palavras = contarPalavras(texto);
    if (palavras > 0 && palavras < 200) {
      avisos.push({ tipo: 'warn', msg: `⚠️ Sua redação está curta (${palavras} palavras). Tente chegar a pelo menos 220.` });
    }

    // Tudo OK
    if (avisos.length === 0 && palavras > 0) {
      avisos.push({ tipo: 'ok', msg: '✅ Tudo parece estar em ordem! Revise e gere a versão final.' });
    }

    // Renderizar
    avisosBox.innerHTML = avisos
      .map(a => `<div class="aviso ${a.tipo}">${a.msg}</div>`)
      .join('');
  }

  // ---------- CHECKLIST ----------

  function atualizarChecklist() {
    const checks  = document.querySelectorAll('.checklist input[type="checkbox"]');
    const total   = checks.length;
    const marcados = [...checks].filter(c => c.checked).length;

    checklistCount.textContent = marcados;
    checklistBar.style.width   = `${(marcados / total) * 100}%`;
  }

  document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', atualizarChecklist);
  });

  // ---------- CONECTIVOS — COPIAR AO CLICAR ----------

  document.querySelectorAll('.tag[data-copy]').forEach(tag => {
    tag.addEventListener('click', () => {
      const texto = tag.textContent.trim();
      navigator.clipboard.writeText(texto).then(() => {
        tag.classList.add('copied');
        showToast(`"${texto}" copiado!`);
        setTimeout(() => tag.classList.remove('copied'), 1500);
      });
    });
  });

  // ---------- GERAR REDAÇÃO ----------

  function gerarRedacao() {
    const partes = [];

    // Introdução
    const intro = [campos.introContexto.value.trim(), campos.introTese.value.trim()]
      .filter(Boolean).join(' ');
    if (intro) partes.push(intro);

    // Desenvolvimento 1
    const d1 = [campos.d1Argumento.value.trim(), campos.d1Explicacao.value.trim(), campos.d1Repertorio.value.trim()]
      .filter(Boolean).join(' ');
    if (d1) partes.push(d1);

    // Desenvolvimento 2
    const d2 = [campos.d2Argumento.value.trim(), campos.d2Explicacao.value.trim(), campos.d2Repertorio.value.trim()]
      .filter(Boolean).join(' ');
    if (d2) partes.push(d2);

    // Conclusão
    const conc = [
      campos.concRetomada.value.trim(),
      campos.concAgente.value.trim(),
      campos.concAcao.value.trim(),
      campos.concMeio.value.trim(),
      campos.concFinalidade.value.trim(),
      campos.concDetalhamento.value.trim(),
    ].filter(Boolean).join(' ');
    if (conc) partes.push(conc);

    if (partes.length === 0) {
      showToast('Preencha pelo menos um campo!');
      return;
    }

    const textoFinal = partes.join('\n\n');
    redacaoTexto.textContent = textoFinal;
    redacaoFinal.hidden = false;
    btnCopiar.disabled  = false;
    btnFolha.disabled   = false;

    showToast('Redação gerada com sucesso!');

    // Scroll suave até o resultado
    redacaoFinal.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  btnGerar.addEventListener('click', gerarRedacao);

  // ---------- COPIAR REDAÇÃO ----------

  btnCopiar.addEventListener('click', () => {
    const texto = redacaoTexto.textContent;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      showToast('Redação copiada para a área de transferência!');
    });
  });

  // ---------- LIMPAR TUDO ----------

  btnLimpar.addEventListener('click', () => {
    if (!confirm('Tem certeza que deseja limpar todos os campos?')) return;

    // Limpar campos de texto
    document.getElementById('tema').value = '';
    Object.values(campos).forEach(el => { el.value = ''; });

    // Limpar checklist
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    // Resetar output
    redacaoFinal.hidden = true;
    redacaoTexto.textContent = '';
    btnCopiar.disabled = true;
    btnFolha.disabled  = true;

    // Atualizar tudo
    atualizarStats();
    atualizarAvisos();
    atualizarChecklist();

    showToast('Tudo limpo!');
  });

  // ---------- LISTENERS DE INPUT (atualização em tempo real) ----------

  const todosInputs = [document.getElementById('tema'), ...Object.values(campos)];

  todosInputs.forEach(el => {
    el.addEventListener('input', () => {
      atualizarStats();
      atualizarAvisos();
      atualizarProgresso();
    });
  });

  // ---------- SALVAR RASCUNHO NO LOCAL STORAGE ----------

  function salvar() {
    const dados = {};
    dados.tema = document.getElementById('tema').value;
    for (const [key, el] of Object.entries(campos)) {
      dados[key] = el.value;
    }
    // Salvar checklist
    const checks = {};
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
      checks[cb.dataset.comp] = cb.checked;
    });
    dados._checklist = checks;

    localStorage.setItem('redacao-enem-rascunho', JSON.stringify(dados));
  }

  function carregar() {
    const raw = localStorage.getItem('redacao-enem-rascunho');
    if (!raw) return;
    try {
      const dados = JSON.parse(raw);
      if (dados.tema) document.getElementById('tema').value = dados.tema;
      for (const [key, el] of Object.entries(campos)) {
        if (dados[key]) el.value = dados[key];
      }
      // Restaurar checklist
      if (dados._checklist) {
        document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
          if (dados._checklist[cb.dataset.comp] !== undefined) {
            cb.checked = dados._checklist[cb.dataset.comp];
          }
        });
      }
    } catch { /* dados corrompidos — ignora */ }
  }

  // Auto-save a cada alteração
  todosInputs.forEach(el => {
    el.addEventListener('input', salvar);
  });
  document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', salvar);
  });

  // ---------- INICIALIZAÇÃO ----------

  carregar();
  atualizarStats();
  atualizarAvisos();
  atualizarChecklist();
  atualizarProgresso();

  // ---------- MODO FOLHA DE REDAÇÃO ----------

  const folhaOverlay   = document.getElementById('folha-overlay');
  const folhaPapel     = document.getElementById('folha-papel');
  const folhaTemaTexto = document.getElementById('folha-tema-texto');
  const folhaLinhasUsd = document.getElementById('folha-linhas-usadas');
  const btnFecharFolha = document.getElementById('btn-fechar-folha');
  const btnImprimir    = document.getElementById('btn-imprimir');

  const CHARS_POR_LINHA = 68; // chars por linha na folha ENEM (letra de fôrma)
  const MAX_LINHAS = 30;

  /**
   * Quebra o texto da redação em linhas simulando a folha ENEM.
   * Respeita quebra por palavra e parágrafos.
   */
  function quebrarEmLinhas(texto) {
    const paragrafos = texto.split('\n');
    const linhas = [];

    for (let pi = 0; pi < paragrafos.length; pi++) {
      const paragrafo = paragrafos[pi].trim();
      if (!paragrafo) {
        // Parágrafo vazio = pular uma linha (se não for o primeiro)
        if (linhas.length > 0) continue;
        continue;
      }

      const palavras = paragrafo.split(/\s+/);
      let linhaAtual = '';
      let primeiraDoParag = true;

      for (const palavra of palavras) {
        const teste = linhaAtual ? linhaAtual + ' ' + palavra : palavra;
        // Contar espaço extra na primeira linha do parágrafo (recuo)
        const limite = primeiraDoParag ? CHARS_POR_LINHA - 8 : CHARS_POR_LINHA;

        if (teste.length > limite) {
          linhas.push({ texto: linhaAtual, inicioParag: primeiraDoParag });
          primeiraDoParag = false;
          linhaAtual = palavra;
        } else {
          linhaAtual = teste;
        }
      }
      if (linhaAtual) {
        linhas.push({ texto: linhaAtual, inicioParag: primeiraDoParag });
      }
    }

    return linhas;
  }

  function abrirFolha() {
    const texto = redacaoTexto.textContent;
    if (!texto) return;

    // Tema
    const temaVal = document.getElementById('tema').value.trim();
    folhaTemaTexto.textContent = temaVal || '(sem tema definido)';

    // Quebrar texto em linhas
    const linhasTexto = quebrarEmLinhas(texto);

    // Gerar as 30 linhas (ou mais se ultrapassar)
    const totalLinhas = Math.max(MAX_LINHAS, linhasTexto.length);
    folhaPapel.innerHTML = '';

    for (let i = 0; i < totalLinhas; i++) {
      const div = document.createElement('div');
      div.className = 'folha-linha';

      if (i >= MAX_LINHAS) div.classList.add('excedente');

      const item = linhasTexto[i];

      if (item) {
        if (item.inicioParag) div.classList.add('paragrafo-inicio');
      } else {
        div.classList.add('vazia');
      }

      div.innerHTML = `
        <span class="folha-linha-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="folha-linha-texto">${item ? escapeHTML(item.texto) : '&nbsp;'}</span>
      `;

      folhaPapel.appendChild(div);
    }

    // Contador
    const usadas = linhasTexto.length;
    folhaLinhasUsd.textContent = usadas;
    if (usadas > MAX_LINHAS) {
      folhaLinhasUsd.style.color = 'var(--danger)';
    } else {
      folhaLinhasUsd.style.color = '';
    }

    folhaOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function fecharFolha() {
    folhaOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  btnFolha.addEventListener('click', abrirFolha);
  btnFecharFolha.addEventListener('click', fecharFolha);

  // Fechar ao clicar fora do modal
  folhaOverlay.addEventListener('click', (e) => {
    if (e.target === folhaOverlay) fecharFolha();
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !folhaOverlay.hidden) fecharFolha();
  });

  // Imprimir
  btnImprimir.addEventListener('click', () => {
    window.print();
  });
});
