export const SUB_CATEGORIES: Record<string, string[]> = {
  // Receitas
  Salário: ["Salário principal", "Horas extras", "Comissão", "Bônus"],
  "Renda Extra": ["Freelance", "Serviços", "Vendas", "Trabalhos extras"],
  Investimentos: ["Rendimentos", "Dividendos", "Juros", "Resgates"],
  Benefícios: ["Vale-alimentação", "Vale-refeição", "Auxílios"],
  Recebimentos: ["Reembolso", "Devolução", "Valores recebidos"],
  "Outras Receitas": ["Presente", "Prêmio", "Outros"],
  // Despesas
  Moradia: ["Aluguel", "Condomínio", "Energia", "Água", "Gás", "Internet", "Manutenção"],
  Alimentação: ["Supermercado", "Restaurante", "Delivery", "Lanches"],
  Transporte: [
    "Combustível",
    "Transporte público",
    "Aplicativos",
    "Estacionamento",
    "Pedágio",
    "Manutenção do veículo",
  ],
  Saúde: ["Plano de saúde", "Médico", "Dentista", "Farmácia", "Exames"],
  Educação: ["Escola", "Faculdade", "Cursos", "Livros", "Material escolar"],
  Lazer: ["Cinema", "Passeios", "Viagens", "Eventos", "Jogos"],
  Assinaturas: ["Streaming", "Aplicativos", "Software", "Clubes"],
  Compras: ["Roupas", "Calçados", "Eletrônicos", "Casa", "Compras pessoais"],
  Financeiro: ["Cartão", "Empréstimo", "Financiamento", "Tarifas", "Juros"],
  "Impostos e Taxas": ["IPVA", "IPTU", "Licenciamento", "Impostos", "Taxas"],
  Família: ["Filhos", "Mesada", "Pets", "Ajuda familiar"],
  "Cuidados Pessoais": ["Academia", "Barbearia", "Salão", "Cosméticos"],
  "Outras Despesas": ["Presentes", "Doações", "Outros"],
};

export function subCategoriesFor(categoryName: string): string[] {
  return SUB_CATEGORIES[categoryName] ?? [];
}
