export function slugify(text: string): string {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD') // remove diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function parseSeoSlug(slugPath: string, allQuestions: any[]) {
  const segments = slugPath.split('/').filter(Boolean);
  
  // Build lookup maps from the database
  const uniqueDisciplines = Array.from(new Set(allQuestions.map(q => q.discipline).filter(Boolean)));
  const uniqueBoards = Array.from(new Set(allQuestions.map(q => q.board).filter(Boolean)));
  const uniqueOrgaos = Array.from(new Set(allQuestions.map(q => q.orgao).filter(Boolean)));
  const uniqueTopics = Array.from(new Set(allQuestions.map(q => q.topic).filter(Boolean)));

  const discMap = new Map(uniqueDisciplines.map(d => [slugify(d), d]));
  const boardMap = new Map(uniqueBoards.map(b => [slugify(b), b]));
  const orgaoMap = new Map(uniqueOrgaos.map(o => [slugify(o), o]));
  const topicMap = new Map(uniqueTopics.map(t => [slugify(t), t]));

  let matchedDiscipline = '';
  let matchedBoard = '';
  let matchedOrgao = '';
  let matchedTopic = '';

  for (const seg of segments) {
    if (!matchedDiscipline && discMap.has(seg)) matchedDiscipline = discMap.get(seg)!;
    else if (!matchedBoard && boardMap.has(seg)) matchedBoard = boardMap.get(seg)!;
    else if (!matchedOrgao && orgaoMap.has(seg)) matchedOrgao = orgaoMap.get(seg)!;
    else if (!matchedTopic && topicMap.has(seg)) matchedTopic = topicMap.get(seg)!;
  }

  // Filter questions based on matched criteria
  let filtered = allQuestions;
  if (matchedDiscipline) filtered = filtered.filter(q => q.discipline === matchedDiscipline);
  if (matchedBoard) filtered = filtered.filter(q => q.board === matchedBoard);
  if (matchedOrgao) filtered = filtered.filter(q => q.orgao === matchedOrgao);
  if (matchedTopic) filtered = filtered.filter(q => q.topic === matchedTopic);

  return {
    matchedDiscipline,
    matchedBoard,
    matchedOrgao,
    matchedTopic,
    filteredQuestions: filtered
  };
}
