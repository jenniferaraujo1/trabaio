// ------------------------ DADOS (com dificuldades por matéria) ------------------------
const MEMORIA_PARES = {
  "Matemática": {
    "Fácil": [
      ["2 + 2","4"],["3 + 5","8"],["7 - 3","4"],["10 ÷ 2","5"],["5 × 3","15"],["12 - 5","7"]
    ],
    "Médio": [
      ["12 × 3","36"],["40 ÷ 8","5"],["25 + 17","42"],["9 × 6","54"],["60 ÷ 5","12"],["15 × 4","60"]
    ],
    "Difícil": [
      ["2x + 4 = 10 (x=?)","3"],["√81","9"],["3² × 2","18"],["50% de 80","40"],["√64","8"],["7 × (3+2)","35"]
    ]
  },
  "Português": {
    "Fácil": [
      ["Cão","Animal que late"],["Casa","Lugar onde moramos"],["Livro","Objeto para ler"],["Sol","Astro"],["Gato","Felino doméstico"],["Flor","Planta colorida"]
    ],
    "Médio": [
      ["Falar","Comunicar"],["Triste","Infeliz"],["Bonito","Belo"],["Alegre","Contente"],["Forte","Robusto"],["Difícil","Complicado"]
    ],
    "Difícil": [
      ["Metáfora","Comparação implícita"],["Antônimo","Palavra de sentido oposto"],["Adjetivo","Palavra que caracteriza"],["Verbete","Entrada de dicionário"],["Pleonasmo","Repetição enfática"],["Hipérbole","Exagero proposital"]
    ]
  },
  "Ciências": {
    "Fácil": [
      ["Água","Essencial"],["Sol","Estrela"],["Órgãos","Partes internas"],["Osso","Estrutura rígida"],["Terra","Planeta"],["Lua","Satélite natural"]
    ],
    "Médio": [
      ["Fotossíntese","Planta produz alimento"],["Célula","Unidade da vida"],["Pulmão","Respiração"],["Evaporação","Líquido → gás"],["Hemoglobina","Leva oxigênio"],["Nervos","Conduzem estímulos"]
    ],
    "Difícil": [
      ["Mitocôndria","Produz energia"],["Clorofila","Pigmento vegetal"],["DNA","Informação genética"],["Ecossistema","Conjunto de seres vivos"],["Troposfera","Camada da atmosfera"],["Meiose","Divisão celular"]
    ]
  },
  "História": {
    "Fácil": [
      ["1500","Descobrimento"],["1822","Independência"],["Pedro Álvares Cabral","Navegador"],["Imperador","Governante"],["Egito","Pirâmides"],["Roma","Império"]
    ],
    "Médio": [
      ["Revolução Francesa","1789"],["Primeira Guerra","1914"],["Segunda Guerra","1939"],["Ditadura Militar","1964"],["Idade Média","Feudalismo"],["Renascimento","Arte e ciência"]
    ],
    "Difícil": [
      ["Iluminismo","Filosofia racional"],["Guerra Fria","EUA × URSS"],["Mesopotâmia","Primeiras cidades"],["Magna Carta","1215"],["Revolução Industrial","Máquinas"],["Tratado de Versalhes","Pós-guerra"]
    ]
  },
  "Geografia": {
    "Fácil": [
      ["Brasil","América do Sul"],["Amazonas","Maior rio"],["África","Continente"],["Oceano Atlântico","Água salgada"],["Montanha","Elevação"],["Deserto","Seco"]
    ],
    "Médio": [
      ["Latitude","Distância do Equador"],["Longitude","Distância de Greenwich"],["Placas tectônicas","Movem-se"],["Clima equatorial","Quente e úmido"],["Polo Norte","Ártico"],["Polo Sul","Antártida"]
    ],
    "Difícil": [
      ["Dorsal mesoatlântica","Cadeia submarina"],["Subducção","Placa afunda"],["Estepes","Vegetação seca"],["Depressão absoluta","Abaixo do nível do mar"],["Escala cartográfica","Redução do espaço"],["Aquífero","Água subterrânea"]
    ]
  }
};

// ------------------------ ESTADO ------------------------
let cartas = []; // array de textos (duplicados)
let paresSelecionados = []; // array de objetos {front,back}
let selecionadas = []; // cartas viradas no turno
let pontuacao = 0;
let tempo = 0;
let timer = null;
const N_PAIRS_GAME = 6; // número de pares por partida

// ------------------------ INICIALIZAÇÃO ------------------------
window.onload = () => {
  carregarMaterias();
  document.getElementById('btn-start').onclick = iniciarJogo;
};

function carregarMaterias(){
  const box = document.getElementById('materias');
  box.innerHTML = '';
  for(let m in MEMORIA_PARES){
    box.innerHTML += `<label><input type=\"checkbox\" value=\"${m}\"> ${m}</label>`;
  }
}

