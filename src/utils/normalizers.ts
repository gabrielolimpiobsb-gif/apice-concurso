export function normalizeBoard(board: string): string {
    if (!board) return "Banca Desconhecida";
    const upper = board.toUpperCase();
    if (upper.includes("CESPE") || upper.includes("CEBRASPE")) return "CEBRASPE (CESPE)";
    if (upper.includes("QUADRIX")) return "Quadrix";
    if (upper.includes("FGV") || upper.includes("GETÚLIO VARGAS") || upper.includes("GETULIO VARGAS")) return "FGV";
    if (upper.includes("FCC") || upper.includes("CARLOS CHAGAS")) return "FCC";
    if (upper.includes("VUNESP")) return "VUNESP";
    if (upper.includes("IDECAN")) return "IDECAN";
    if (upper.includes("IBFC")) return "IBFC";
    if (upper.includes("AOCP")) return "Instituto AOCP";
    if (upper.includes("IBADE")) return "IBADE";
    if (upper.includes("IADES")) return "IADES";
    if (upper.includes("FEPESE")) return "FEPESE";
    if (upper.includes("FUNDATEC")) return "FUNDATEC";
    if (upper.includes("CESGRANRIO")) return "CESGRANRIO";
    if (upper.includes("CONSULPLAN")) return "CONSULPLAN";
    if (upper.includes("CONSULPAM")) return "CONSULPAM";
    if (upper.includes("CETREDE")) return "CETREDE";
    if (upper.includes("COPESE") || upper.includes("COPEVE")) return "COPESE / COPEVE";
    if (upper.includes("COMPERVE")) return "COMPERVE";
    if (upper.includes("ESAF")) return "ESAF";
    if (upper.includes("FADESP")) return "FADESP";
    if (upper.includes("FAURGS")) return "FAURGS";
    if (upper.includes("FUNDEP")) return "FUNDEP";
    if (upper.includes("FUMARC")) return "FUMARC";
    if (upper.includes("FUNIVERSA")) return "FUNIVERSA";
    if (upper.includes("CEFET")) return "CEFET";
    if (upper.includes("SELECON")) return "SELECON";
    if (upper.includes("INAZ")) return "INAZ do Pará";
    if (upper.includes("UFMT")) return "UFMT";
    if (upper.includes("UFG") || upper.includes("GOIÁS")) return "UFG";
    if (upper.includes("UFRJ") || upper.includes("NÚCLEO DE COMPUTAÇÃO ELETRÔNICA") || upper.includes("NCE")) return "UFRJ";
    if (upper.includes("IGEDUC")) return "IGEDUC";
    if (upper.includes("IBEST")) return "IBEST";
    if (upper.includes("ITAME")) return "ITAME";
    if (upper.includes("IDIB")) return "IDIB";
    if (upper.includes("IDCAP")) return "IDCAP";
    if (upper.includes("IBAM")) return "IBAM";
    if (upper.includes("IESES")) return "IESES";
    if (upper.includes("UFSM") || upper.includes("SANTA MARIA")) return "UFSM";
    if (upper.includes("UFU") || upper.includes("UBERLÂNDIA")) return "UFU";
    if (upper.includes("AVANÇA SP")) return "Avança SP";
    if (upper.includes("FAPEC")) return "FAPEC";
    if (upper.includes("DIRENS")) return "DIRENS";
    if (upper.includes("CPCON")) return "CPCON";
    if (upper.includes("UFPR") || upper.includes("FUNPAR")) return "UFPR";
    if (upper.includes("NUCEPE")) return "NUCEPE";
    if (upper.includes("FUNRIO")) return "FUNRIO";
    if (upper.includes("CONSESP")) return "CONSESP";
    if (upper.includes("FÊNIX")) return "Instituto Fênix";
    if (upper.includes("AROEIRA")) return "Fundação Aroeira";
    if (upper.includes("AMEOSC")) return "AMEOSC";
    if (upper.includes("CENTEC")) return "CENTEC";
    if (upper.includes("ACCESS")) return "Instituto ACCESS";
    if (upper.includes("ACESSO")) return "Instituto Acesso";
    if (upper.includes("INEP") || upper.includes("ENEM")) return "INEP";
    if (upper.includes("FURB") || upper.includes("BLUMENAU")) return "FURB";
    if (upper.includes("UFF") || upper.includes("FLUMINENSE")) return "UFF";
    if (upper.includes("UFRRJ") || upper.includes("RURAL DO RIO DE JANEIRO")) return "UFRRJ";
    if (upper.includes("MINISTÉRIO PÚBLICO DO PARANÁ") || upper.includes("MPPR")) return "MPPR";

    
    // Default strip trailing slashes, dashes, and trim
    return board.replace(/[/-]+$/, '').trim();
}

export function normalizeDiscipline(discipline: string): string {
    if (!discipline) return "Outros";
    const upper = discipline.toUpperCase();
    if (upper.includes("AFO") || upper.includes("ADMINISTRAÇÃO FINANCEIRA E ORÇAMENTÁRIA")) return "Administração Financeira e Orçamentária (AFO)";
    if (upper.includes("INFORMÁTICA") || upper.includes("INFORMATICA")) return "Informática";
    if (upper.includes("LÍNGUA PORTUGUESA") || upper.includes("LINGUA PORTUGUESA") || upper === "PORTUGUÊS") return "Português";
    if (upper.includes("RACIOCÍNIO LÓGICO") || upper.includes("MATEMÁTICA E RACIOCÍNIO LÓGICO")) {
         if (upper.includes("MATEMÁTICA E")) return "Matemática e Raciocínio Lógico";
         return "Raciocínio Lógico";
    }
    if (upper.includes("DIREITO CONSTITUCIONAL")) return "Direito Constitucional";
    if (upper.includes("DIREITO ADMINISTRATIVO")) return "Direito Administrativo";
    if (upper.includes("DIREITO PROCESSUAL PENAL")) return "Direito Processual Penal";
    if (upper.includes("DIREITO PENAL") && !upper.includes("PROCESSUAL")) return "Direito Penal";
    if (upper.includes("DIREITO PROCESSUAL CIVIL")) return "Direito Processual Civil";
    if (upper.includes("DIREITO CIVIL") && !upper.includes("PROCESSUAL")) return "Direito Civil";
    if (upper.includes("DIREITO PROCESSUAL DO TRABALHO")) return "Direito Processual do Trabalho";
    if (upper.includes("DIREITO DO TRABALHO") && !upper.includes("PROCESSUAL")) return "Direito do Trabalho";
    if (upper.includes("DIREITO TRIBUTÁRIO")) return "Direito Tributário";
    if (upper.includes("CONTABILIDADE GERAL")) return "Contabilidade Geral";
    if (upper.includes("CONTABILIDADE PÚBLICA")) return "Contabilidade Pública";
    if (upper.includes("DIREITOS HUMANOS")) return "Direitos Humanos";
    if (upper.includes("LEGISLAÇÃO DE TRÂNSITO") || upper.includes("CTB")) return "Legislação de Trânsito";
    if (upper.includes("SEGURANÇA E SAÚDE NO TRABALHO")) return "Segurança e Saúde no Trabalho";
    if (upper.includes("CONHECIMENTOS ESPECÍFICOS")) return "Conhecimentos Específicos";
    if (upper.includes("ATUALIDADES")) return "Atualidades";
    
    // Default strip trailing ">" or slashes
    return discipline.replace(/[>/-]+$/, '').trim();
}
