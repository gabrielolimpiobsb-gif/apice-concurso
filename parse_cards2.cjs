const fs = require('fs');
const content = `frente: Qual o órgão máximo normativo e consultivo do SNT?
verso: CONTRAN (Conselho Nacional de Trânsito).
matéria: CTB
frente: Quem compõe o SNT nos Estados e no DF?
verso: CETRAN e CONTRANDIFE.
matéria: CTB
frente: Qual a validade da CNH para condutores com menos de 50 anos?
verso: 10 anos.
matéria: CTB
frente: Qual a validade da CNH para condutores de 50 a 69 anos?
verso: 5 anos.
matéria: CTB
frente: Qual a validade da CNH para condutores com 70 anos ou mais?
verso: 3 anos.
matéria: CTB
frente: Qual a idade mínima para habilitação nas categorias D e E?
verso: 21 anos.
matéria: CTB
frente: Quantos pontos geram a suspensão da CNH se o condutor tiver 2 infrações gravíssimas?
verso: 20 pontos.
matéria: CTB
frente: Quantos pontos geram a suspensão se o condutor tiver apenas 1 infração gravíssima?
verso: 30 pontos.
matéria: CTB
frente: Quantos pontos geram suspensão se não houver infração gravíssima?
verso: 40 pontos.
matéria: CTB
frente: Qual é a penalidade para dirigir sob a influência de álcool?
verso: Multa gravíssima (10x), suspensão do direito de dirigir por 12 meses e retenção do veículo.
matéria: CTB
frente: A recusa do teste do bafômetro configura infração?
verso: Sim, é infração gravíssima com as mesmas penalidades de dirigir alcoolizado.
matéria: CTB
frente: O que caracteriza a infração de rachas e pegas?
verso: Disputar corrida. Infração gravíssima (10x), suspensão, apreensão do veículo e recolhimento da CNH.
matéria: CTB
frente: Cinto de segurança é obrigatório para quem?
verso: Condutor e passageiros, em todas as vias.
matéria: CTB
frente: O transporte de crianças em cadeirinha no banco traseiro é obrigatório até qual idade/tamanho?
verso: Até 10 anos que não tenham atingido 1,45m de altura.
matéria: CTB
frente: Qual a velocidade máxima numa via de trânsito rápido onde não há sinalização?
verso: 80 km/h.
matéria: CTB
frente: Qual a velocidade máxima numa via arterial sem sinalização?
verso: 60 km/h.
matéria: CTB
frente: Qual a velocidade máxima numa via coletora sem sinalização?
verso: 40 km/h.
matéria: CTB
frente: Qual a velocidade máxima numa via local sem sinalização?
verso: 30 km/h.
matéria: CTB
frente: O uso do celular ao volante é permitido em algum momento com o carro em movimento?
verso: Não. É infração gravíssima segurar ou manusear.
matéria: CTB`;

const lines = content.split('\n');
const cards = [];
let currentCard = {};

lines.forEach(line => {
  if (line.startsWith('frente: ')) {
    currentCard.front = line.replace('frente: ', '').trim();
  } else if (line.startsWith('verso: ')) {
    currentCard.back = line.replace('verso: ', '').trim();
  } else if (line.startsWith('matéria: ')) {
    currentCard.subject = line.replace('matéria: ', '').trim();
    currentCard.id = Math.random().toString(36).substr(2, 9);
    cards.push(currentCard);
    currentCard = {};
  }
});

const pack = {
  id: "pack_detran_sp",
  title: "Detran SP - CTB e Normas",
  description: "Sistema Nacional de Trânsito, Normas Gerais, Infrações e Penalidades focadas no edital do Detran SP.",
  price: 9.90,
  coverColor: "from-[#2563eb] to-[#1e40af]",
  cardsCount: cards.length,
  flashcards: cards
};

let packsFile = fs.readFileSync('src/data/flashcardPacks.ts', 'utf-8');

if (packsFile.includes('export const AVAILABLE_PACKS = [')) {
    const insertStr = 'export const AVAILABLE_PACKS = [\n  ' + JSON.stringify(pack, null, 2) + ',';
    packsFile = packsFile.replace('export const AVAILABLE_PACKS = [', insertStr);
    fs.writeFileSync('src/data/flashcardPacks.ts', packsFile);
    console.log("Pack added successfully.");
} else {
    console.error("Could not find array declaration in flashcardPacks.ts");
}