// ------------------------ INICIAR JOGO ------------------------
function iniciarJogo(){
  const materias = [...document.querySelectorAll('#materias input:checked')].map(e=>e.value);
  if(materias.length === 0){ alert('Selecione ao menos uma matéria!'); return; }

  const dif = document.querySelector('input[name=dif]:checked').value;

  // montar pool de pares baseados nas matérias + dificuldade
  let pool = [];
  materias.forEach(m => {
    const lista = MEMORIA_PARES[m][dif];
    pool.push(...lista.map(p => ({front: p[0], back: p[1]})));
  });

  // embaralha pool e seleciona N_PAIRS_GAME pares distintos
  shuffle(pool);
  paresSelecionados = pool.slice(0, N_PAIRS_GAME);

  // criar cartas (cada par vira dois cartões, um com 'front' e outro com 'back')
  cartas = [];
  paresSelecionados.forEach(p => {
    cartas.push({text: p.front, pairId: generateId()});
    cartas.push({text: p.back, pairId: generateId(true)}); // different id so matching checks by content, not id
  });

  // importante: para impedir decorar posição, embaralhamos novamente as 12 cartas
  shuffle(cartas);

  // reset estado
  pontuacao = 0;
  selecionadas = [];
  document.getElementById('pontuacao').innerText = ` | Pontuação: ${pontuacao}`;

  // tempo por dificuldade (você pode ajustar)
  if(dif === 'Fácil') tempo = 90;
  if(dif === 'Médio') tempo = 60;
  if(dif === 'Difícil') tempo = 40;

  // trocar telas
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');

  montarBoard();
  iniciarTempo();
}

// ------------------------ UTILITÁRIOS ------------------------
function shuffle(arr){
  for(let i = arr.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// gera id para parear front/back por conteúdo (mas here we use content matching)
function generateId(isBack){
  return (Math.random() + 1).toString(36).substring(2,9) + (isBack?'-b':'-f');
}

// ------------------------ MONTAR TABULEIRO ------------------------
function montarBoard(){
  const board = document.getElementById('board');
  board.innerHTML = '';

  const colunas = Math.ceil(Math.sqrt(cartas.length));
  board.style.gridTemplateColumns = `repeat(${colunas}, 120px)`;

  cartas.forEach((c, i)=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    // estrutura com inner/front/back para flip 3D
    card.innerHTML = `
      <div class=\"inner\"> 
        <div class=\"front\">❓</div>
        <div class=\"back\">${escapeHtml(c.text)}</div>
      </div>
    `;
    card.onclick = ()=>revelar(i, card);
    board.appendChild(card);
  });
}

// escapando HTML por segurança
function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ------------------------ TEMPO ------------------------
function iniciarTempo(){
  clearInterval(timer);
  document.getElementById('tempo').innerText = `Tempo: ${tempo}s`;
  timer = setInterval(()=>{
    tempo--;
    document.getElementById('tempo').innerText = `Tempo: ${tempo}s`;
    if(tempo <= 0){ clearInterval(timer); finalizar(false); }
  },1000);
}

// ------------------------ MECÂNICA DAS CARTAS ------------------------
function revelar(i, card){
  if(card.classList.contains('revelada') || card.classList.contains('certa')) return;
  if(selecionadas.length === 2) return;

  card.classList.add('revelada');
  selecionadas.push({i, card});

  if(selecionadas.length === 2) setTimeout(verificar, 700);
}

function verificar(){
  const [a,b] = selecionadas;
  const c1 = cartas[a.i];
  const c2 = cartas[b.i];

  // para serem par, o texto de um deve ser o "front" e o outro o "back" de mesmo par original
  // como armazenamos paresSelecionados, verificamos se existe um par onde front===c1.text && back===c2.text OR vice-versa
  const match = paresSelecionados.some(p => (p.front === c1.text && p.back === c2.text) || (p.front === c2.text && p.back === c1.text));

  if(match){
    a.card.classList.add('certa');
    b.card.classList.add('certa');
    pontuacao++;
    document.getElementById('pontuacao').innerText = ` | Pontuação: ${pontuacao}`;

    // animação leve ou som poderia ir aqui
    if(pontuacao === N_PAIRS_GAME){ clearInterval(timer); finalizar(true); }
  } else {
    // desvira
    a.card.classList.remove('revelada');
    b.card.classList.remove('revelada');
  }

  selecionadas = [];
}

// ------------------------ FINALIZAR ------------------------
function finalizar(ganhou){
  clearInterval(timer);
  const msg = ganhou ? '🎉 Você venceu!' : '⏰ Tempo esgotado!';
  if(confirm(msg + '\n\nDeseja jogar novamente?')){
    // volta ao menu mantendo as mesmas materias selecionadas
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
  } else {
    // fecha janela quando possível
    try{ window.close(); }catch(e){}
  }
}
