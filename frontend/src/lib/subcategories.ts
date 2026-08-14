export const SUB_CATEGORIES: Record<string, string[]> = {
  // Receitas
  Salário: ["Salário principal", "Horas extras", "Comissão", "Bônus"],
  "Renda Extra": ["Freelance", "Serviços", "Vendas", "Trabalhos extras"],
  Investimentos: ["Rendimentos", "Dividendos", "Juros", "Resgates"],
  Benefícios: ["Vale-alimentação", "Vale-refeição", "Auxílios"],
  Recebimentos: ["Reembolso", "Devolução", "Valores recebidos"],
  "Outras Receitas": ["Presente", "Prêmio", "Outros"],
  // Despesas
  Alimentação: ["Supermercado", "Padaria", "Restaurante", "Delivery", "Outros"],
  Moradia: [
    "Aluguel",
    "Condomínio",
    "Água",
    "Energia",
    "Gás",
    "Internet/TV",
    "Telefone",
    "IPTU",
    "Manutenção da casa",
    "Outros",
  ],
  Transporte: [
    "Combustível",
    "Transporte por aplicativo",
    "Transporte público",
    "Estacionamento",
    "Pedágio",
    "IPVA",
    "Licenciamento",
    "Manutenção do veículo",
    "Seguro",
    "Outros",
  ],
  Saúde: ["Plano de saúde", "Farmácia", "Consultas", "Exames", "Dentista", "Academia", "Outros"],
  Educação: ["Escola/Faculdade", "Cursos", "Material escolar", "Livros", "Outros"],
  "Lazer e Assinaturas": ["Passeios", "Viagens", "Eventos", "Assinaturas digitais", "Outros"],
  "Compras e Cuidados": [
    "Vestuário",
    "Eletrônicos",
    "Casa",
    "Cosméticos",
    "Barbearia/Salão",
    "Outros",
  ],
  "Financeiro e Impostos": ["Empréstimos", "Financiamentos", "Juros", "Impostos", "Outros"],
  "Outras Despesas": ["Despesas diversas"],
};

export function subCategoriesFor(categoryName: string): string[] {
  return SUB_CATEGORIES[categoryName] ?? [];
}
