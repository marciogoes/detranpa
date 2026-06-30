// ─────────────────────────────────────────────────────────────────────────────
// Catálogo estruturado dos formulários/documentos do DETRAN-PA (Módulo Veículos).
// Fonte: anexos da IN 01/2018 e formulários de intenção de venda (Res. 809/2020).
//
// Cada formulário tem: id, título, descrição, subtítulo (base legal), intro,
// seções com campos, e notas (ATENÇÃO). A interface usa isso para:
//   - mostrar o documento em branco,
//   - oferecer preenchimento guiado (form + pré-visualização ao vivo),
//   - imprimir / salvar em PDF.
//
// Tipos de campo: "text" (padrão), "radio" (com options), "textarea", "date".
// "full: true" faz o campo ocupar a linha inteira no formulário.
// ─────────────────────────────────────────────────────────────────────────────

const PF_PJ = { key: "tipo", label: "Tipo", type: "radio", options: ["Pessoa Física", "Pessoa Jurídica"] };

export const FORMS = [
  {
    id: "intencao-venda",
    title: "Intenção de Venda de Veículo",
    desc: "Solicita a emissão da ATPV (autorização para transferir a propriedade).",
    subtitle: "Resolução 809/2020 - CONTRAN",
    intro:
      "Com a finalidade de solicitar a emissão da Autorização para Transferência de Propriedade de Veículo (ATPV), conforme Resolução 809/2020 - CONTRAN, comunico a intenção de venda do veículo abaixo:",
    sections: [
      { title: "Dados do vendedor", fields: [
        { ...PF_PJ, key: "vend_tipo" },
        { key: "vend_doc", label: "CPF/CNPJ" },
        { key: "vend_nome", label: "Nome", full: true },
        { key: "vend_email", label: "E-mail" },
        { key: "vend_fone", label: "Fone" },
      ]},
      { title: "Dados do veículo", fields: [
        { key: "placa", label: "Placa" },
        { key: "valor", label: "Valor de venda (R$)" },
      ]},
      { title: "Dados do comprador", fields: [
        { ...PF_PJ, key: "comp_tipo" },
        { key: "comp_doc", label: "CPF/CNPJ" },
        { key: "comp_nome", label: "Nome", full: true },
        { key: "comp_endereco", label: "Endereço", full: true },
        { key: "comp_bairro", label: "Bairro" },
        { key: "comp_municipio", label: "Município" },
        { key: "comp_cep", label: "CEP" },
        { key: "comp_email", label: "E-mail" },
        { key: "comp_fone", label: "Fone" },
      ]},
      { title: "Informações adicionais", fields: [
        { key: "local", label: "Local" },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Assinatura do Vendedor", "Assinatura do Comprador"],
    notes: [
      "Este requerimento NÃO substitui a Comunicação de Venda do Veículo (art. 134 da Lei 9.503/97 - CTB).",
      "Anexar cópias de documento de identificação oficial com foto do comprador e do vendedor.",
      "Vendedor pessoa jurídica: anexar identidade e CPF do representante legal, Cartão CNPJ atualizado e documento constitutivo da empresa.",
      "Comprador pessoa jurídica: anexar Cartão CNPJ.",
      "Anexar procuração se o proprietário outorgou poderes (art. 3º da IN 01/2018), com reconhecimento por autenticidade.",
    ],
  },
  {
    id: "cancelamento-intencao",
    title: "Cancelamento de Intenção de Venda",
    desc: "Desistência da ATPV / cancelamento da intenção de venda já registrada.",
    subtitle: "Resolução 809/2020 - CONTRAN",
    intro:
      "Considerando a desistência da Autorização para Transferência de Propriedade de Veículo (ATPV), emitida conforme Resolução 809/2020 - CONTRAN, solicito o cancelamento da intenção de venda do veículo abaixo:",
    sections: [
      { title: "Dados do vendedor", fields: [
        { ...PF_PJ, key: "vend_tipo" },
        { key: "vend_doc", label: "CPF/CNPJ" },
        { key: "vend_nome", label: "Nome", full: true },
        { key: "vend_email", label: "E-mail" },
        { key: "vend_fone", label: "Fone" },
      ]},
      { title: "Dados do veículo", fields: [
        { key: "placa", label: "Placa" },
        { key: "renavam", label: "RENAVAM" },
      ]},
      { title: "Dados do comprador", fields: [
        { ...PF_PJ, key: "comp_tipo" },
        { key: "comp_doc", label: "CPF/CNPJ" },
        { key: "comp_nome", label: "Nome", full: true },
        { key: "comp_email", label: "E-mail" },
        { key: "comp_fone", label: "Fone" },
      ]},
      { title: "Informações adicionais", fields: [
        { key: "data", label: "Data", type: "date" },
        { key: "municipio", label: "Município" },
      ]},
    ],
    signatures: ["Assinatura do Vendedor", "Assinatura do Comprador"],
    notes: [
      "As assinaturas devem ser reconhecidas em cartório por autenticidade, ou assinadas na presença do servidor do DETRAN.",
      "Anexar cópias de documento de identificação oficial com foto do comprador e do vendedor.",
      "Pessoa jurídica: anexar os documentos da empresa (representante legal, Cartão CNPJ e ato constitutivo).",
      "Anexar procuração se houver representante (art. 3º da IN 01/2018), com reconhecimento por autenticidade.",
    ],
  },
  {
    id: "comunicacao-venda",
    title: "Comunicação de Venda",
    desc: "O vendedor avisa o DETRAN que vendeu o veículo (art. 134 CTB).",
    subtitle: "Anexo 2 - IN 01/2018",
    intro:
      "Com a finalidade de dar cumprimento ao art. 134 da Lei nº 9.503/1997 (CTB), comunico ao DETRAN/PA a venda do veículo abaixo:",
    sections: [
      { title: "Dados do requerente (vendedor)", fields: [
        { key: "vend_nome", label: "Nome", full: true },
        { key: "vend_id", label: "Identidade" },
        { key: "vend_cpf", label: "CPF" },
        { key: "vend_fone", label: "Fone" },
      ]},
      { title: "Dados do veículo", fields: [
        { key: "placa", label: "Placa" },
        { key: "renavam", label: "RENAVAM" },
        { key: "marca", label: "Marca/Modelo", full: true },
      ]},
      { title: "Dados do comprador", fields: [
        { ...PF_PJ, key: "comp_tipo" },
        { key: "comp_doc", label: "CPF/CNPJ" },
        { key: "comp_nasc", label: "Data de nascimento", type: "date" },
        { key: "comp_nome", label: "Nome", full: true },
        { key: "comp_endereco", label: "Endereço", full: true },
        { key: "comp_bairro", label: "Bairro" },
        { key: "comp_municipio", label: "Município" },
        { key: "comp_cep", label: "CEP" },
      ]},
      { title: "Informações adicionais", fields: [
        { key: "data_venda", label: "Data da venda", type: "date" },
        { key: "local", label: "Local" },
      ]},
    ],
    signatures: ["Assinatura do Requerente (vendedor)"],
    notes: [
      "Anexar cópia AUTENTICADA do CRV preenchido, datado e assinado, com firma do vendedor e do comprador reconhecida por autenticidade.",
    ],
  },
  {
    id: "declaracao-residencia",
    title: "Declaração de Residência",
    desc: "Quando você não tem comprovante de residência ou ele está em nome de outra pessoa.",
    subtitle: "Anexo 4 - IN 01/2018 (Res. 481/2014 CONTRAN, Lei 7.115/1983)",
    intro: "Declaro, para fins de atendimento de serviço junto ao DETRAN/PA, sob as penas da lei, o seguinte:",
    sections: [
      { title: "Declarante", fields: [
        { key: "nome", label: "Nome completo", full: true },
        { key: "cpf", label: "CPF" },
        { key: "rg", label: "Identidade (RG)" },
        { key: "placa", label: "Placa e/ou chassi do veículo", full: true },
      ]},
      { title: "Endereço declarado", fields: [
        { key: "logradouro", label: "Rua/Av.", full: true },
        { key: "numero", label: "Número" },
        { key: "complemento", label: "Complemento" },
        { key: "bairro", label: "Bairro" },
        { key: "cidade", label: "Cidade" },
        { key: "uf", label: "UF" },
        { key: "cep", label: "CEP" },
      ]},
      { title: "Local e data", fields: [
        { key: "cidade_assin", label: "Cidade" },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Proprietário / Adquirente / Procurador"],
    notes: ["A declaração é firmada na presença do atendente do DETRAN."],
  },
  {
    id: "atualizacao-endereco",
    title: "Atualização de Endereço",
    desc: "Atualizar o endereço do proprietário no cadastro do veículo.",
    subtitle: "Anexo 3 - IN 01/2018",
    intro: "Solicito a atualização do meu endereço no cadastro do veículo, conforme os dados abaixo:",
    sections: [
      { title: "Dados do requerente (proprietário)", fields: [
        { key: "nome", label: "Nome/Razão Social", full: true },
        { key: "rg", label: "RG" },
        { key: "orgao", label: "Órgão emissor" },
        { key: "doc", label: "CPF/CNPJ" },
        { key: "cnh", label: "CNH (nº e UF)" },
        { key: "fone", label: "Telefone" },
        { key: "placa", label: "Placa" },
        { key: "renavam", label: "RENAVAM" },
      ]},
      { title: "Endereço atualizado", fields: [
        { key: "endereco", label: "Endereço", full: true },
        { key: "numero", label: "Número" },
        { key: "complemento", label: "Complemento" },
        { key: "bairro", label: "Bairro" },
        { key: "cep", label: "CEP" },
        { key: "cidade", label: "Cidade" },
        { key: "uf", label: "UF" },
      ]},
      { title: "Local e data", fields: [
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Assinatura do Requerente (proprietário do veículo)"],
    notes: [
      "Anexar cópia (frente e verso) dos documentos de identidade e CPF, comprovante de endereço com CEP atualizado e documento do veículo (CRV/CRLV).",
    ],
  },
  {
    id: "procuracao",
    title: "Procuração Particular",
    desc: "Quando outra pessoa vai resolver o serviço por você.",
    subtitle: "Anexo 1 - IN 01/2018",
    intro: "Por este instrumento particular de procuração, o OUTORGANTE nomeia e constitui seu bastante procurador o OUTORGADO, conforme abaixo:",
    sections: [
      { title: "Outorgante (proprietário)", fields: [
        { key: "out_nome", label: "Nome", full: true },
        { key: "out_rg", label: "RG" },
        { key: "out_doc", label: "CPF/CNPJ" },
        { key: "out_end", label: "Endereço", full: true },
        { key: "out_fone", label: "Fone" },
        { key: "out_email", label: "E-mail" },
      ]},
      { title: "Outorgado (procurador)", fields: [
        { key: "pro_nome", label: "Nome", full: true },
        { key: "pro_rg", label: "RG" },
        { key: "pro_doc", label: "CPF/CNPJ" },
        { key: "pro_end", label: "Endereço", full: true },
      ]},
      { title: "Poderes e veículo", fields: [
        { key: "servicos", label: "Serviço(s) a solicitar no DETRAN", type: "textarea", full: true },
        { key: "placa", label: "Placa" },
        { key: "chassi", label: "Chassi" },
        { key: "entrega", label: "Entrega do CRV/CRLV (correio ou agência)", full: true },
        { key: "validade", label: "Validade (dias)" },
      ]},
      { title: "Local e data", fields: [
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Assinatura do Outorgante (proprietário)"],
    notes: [
      "A assinatura do outorgante deve ter firma reconhecida (por AUTENTICIDADE em transferência de propriedade, 2ª via de CRV e baixa de registro).",
      "Procuração sem data de validade é aceita por até 90 dias da outorga.",
      "Todos os dados são de responsabilidade do outorgante.",
    ],
  },
  {
    id: "cancelamento-comunicacao",
    title: "Cancelamento de Comunicação de Venda",
    desc: "Cancelar comunicação de venda já registrada (para emitir 2ª via de CRV).",
    subtitle: "Anexo 9 - IN 01/2018",
    intro: "Solicitamos ao DETRAN/PA o cancelamento do comunicado de venda do veículo abaixo, por motivo de rasura/perda, para emissão de 2ª via de CRV. Estando cientes das implicações legais de falsa declaração ao poder público, assumimos total responsabilidade.",
    sections: [
      { title: "Proprietário", fields: [
        { key: "prop_nome", label: "Nome", full: true },
        { key: "prop_rg", label: "RG" },
        { key: "prop_cpf", label: "CPF" },
      ]},
      { title: "Comprador", fields: [
        { key: "comp_nome", label: "Nome", full: true },
        { key: "comp_rg", label: "RG" },
        { key: "comp_cpf", label: "CPF" },
      ]},
      { title: "Veículo / data", fields: [
        { key: "placa", label: "Placa" },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Proprietário", "Comprador"],
    notes: ["Válido somente com reconhecimento da assinatura do proprietário/comprador."],
  },
  {
    id: "assinatura-indevida",
    title: "Declaração de Assinatura Indevida no CRV",
    desc: "Quando o CRV foi assinado mas não houve venda.",
    subtitle: "Anexo 7 - IN 01/2018",
    intro: "Declaro que NÃO houve transferência de propriedade do veículo abaixo, motivo pelo qual assumo total responsabilidade pela apresentação do CRV assinado. Estou ciente das implicações legais de falsa declaração ao poder público.",
    sections: [
      { title: "Declarante (proprietário)", fields: [
        { key: "nome", label: "Nome", full: true },
        { key: "rg", label: "RG" },
        { key: "cpf", label: "CPF" },
        { key: "fone", label: "Fone" },
      ]},
      { title: "Veículo / pedido", fields: [
        { key: "placa", label: "Placa" },
        { key: "solicitacao", label: "Solicito", type: "textarea", full: true },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Proprietário"],
    notes: ["É obrigatório o reconhecimento da assinatura do proprietário/comprador."],
  },
  {
    id: "inversao-duplicidade",
    title: "Declaração de Inversão/Duplicidade de Assinaturas",
    desc: "Quando as assinaturas no CRV foram trocadas ou duplicadas.",
    subtitle: "Anexo 8 - IN 01/2018",
    intro: "Declaramos ao DETRAN/PA que houve inversão/duplicidade de assinaturas no CRV do veículo abaixo.",
    sections: [
      { title: "Proprietário", fields: [
        { key: "prop_nome", label: "Nome", full: true },
        { key: "prop_rg", label: "RG" },
        { key: "prop_cpf", label: "CPF" },
      ]},
      { title: "Comprador", fields: [
        { key: "comp_nome", label: "Nome", full: true },
        { key: "comp_rg", label: "RG" },
        { key: "comp_cpf", label: "CPF" },
      ]},
      { title: "Veículo / data", fields: [
        { key: "placa", label: "Placa" },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Proprietário", "Comprador"],
    notes: ["É obrigatório o reconhecimento da assinatura do proprietário/comprador."],
  },
  {
    id: "nao-opcao-compra",
    title: "Carta de Não-Opção de Compra",
    desc: "Arrendatário (leasing) que não fica com o veículo e concorda com a venda a terceiro.",
    subtitle: "Anexo 5 - IN 01/2018",
    intro: "Na qualidade de arrendatário do veículo abaixo, declaro que NÃO tenho interesse na aquisição do mesmo e estou de pleno acordo com a venda para o adquirente indicado.",
    sections: [
      { title: "Arrendatário", fields: [
        { key: "arr_nome", label: "Nome", full: true },
        { key: "arr_rg", label: "RG" },
        { key: "arr_doc", label: "CPF/CNPJ" },
      ]},
      { title: "Adquirente indicado", fields: [
        { key: "adq_nome", label: "Nome", full: true },
        { key: "adq_cpf", label: "CPF" },
        { key: "adq_rg", label: "RG" },
        { key: "adq_end", label: "Endereço", full: true },
      ]},
      { title: "Dados do veículo", fields: [
        { key: "marca", label: "Marca" },
        { key: "modelo", label: "Modelo" },
        { key: "placa", label: "Placa" },
        { key: "cor", label: "Cor" },
        { key: "ano", label: "Ano" },
        { key: "chassi", label: "Chassi" },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Arrendatário (reconhecer firma por autenticidade)"],
    notes: ["A assinatura do arrendatário deve ter firma reconhecida por autenticidade."],
  },
  {
    id: "baixa-definitiva",
    title: "Requerimento de Baixa Definitiva",
    desc: "Baixa por veículo irrecuperável, desmontado, perda total ou sucata.",
    subtitle: "Anexo 6 - IN 01/2018 (Res. CONTRAN 11/1998)",
    intro: "Requeiro a BAIXA DEFINITIVA do veículo abaixo, sob pena de responsabilidade civil e criminal.",
    sections: [
      { title: "Requerente (proprietário/responsável)", fields: [
        { key: "nome", label: "Nome", full: true },
        { key: "rg", label: "RG" },
        { key: "cpf", label: "CPF" },
      ]},
      { title: "Dados do veículo", fields: [
        { key: "placa", label: "Placa" },
        { key: "chassi", label: "Chassi" },
        { key: "marca", label: "Marca/Modelo", full: true },
      ]},
      { title: "Motivo da baixa", fields: [
        { key: "motivo", label: "Motivo", type: "radio", full: true,
          options: ["Veículo irrecuperável", "Veículo definitivamente desmontado", "Veículo sinistrado com laudo de perda total", "Veículo vendido ou leiloado como sucata"] },
        { key: "extraviados", label: "Documentos/elementos extraviados (CRV, placas, plaquetas, lacre)", full: true },
        { key: "data", label: "Data", type: "date" },
      ]},
    ],
    signatures: ["Requerente (reconhecer firma por autenticidade)"],
    notes: ["Reconhecer firma do proprietário ou seu representante por autenticidade."],
  },
];

export const FORM_INDEX = FORMS.map((f) => ({ id: f.id, title: f.title, desc: f.desc, subtitle: f.subtitle }));
