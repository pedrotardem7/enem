// =============================================
// Organizador de Redação ENEM — script.js
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- SELETORES ----------
  const campos = {
    introContexto:      document.getElementById('intro-contexto'),
    introTese:          document.getElementById('intro-tese'),
    d1Argumento:        document.getElementById('d1-argumento'),
    d1Repertorio:       document.getElementById('d1-repertorio'),
    d1Explicacao:       document.getElementById('d1-explicacao'),
    d1Exemplificacao:   document.getElementById('d1-exemplificacao'),
    d1Desfecho:         document.getElementById('d1-desfecho'),
    d2Argumento:        document.getElementById('d2-argumento'),
    d2Repertorio:       document.getElementById('d2-repertorio'),
    d2Explicacao:       document.getElementById('d2-explicacao'),
    d2Exemplificacao:   document.getElementById('d2-exemplificacao'),
    d2Desfecho:         document.getElementById('d2-desfecho'),
    concRetomada:       document.getElementById('conc-retomada'),
    concAgente1:        document.getElementById('conc-agente1'),
    concAcao1:          document.getElementById('conc-acao1'),
    concMeio1:          document.getElementById('conc-meio1'),
    concDetalhamento1:  document.getElementById('conc-detalhamento1'),
    concAgente2:        document.getElementById('conc-agente2'),
    concAcao2:          document.getElementById('conc-acao2'),
    concFinalidade:     document.getElementById('conc-finalidade'),
    concFraseDesfecho:  document.getElementById('conc-frasedesfecho'),
  };

  // estatísticas removidas; só usamos o contador na folha
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

  // ---------- BANCO DE REPERTÓRIOS (Carregado via repertorios.js) ----------

  function renderizarRepertorios() {
    const container = document.getElementById('repertorios-lista');
    if (!container) {
      console.warn('Elemento #repertorios-lista não encontrado');
      return;
    }

    // Verifica se window.REPERTORIOS foi carregado
    if (!window.REPERTORIOS || !window.REPERTORIOS.repertorios) {
      container.innerHTML = '<p style="color: var(--danger);">Erro: Repertórios não carregados.</p>';
      console.error('❌ window.REPERTORIOS não encontrado');
      return;
    }

    const data = window.REPERTORIOS;

    // Renderiza os repertórios
    container.innerHTML = data.repertorios.map(grupo => `
      <details class="rep-grupo" data-tema="${grupo.tema}">
        <summary><span class="rep-icone">${grupo.icone}</span> <strong>${grupo.titulo}</strong></summary>
        <div class="rep-cards">
          ${grupo.cards.map(card => `
            <div class="rep-card" data-copy>
              <span class="rep-tipo">${card.tipo}</span>
              <p class="rep-texto">${card.texto}</p>
              <span class="rep-autor">${card.autor}</span>
            </div>
          `).join('')}
        </div>
      </details>
    `).join('');

    console.log(`✓ ${data.repertorios.length} temas renderizados`);

    // Reabilitar eventos de cópia após renderizar
    ativarCopiaRepertorios();
  }

  // Ativa funcionalidade de cópia nos repertórios
  function ativarCopiaRepertorios() {
    document.querySelectorAll('.rep-card[data-copy]').forEach(card => {
      card.addEventListener('click', () => {
        const texto = card.querySelector('.rep-texto').textContent.trim();
        const autor = card.querySelector('.rep-autor').textContent.trim();
        const completo = texto + ' ' + autor;

        navigator.clipboard.writeText(completo).then(() => {
          card.classList.add('copied');
          showToast('Repertório copiado!');
          setTimeout(() => card.classList.remove('copied'), 1500);
        });
      });
    });
  }

  // Ativa filtro de repertórios
  function ativarFiltroRepertorios() {
    const filtroRep = document.getElementById('filtro-repertorios');
    if (!filtroRep) return;

    // Mostra todos inicialmente
    const mostrarTodos = () => {
      document.querySelectorAll('.rep-grupo').forEach(grupo => {
        grupo.hidden = false;
        grupo.open = false;
        grupo.querySelectorAll('.rep-card').forEach(c => { c.style.display = ''; });
      });
    };

    // Filtrar quando digita
    filtroRep.addEventListener('input', () => {
      const busca = filtroRep.value.toLowerCase().trim();
      
      if (!busca) {
        mostrarTodos();
        return;
      }

      const grupos = document.querySelectorAll('.rep-grupo');
      let temAlgoParaMostrar = false;

      grupos.forEach(grupo => {
        const temas = (grupo.dataset.tema || '').toLowerCase();
        const tituloGrupo = grupo.querySelector('summary strong').textContent.toLowerCase();

        let temMatch = false;
        grupo.querySelectorAll('.rep-card').forEach(card => {
          const textoCard = card.textContent.toLowerCase();
          if (textoCard.includes(busca) || temas.includes(busca) || tituloGrupo.includes(busca)) {
            card.style.display = '';
            temMatch = true;
            temAlgoParaMostrar = true;
          } else {
            card.style.display = 'none';
          }
        });

        grupo.hidden = !temMatch;
        if (temMatch) grupo.open = true;
      });

      // Debug
      if (!temAlgoParaMostrar) {
        console.log(`Nenhum repertório encontrado para: "${busca}"`);
      }
    });

    // Limpar filtro ao clicar no campo e pressionar Escape
    filtroRep.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        filtroRep.value = '';
        mostrarTodos();
      }
    });
  }

  // Renderiza repertórios ao iniciar
  renderizarRepertorios();
  ativarFiltroRepertorios();

  // ---------- HELPERS ----------

  /** Monta o texto completo da redação com parágrafos separados (igual ao "gerar redação") */
  function montarTextoCompleto() {
    const partes = [];

    // Função auxiliar: remove TODAS as quebras de linha internas dos campos
    const limpar = (txt) => txt.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

    const intro = [limpar(campos.introContexto.value), limpar(campos.introTese.value)]
      .filter(Boolean).join(' ');
    if (intro) partes.push(intro);

    const d1 = [limpar(campos.d1Argumento.value), limpar(campos.d1Repertorio.value), limpar(campos.d1Explicacao.value), limpar(campos.d1Exemplificacao.value), limpar(campos.d1Desfecho.value)]
      .filter(Boolean).join(' ');
    if (d1) partes.push(d1);

    const d2 = [limpar(campos.d2Argumento.value), limpar(campos.d2Repertorio.value), limpar(campos.d2Explicacao.value), limpar(campos.d2Exemplificacao.value), limpar(campos.d2Desfecho.value)]
      .filter(Boolean).join(' ');
    if (d2) partes.push(d2);

    const conc = [
      limpar(campos.concRetomada.value),
      limpar(campos.concAgente1.value),
      limpar(campos.concAcao1.value),
      limpar(campos.concMeio1.value),
      limpar(campos.concDetalhamento1.value),
      limpar(campos.concAgente2.value),
      limpar(campos.concAcao2.value),
      limpar(campos.concFinalidade.value),
      limpar(campos.concFraseDesfecho.value),
    ].filter(Boolean).join(' ');
    if (conc) partes.push(conc);

    return partes.join('\n\n');
  }

  /** Retorna todo o texto da redação concatenado (para contagem de palavras/chars) */
  function getTextoCompleto() {
    return Object.values(campos)
      .map(el => el.value.replace(/[\r\n]+/g, ' ').trim())
      .filter(Boolean)
      .join(' ');
  }

  /** Conta palavras de uma string */
  function contarPalavras(texto) {
    if (!texto.trim()) return 0;
    return texto.trim().split(/\s+/).length;
  }

  // ---------- MEDIÇÃO PRECISA COM CANVAS ----------

  const _mCanvas = document.createElement('canvas');
  const _mCtx = _mCanvas.getContext('2d');

  /**
   * Fontes que correspondem EXATAMENTE ao CSS da .folha-linha-texto.
   * 3.2mm, 3.8mm, 4.5mm convertidos para px (1mm ≈ 3.7795px).
   */
  const FOLHA_FONTS = {
    small:  '12.09px "Segoe Script", "Comic Sans MS", "Caveat", cursive',
    medium: '14.36px "Segoe Script", "Comic Sans MS", "Caveat", cursive',
    large:  '17.01px "Segoe Script", "Comic Sans MS", "Caveat", cursive',
  };

  /**
   * Largura fixa da área de texto baseada na folha ENEM real.
   * Folha = 17cm, padding esquerdo = 2cm, padding direito = 0.5cm.
   * Área de texto = 17 - 2 - 0.5 = 14.5cm.
   * 1cm ≈ 37.795px → 14.5cm ≈ 548px.
   */
  const FOLHA_LARGURA_TEXTO_PX = 14.5 * 37.795;
  const FOLHA_INDENT_PX = 2 * 37.795; // 2cm de indentação

  /** Largura medida do DOM (atualizada ao abrir folha, fallback = calculada) */
  let folhaLarguraCache = FOLHA_LARGURA_TEXTO_PX;
  let folhaIndentCache = FOLHA_INDENT_PX;

  /** Mede largura de uma string usando a mesma fonte do folha */
  function medirTexto(str, font) {
    _mCtx.font = font;
    return _mCtx.measureText(str).width;
  }

  /**
   * Quebra texto em linhas usando medição de pixels — 100% fiel ao rendering.
   * Substitui a antiga quebra por contagem de caracteres.
   */
  function quebrarEmLinhas(texto, fonteKey, largura, indent) {
    const font = FOLHA_FONTS[fonteKey] || FOLHA_FONTS.medium;
    const larg = largura || folhaLarguraCache;
    const indentPx = indent || folhaIndentCache;

    const textoNorm = texto.replace(/\r\n?/g, '\n');
    const paragrafos = textoNorm.split('\n');
    const linhas = [];

    for (const paragrafo of paragrafos) {
      const p = paragrafo.trim();
      if (!p) continue;

      const palavras = p.split(/\s+/);
      let linhaAtual = '';
      let primeiraDoParag = true;

      for (const palavra of palavras) {
        const teste = linhaAtual ? linhaAtual + ' ' + palavra : palavra;
        const largTeste = medirTexto(teste, font);
        const limite = primeiraDoParag ? (larg - indentPx) : larg;

        if (largTeste > limite && linhaAtual) {
          // Se a palavra sozinha é maior que a linha, força quebra dentro da palavra
          if (medirTexto(palavra, font) > limite) {
            // Quebra a palavra em pedaços que caibam na linha
            let resto = palavra;
            while (resto.length > 0) {
              let i = 1;
              while (i <= resto.length && medirTexto(resto.slice(0, i), font) <= limite) i++;
              i--;
              if (i === 0) i = 1; // nunca travar
              linhas.push({ texto: resto.slice(0, i), inicioParag: primeiraDoParag });
              primeiraDoParag = false;
              resto = resto.slice(i);
            }
            linhaAtual = '';
          } else {
            linhas.push({ texto: linhaAtual, inicioParag: primeiraDoParag });
            primeiraDoParag = false;
            linhaAtual = palavra;
          }
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

  /**
   * Estima linhas de caderno ENEM usando medição de pixels.
   * Usa fonte "medium" como referência (padrão da folha).
   */
  function estimarLinhas(texto) {
    if (!texto.trim()) return 0;
    return quebrarEmLinhas(texto, 'medium').length;
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
      campos: [campos.d1Argumento, campos.d1Repertorio, campos.d1Explicacao, campos.d1Exemplificacao, campos.d1Desfecho],
      step: document.querySelector('.progresso-step[data-secao="d1"]'),
    },
    d2: {
      campos: [campos.d2Argumento, campos.d2Repertorio, campos.d2Explicacao, campos.d2Exemplificacao, campos.d2Desfecho],
      step: document.querySelector('.progresso-step[data-secao="d2"]'),
    },
    conc: {
      campos: [campos.concRetomada, campos.concAgente1, campos.concAcao1, campos.concMeio1, campos.concDetalhamento1, campos.concAgente2, campos.concAcao2, campos.concFinalidade, campos.concFraseDesfecho],
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
    // painel de estatísticas removido; nada a atualizar aqui
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

    // Conclusão — propostas de intervenção (2 agentes)
    const prop1Campos = [
      { el: campos.concAgente1,       nome: 'agente 1' },
      { el: campos.concAcao1,         nome: 'ação 1' },
      { el: campos.concMeio1,         nome: 'meio 1' },
      { el: campos.concDetalhamento1, nome: 'detalhamento 1' },
    ];

    const prop2Campos = [
      { el: campos.concAgente2,     nome: 'agente 2' },
      { el: campos.concAcao2,       nome: 'ação 2' },
    ];

    const prop1Vazios = prop1Campos.filter(c => !c.el.value.trim());
    const prop2Vazios = prop2Campos.filter(c => !c.el.value.trim());
    const finalidadeVazia = !campos.concFinalidade.value.trim();

    if (prop1Vazios.length === prop1Campos.length && prop2Vazios.length === prop2Campos.length) {
      avisos.push({ tipo: 'error', msg: '❌ Falta proposta de intervenção (zera a Competência 5!)' });
    } else {
      const faltasP1 = prop1Vazios.map(c => c.nome);
      const faltasP2 = prop2Vazios.map(c => c.nome);
      const faltas = [...faltasP1, ...faltasP2];
      if (finalidadeVazia) faltas.push('finalidade');

      if (faltas.length > 0) {
        avisos.push({ tipo: 'warn', msg: `⚠️ Proposta incompleta — falta: ${faltas.join(', ')}` });
      }
    }

    // Linhas
    // (Aviso de ultrapassar 30 linhas removido a pedido do usuário)

    // Palavras
    const texto  = getTextoCompleto();
    const palavras = contarPalavras(texto);
    if (palavras > 0 && palavras < 200) {
      avisos.push({ tipo: 'warn', msg: `⚠️ Sua redação está curta (${palavras} palavras). Tente chegar a pelo menos 220.` });
    }

    // Tudo OK
    // (Aviso de tudo em ordem removido a pedido do usuário)

    // Renderizar
    if (avisosBox) {
      avisosBox.innerHTML = avisos
        .map(a => `<div class="aviso ${a.tipo}">${a.msg}</div>`)
        .join('');
    }
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

  // ---------- PROGRESSO: EVENTOS E INICIALIZAÇÃO ----------
  // Chama atualizarProgresso ao digitar em qualquer campo relevante
  Object.values(campos).forEach(campo => {
    campo.addEventListener('input', atualizarProgresso);
  });
  // Inicializa o progresso ao carregar a página
  atualizarProgresso();

  // ---------- GERAR REDAÇÃO ----------

  function gerarRedacao() {
    // Usa a mesma função que monta texto para stats (limpa enters)
    const textoFinal = montarTextoCompleto();

    if (!textoFinal.trim()) {
      showToast('Preencha pelo menos um campo!');
      return;
    }

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

    // Remover rascunho salvo
    localStorage.removeItem('redacao-enem-rascunho');

    // Atualizar tudo
    atualizarStats();
    atualizarAvisos();
    atualizarChecklist();
    atualizarProgresso();

    showToast('Tudo limpo!');
  });

  // ---------- LISTENERS DE INPUT (atualização em tempo real) ----------

  const todosInputs = [document.getElementById('tema'), ...Object.values(campos)];

  todosInputs.forEach(el => {
    el.addEventListener('input', () => {
      atualizarStats();
      atualizarAvisos();
      atualizarProgresso();
      // habilitar botão de folha se houver texto nos campos
      btnFolha.disabled = !getTextoCompleto().trim();
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

  // ---------- EXPORTAR / IMPORTAR PROJETO ----------

  const btnExportar    = document.getElementById('btn-exportar');
  const btnImportarUI  = document.getElementById('btn-importar');
  const inputImportar  = document.getElementById('input-importar');

  function coletarDados() {
    const dados = {};
    dados.tema = document.getElementById('tema').value;
    for (const [key, el] of Object.entries(campos)) {
      dados[key] = el.value;
    }
    const checks = {};
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
      checks[cb.dataset.comp] = cb.checked;
    });
    dados._checklist = checks;
    return dados;
  }

  function restaurarDados(dados) {
    if (dados.tema) document.getElementById('tema').value = dados.tema;
    for (const [key, el] of Object.entries(campos)) {
      if (dados[key] !== undefined) el.value = dados[key];
    }
    if (dados._checklist) {
      document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
        if (dados._checklist[cb.dataset.comp] !== undefined) {
          cb.checked = dados._checklist[cb.dataset.comp];
        }
      });
    }
    salvar();
    atualizarStats();
    atualizarAvisos();
    atualizarChecklist();
    atualizarProgresso();
  }

  // Exportar
  btnExportar.addEventListener('click', () => {
    const dados = coletarDados();
    dados._exportadoEm = new Date().toISOString();
    dados._versao = 'ENEM-SOPHINHA-v1';

    const tema = (dados.tema || 'sem-tema').replace(/[^a-zA-Z0-9À-ú ]/g, '').trim().replace(/\s+/g, '-').substring(0, 40);
    const dataStr = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `redacao-${tema}-${dataStr}.sophinha`;

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Projeto exportado com sucesso!');
  });

  // Importar — abrir seletor de arquivo
  btnImportarUI.addEventListener('click', () => {
    inputImportar.value = '';
    inputImportar.click();
  });

  // Importar — processar arquivo selecionado
  inputImportar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Informar arquivo selecionado (útil para debug)
    // Removido: não exibir nome ou caminho do arquivo importado

    // Validar extensão mínima
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'json' && ext !== 'sophinha') {
      showToast('Arquivo inválido! Use .sophinha ou .json', 3500);
      return;
    }

    if (file.size === 0) {
      showToast('Arquivo vazio. Verifique o arquivo selecionado.', 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        // remover BOM UTF-8 se presente e garantir string
        let text = ev.target.result;
        if (typeof text !== 'string') {
          try {
            text = new TextDecoder().decode(text);
          } catch (decErr) {
            console.error('Decoding error:', decErr);
          }
        }
        if (!text) throw new Error('Conteúdo do arquivo vazio');
        text = text.replace(/^\uFEFF/, '');

        const dados = JSON.parse(text);

        // Verificar se parece ser um arquivo válido
        const temCampos = Object.keys(campos).some(k => dados[k] !== undefined);
        if (!temCampos && !dados.tema) {
          showToast('Arquivo não contém dados de redação!', 3500);
          return;
        }

        // Confirmar substituição
        const textoAtual = getTextoCompleto();
        if (textoAtual.trim()) {
          const confirma = confirm('Isso vai substituir todos os campos atuais. Deseja continuar?');
          if (!confirma) return;
        }

        restaurarDados(dados);
        showToast('Projeto importado com sucesso!');
      } catch (err) {
        console.error('Erro ao importar arquivo:', err);
        // Mostrar mensagem de erro mais detalhada ao usuário
        const msg = err && err.message ? err.message : 'Erro ao ler o arquivo! Verifique se é um arquivo válido.';
        showToast(`Erro ao ler o arquivo: ${msg}`, 5500);
      }
    };
    reader.readAsText(file, 'utf-8');
  });

  // ---------- INICIALIZAÇÃO ----------

  carregar();
  atualizarStats();
  atualizarAvisos();
  atualizarChecklist();
  atualizarProgresso();

  // Se não existe rascunho salvo, garantir que progresso apareça zerado
  const hasSavedRascunho = !!localStorage.getItem('redacao-enem-rascunho');
  if (!hasSavedRascunho) {
    // limpar checklist visualmente
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('checklist-count').textContent = '0';
    const bar = document.getElementById('checklist-bar');
    if (bar) bar.style.width = '0%';

    // limpar indicadores de progresso (steps)
    document.querySelectorAll('.progresso-step').forEach(s => s.classList.remove('partial', 'done'));
    document.querySelectorAll('.step-line').forEach(l => l.classList.remove('partial', 'done'));
  }

  // ---------- MODO FOLHA DE REDAÇÃO ----------

  // Gerar caixinhas nos campos da folha
  document.querySelectorAll('.folha-caixinhas').forEach(container => {
    const qtd = parseInt(container.dataset.qtd) || 10;
    for (let i = 0; i < qtd; i++) {
      const box = document.createElement('div');
      box.className = 'folha-caixinha';
      container.appendChild(box);
    }
  });

  const folhaOverlay   = document.getElementById('folha-overlay');
  const folhaPapel     = document.getElementById('folha-papel');
  const folhaLinhasUsd = document.getElementById('folha-linhas-usadas');
  const btnFecharFolha = document.getElementById('btn-fechar-folha');
  const btnImprimir    = document.getElementById('btn-imprimir');

  const MAX_LINHAS = 30;
  const folhaFonte = document.getElementById('folha-fonte');

  // atualizar contador se o usuário trocar o tamanho de fonte com a folha aberta
  folhaFonte.addEventListener('change', () => {
    if (!folhaOverlay.hidden) {
      atualizarContadorFolha();
    }
  });

  function abrirFolha() {
    // se não houver texto já gerado, monta diretamente a partir dos campos
    let texto = redacaoTexto.textContent;
    if (!texto.trim()) {
      texto = montarTextoCompleto();
    }
    if (!texto) {
      showToast('Não há texto para abrir na folha.');
      return;
    }

    // Tamanho da fonte
    const tamanho = folhaFonte.value;

    // Aplicar classe de fonte
    folhaPapel.className = 'folha-papel fonte-' + tamanho;

    // ---- Medir largura real da área de texto no DOM ----
    folhaOverlay.hidden = false;
    document.body.style.overflow = 'hidden';

    // Criar linha temporária para medir largura normal
    folhaPapel.innerHTML = '';
    const tmpNormal = document.createElement('div');
    tmpNormal.className = 'folha-linha';
    tmpNormal.innerHTML = '<span class="folha-linha-num">01</span><span class="folha-linha-texto">X</span>';
    folhaPapel.appendChild(tmpNormal);

    // Criar linha temporária para medir largura com indentação
    const tmpIndent = document.createElement('div');
    tmpIndent.className = 'folha-linha paragrafo-inicio';
    tmpIndent.innerHTML = '<span class="folha-linha-num">02</span><span class="folha-linha-texto">X</span>';
    folhaPapel.appendChild(tmpIndent);

    const largNormal = tmpNormal.querySelector('.folha-linha-texto').clientWidth;
    const largIndent = tmpIndent.querySelector('.folha-linha-texto').clientWidth;
    const indentPx = Math.max(0, largNormal - largIndent);

    // Descontar 2px da borda da caixa para evitar corte de letras
    const larguraAjustada = largNormal > 2 ? largNormal - 2 : largNormal;

    // Guardar no cache para estimarLinhas() usar
    if (largNormal > 0) folhaLarguraCache = larguraAjustada;
    if (indentPx > 0) folhaIndentCache = indentPx;

    folhaPapel.innerHTML = '';

    // ---- Quebrar texto com medição precisa de pixels ----
    const linhasTexto = quebrarEmLinhas(texto, tamanho, folhaLarguraCache, folhaIndentCache);

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
      // Renderizar UMA caixa preta por linha
      div.innerHTML = `
        <span class=\"folha-linha-num\">${String(i + 1).padStart(2, '0')}</span>
        <span class=\"folha-linha-caixa\"><span class=\"folha-linha-texto\">${item ? escapeHTML(item.texto) : '&nbsp;'}</span></span>
      `;
      // Garante que linhas vazias também tenham borda
      if (!item) div.classList.add('vazia');
      folhaPapel.appendChild(div);
    }

    // Contador (também usado por atualizarContadorFolha)
    const usadas = linhasTexto.length;
    folhaLinhasUsd.textContent = usadas;
    if (usadas > MAX_LINHAS) {
      folhaLinhasUsd.style.color = 'var(--danger)';
    } else {
      folhaLinhasUsd.style.color = '';
    }
  }

  function atualizarContadorFolha() {
    const texto = redacaoTexto.textContent;
    if (!texto) return;
    // reusa cálculo de quebra, mas só para contar
    const tamanho = folhaFonte.value;
    const linhasTexto = quebrarEmLinhas(texto, tamanho, folhaLarguraCache, folhaIndentCache);
    const usadas = linhasTexto.length;
    folhaLinhasUsd.textContent = usadas;
    folhaLinhasUsd.style.color = usadas > MAX_LINHAS ? 'var(--danger)' : '';
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

  // Reagerar folha ao mudar tamanho da fonte
  folhaFonte.addEventListener('change', () => {
    if (!folhaOverlay.hidden) abrirFolha();
  });

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
