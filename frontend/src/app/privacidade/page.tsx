import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="sm" />
          <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-slate-900">POLÍTICA DE PRIVACIDADE — GUIASENSE</h1>
        </div>
        <p className="text-sm text-slate-500">
          Última atualização: 27 de agosto de 2026 · Versão: 2026-08-27
        </p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
          <p>
            A sua privacidade é importante para nós.
          </p>
          <p>
            Esta Política de Privacidade explica como o GuiaSense, produto desenvolvido e operado
            pela DevCerto Tecnologia LTDA, coleta, utiliza, armazena, compartilha e protege dados
            pessoais durante a utilização da plataforma.
          </p>
          <p>
            O tratamento de dados pessoais é realizado de acordo com a Lei nº 13.709/2018 — Lei
            Geral de Proteção de Dados Pessoais (LGPD) e demais normas aplicáveis.
          </p>
          <p>
            Ao criar uma conta no GuiaSense, o usuário declara ter lido e estar ciente desta
            Política de Privacidade.
          </p>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">1. Quem é responsável pelos seus dados</h2>
            <p>
              A responsável pelo tratamento dos dados pessoais relacionados ao GuiaSense é:
            </p>
            <p>
              <strong>DevCerto Tecnologia LTDA</strong>
              <br />
              CNPJ: 68.827.410/0001-44
              <br />
              Produto: GuiaSense
              <br />
              Site: guiasense.devcerto.com
            </p>
            <p>
              A DevCerto atua como controladora dos dados pessoais tratados no âmbito do GuiaSense,
              nos casos aplicáveis.
            </p>
            <p>
              Para dúvidas, solicitações ou exercício de direitos relacionados à privacidade e
              proteção de dados:
            </p>
            <p>
              <strong>Canal de Privacidade e Proteção de Dados</strong>
              <br />
              E-mail: lgpd@devcerto.com
            </p>
            <p>
              A DevCerto, na condição de Empresa de Pequeno Porte — EPP, mantém esse canal para
              comunicação com os titulares de dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">2. Quais dados coletamos</h2>
            <p>A quantidade e o tipo de informações coletadas dependem da utilização do GuiaSense.</p>
            <h3 className="mb-1 mt-3 font-semibold text-slate-800">2.1. Criação da conta</h3>
            <p>Durante o cadastro, poderão ser coletados:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>nome;</li>
              <li>endereço de e-mail;</li>
              <li>senha, armazenada de forma protegida;</li>
              <li>informações necessárias à autenticação e segurança da conta;</li>
              <li>data e hora do aceite da Política de Privacidade;</li>
              <li>versão da Política de Privacidade aceita.</li>
            </ul>
            <p>
              CPF/CNPJ e endereço não são solicitados para criação da conta nem para utilização do
              período gratuito do GuiaSense.
            </p>
            <p>
              O aceite da Política de Privacidade é obrigatório para criação da conta e fica
              registrado por meio da data/hora do consentimento e da versão correspondente da
              política.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">3. Período gratuito</h2>
            <p>
              O GuiaSense poderá disponibilizar um período gratuito de experimentação.
            </p>
            <p>
              Atualmente, novos usuários podem utilizar o sistema gratuitamente durante 8 dias após
              a criação da conta.
            </p>
            <p>
              Durante esse período, não é necessário fornecer CPF/CNPJ ou endereço para faturamento.
            </p>
            <p>
              Caso o usuário decida contratar um plano pago, serão solicitados os dados adicionais
              necessários à contratação e emissão dos documentos fiscais correspondentes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">4. Dados coletados na contratação</h2>
            <p>
              Quando o usuário decide contratar ou regularizar um plano pago, poderão ser
              solicitados:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>nome;</li>
              <li>CPF ou CNPJ;</li>
              <li>CEP;</li>
              <li>logradouro;</li>
              <li>número;</li>
              <li>complemento, quando informado;</li>
              <li>bairro;</li>
              <li>cidade;</li>
              <li>estado — UF;</li>
              <li>plano contratado;</li>
              <li>informações relacionadas à cobrança e à assinatura.</li>
            </ul>
            <p>
              Essas informações são utilizadas para contratação, faturamento, identificação do
              cliente e emissão de documentos fiscais.
            </p>
            <p>
              CPF/CNPJ e endereço são coletados somente quando passam a ser necessários para essas
              finalidades.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">5. Informações financeiras inseridas pelo usuário</h2>
            <p>
              Para oferecer suas funcionalidades de organização, acompanhamento e orientação
              financeira, o GuiaSense trata as informações inseridas pelo próprio usuário, tais
              como:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>receitas e entradas;</li>
              <li>despesas e saídas;</li>
              <li>valores;</li>
              <li>categorias e subcategorias;</li>
              <li>datas de vencimento;</li>
              <li>datas de pagamento;</li>
              <li>lançamentos provisionados;</li>
              <li>recorrências;</li>
              <li>demais informações cadastradas para utilização das funcionalidades do sistema.</li>
            </ul>
            <p>
              Esses dados são utilizados para permitir o funcionamento dos recursos de controle
              financeiro, análises, alertas e orientações oferecidos pelo GuiaSense.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">6. Dados de pagamento</h2>
            <p>
              Os pagamentos dos planos do GuiaSense são processados pelo Mercado Pago.
            </p>
            <p>
              A DevCerto não armazena os dados completos do cartão de pagamento do cliente.
            </p>
            <p>
              Para administração da assinatura e conciliação financeira, a DevCerto poderá receber
              e armazenar informações relacionadas à transação, incluindo:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>identificador do pagamento;</li>
              <li>plano contratado;</li>
              <li>valor;</li>
              <li>status da transação;</li>
              <li>datas relacionadas ao pagamento;</li>
              <li>
                informações necessárias à confirmação, renovação ou regularização da assinatura.
              </li>
            </ul>
            <p>
              Os dados completos do meio de pagamento permanecem sob responsabilidade do respectivo
              prestador de serviços de pagamento, conforme suas próprias políticas e condições.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">7. Emissão de nota fiscal</h2>
            <p>
              Quando ocorre a contratação de um plano pago, os dados necessários à emissão da Nota
              Fiscal de Serviço eletrônica — NFS-e poderão ser compartilhados com a Focus NFe,
              fornecedora utilizada pela DevCerto para integração e emissão automatizada de
              documentos fiscais.
            </p>
            <p>Entre os dados que poderão ser enviados estão:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>nome;</li>
              <li>CPF ou CNPJ;</li>
              <li>endereço de cobrança;</li>
              <li>valor da contratação;</li>
              <li>informações necessárias à emissão do documento fiscal.</li>
            </ul>
            <p>
              O compartilhamento ocorre exclusivamente para finalidades relacionadas à emissão,
              processamento, consulta, correção ou eventual cancelamento de documentos fiscais e
              para cumprimento das obrigações legais, contábeis e tributárias da DevCerto.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">8. Para quais finalidades utilizamos os dados</h2>
            <p>Os dados pessoais poderão ser tratados para:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>criar e administrar a conta do usuário;</li>
              <li>autenticar e proteger o acesso ao GuiaSense;</li>
              <li>disponibilizar as funcionalidades da plataforma;</li>
              <li>processar e administrar assinaturas;</li>
              <li>identificar e conciliar pagamentos;</li>
              <li>emitir documentos fiscais;</li>
              <li>prestar suporte e atendimento;</li>
              <li>enviar comunicações relacionadas à conta ou assinatura;</li>
              <li>gerar alertas e orientações financeiras;</li>
              <li>analisar as informações financeiras registradas pelo usuário;</li>
              <li>prevenir fraudes, abusos e acessos indevidos;</li>
              <li>proteger a segurança da plataforma;</li>
              <li>cumprir obrigações legais, regulatórias, fiscais e contábeis;</li>
              <li>exercer direitos em procedimentos administrativos, judiciais ou extrajudiciais;</li>
              <li>
                manter e melhorar a estabilidade, segurança e funcionamento do GuiaSense.
              </li>
            </ul>
            <p>A DevCerto busca tratar somente os dados necessários para atingir essas finalidades.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">9. Inteligência artificial e orientações financeiras</h2>
            <p>
              O GuiaSense utiliza recursos automatizados e de inteligência artificial para auxiliar
              na geração de alertas, análises e orientações relacionadas às informações financeiras
              registradas pelo próprio usuário.
            </p>
            <p>
              A inteligência artificial é utilizada como ferramenta de apoio para transformar
              informações financeiras em mensagens e orientações mais simples e compreensíveis.
            </p>
            <p>O GuiaSense poderá, por exemplo, identificar e informar situações relacionadas a:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>aumento relevante de determinados gastos;</li>
              <li>comportamento de categorias e subcategorias;</li>
              <li>contas próximas do vencimento ou em atraso;</li>
              <li>evolução do fluxo financeiro;</li>
              <li>previsão de saldo;</li>
              <li>alterações relevantes em relação aos meses anteriores.</li>
            </ul>
            <p>
              As orientações apresentadas pelo GuiaSense possuem caráter informativo e de apoio à
              organização financeira pessoal.
            </p>
            <p>
              Elas não representam promessa de resultado financeiro e não substituem, quando
              necessária, a avaliação de profissional especializado.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">10. Compartilhamento de dados</h2>
            <p>
              A DevCerto poderá compartilhar dados pessoais somente quando necessário para operação
              do GuiaSense ou cumprimento de suas obrigações.
            </p>
            <p>Esse compartilhamento poderá ocorrer com fornecedores responsáveis por:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>processamento de pagamentos;</li>
              <li>emissão de notas fiscais;</li>
              <li>infraestrutura tecnológica;</li>
              <li>hospedagem e banco de dados;</li>
              <li>serviços de inteligência artificial;</li>
              <li>envio de comunicações;</li>
              <li>segurança e monitoramento da aplicação;</li>
              <li>serviços contábeis, fiscais e jurídicos.</li>
            </ul>
            <p>
              Entre os prestadores atualmente relacionados à operação estão o Mercado Pago, para
              processamento de pagamentos, e a Focus NFe, para emissão de documentos fiscais.
            </p>
            <p>O compartilhamento é limitado às informações necessárias para cada finalidade.</p>
            <p>
              A DevCerto também poderá fornecer informações quando necessário para cumprimento de
              obrigação legal ou regulatória, ordem de autoridade competente ou exercício regular
              de direitos.
            </p>
            <p>A DevCerto não vende nem comercializa dados pessoais de seus usuários.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">11. Segurança das informações</h2>
            <p>
              A DevCerto adota medidas técnicas e administrativas destinadas à proteção dos dados
              pessoais contra acessos não autorizados e situações acidentais ou ilícitas de perda,
              destruição, alteração, comunicação ou tratamento inadequado.
            </p>
            <p>Entre as medidas implementadas no GuiaSense estão:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>utilização de conexão segura HTTPS;</li>
              <li>controles de autenticação e acesso;</li>
              <li>proteção das credenciais dos usuários;</li>
              <li>restrição de acesso às informações;</li>
              <li>criptografia de CPF/CNPJ armazenado;</li>
              <li>uso de criptografia AES-256-GCM para proteção dessas informações em repouso;</li>
              <li>
                não armazenamento dos dados completos dos cartões utilizados nos pagamentos;
              </li>
              <li>prevenção de exposição de dados pessoais em logs;</li>
              <li>mecanismos de anonimização de usuários quando aplicável.</li>
            </ul>
            <p>
              Apesar das medidas adotadas, nenhum sistema eletrônico pode garantir proteção
              absoluta contra todos os tipos de incidentes de segurança.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">12. Armazenamento e conservação</h2>
            <p>Os dados pessoais poderão ser mantidos durante o período necessário para:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>disponibilização do GuiaSense;</li>
              <li>manutenção da conta do usuário;</li>
              <li>cumprimento do contrato;</li>
              <li>administração da assinatura;</li>
              <li>emissão e armazenamento de documentos fiscais;</li>
              <li>cumprimento de obrigações legais, fiscais, regulatórias ou contábeis;</li>
              <li>prevenção de fraudes;</li>
              <li>exercício regular de direitos.</li>
            </ul>
            <p>
              Quando os dados deixarem de ser necessários e não houver obrigação ou fundamento
              legal para mantê-los, poderão ser excluídos ou anonimizados.
            </p>
            <p>
              A solicitação de exclusão de conta não significa necessariamente eliminação imediata
              de todas as informações quando sua manutenção for exigida ou permitida pela
              legislação.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">13. Direitos do titular</h2>
            <p>Nos termos da LGPD, o titular dos dados poderá, conforme aplicável, solicitar:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>confirmação da existência de tratamento;</li>
              <li>acesso aos dados pessoais;</li>
              <li>correção de informações incompletas, inexatas ou desatualizadas;</li>
              <li>anonimização, bloqueio ou eliminação de dados tratados de maneira inadequada ou excessiva;</li>
              <li>informações sobre compartilhamento de dados;</li>
              <li>portabilidade, observadas as regras aplicáveis;</li>
              <li>eliminação de dados tratados com base em consentimento, quando aplicável;</li>
              <li>informações sobre as consequências da recusa de consentimento;</li>
              <li>revogação do consentimento, quando aplicável;</li>
              <li>oposição ao tratamento nas hipóteses previstas em lei;</li>
              <li>
                revisão de decisões tomadas unicamente com base em tratamento automatizado, quando
                aplicável.
              </li>
            </ul>
            <p>As solicitações poderão ser encaminhadas para: <strong>lgpd@devcerto.com</strong></p>
            <p>
              Por motivos de segurança, a DevCerto poderá solicitar informações adicionais para
              confirmar a identidade do titular antes de atender determinadas solicitações.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">14. Exclusão e anonimização da conta</h2>
            <p>
              O titular poderá solicitar a exclusão de sua conta e dos dados pessoais associados por
              meio do Canal de Privacidade e Proteção de Dados.
            </p>
            <p>Após a solicitação e as verificações necessárias, os dados poderão ser:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>eliminados;</li>
              <li>anonimizados;</li>
              <li>ou mantidos somente nos casos em que a legislação autorizar ou exigir sua conservação.</li>
            </ul>
            <p>
              Dados anonimizados que não permitam mais a identificação do titular poderão ser
              mantidos nos termos da legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">15. Cookies e tecnologias necessárias ao funcionamento</h2>
            <p>
              O GuiaSense poderá utilizar cookies e tecnologias semelhantes necessários para:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>autenticação;</li>
              <li>manutenção da sessão;</li>
              <li>segurança;</li>
              <li>funcionamento adequado da aplicação;</li>
              <li>preferências necessárias à utilização da plataforma.</li>
            </ul>
            <p>
              Caso futuramente sejam utilizados cookies ou tecnologias para analytics, publicidade
              ou outras finalidades não estritamente necessárias, esta Política será atualizada e,
              quando aplicável, serão oferecidas informações e opções adicionais ao usuário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">16. Crianças e adolescentes</h2>
            <p>
              O GuiaSense não foi desenvolvido especificamente para utilização por crianças.
            </p>
            <p>
              Caso a DevCerto identifique situações envolvendo tratamento de dados pessoais de
              crianças ou adolescentes que exijam medidas específicas previstas em lei, adotará os
              procedimentos necessários conforme a legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">17. Alterações desta Política de Privacidade</h2>
            <p>Esta Política poderá ser atualizada para refletir:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>alterações nas funcionalidades do GuiaSense;</li>
              <li>mudanças na forma de tratamento dos dados;</li>
              <li>inclusão ou substituição de fornecedores;</li>
              <li>alterações legais ou regulatórias;</li>
              <li>aprimoramentos relacionados à segurança e privacidade.</li>
            </ul>
            <p>
              A versão e a data da última atualização estarão disponíveis no início do documento.
            </p>
            <p>
              O sistema mantém registro da versão da Política de Privacidade apresentada e aceita
              pelo usuário no momento do cadastro.
            </p>
            <p>
              Quando houver alterações relevantes que possam afetar significativamente os direitos
              do titular ou as finalidades do tratamento, a DevCerto poderá comunicar os usuários
              e, quando necessário, solicitar nova manifestação.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">18. Contato</h2>
            <p>Para dúvidas, solicitações ou exercício dos direitos relacionados à privacidade e proteção de dados:</p>
            <p>
              <strong>DevCerto Tecnologia LTDA</strong>
              <br />
              CNPJ: 68.827.410/0001-44
              <br />
              Produto: GuiaSense
            </p>
            <p>
              <strong>Canal de Privacidade e Proteção de Dados</strong>
              <br />
              E-mail: lgpd@devcerto.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}