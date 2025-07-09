# Contribuindo para o Dashboard Analítico

Obrigado por considerar contribuir para este projeto! 🎉

## Como Contribuir

### 1. Fork do Projeto
- Faça um fork do repositório
- Clone o fork para sua máquina local
- Crie uma branch para sua feature

### 2. Configuração do Ambiente de Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Dashboard-Analitico.git
cd Dashboard-Analitico

# Instale as dependências do backend
cd backend
npm install

# Instale as dependências do frontend
cd ../frontend
npm install
```

### 3. Executando o Projeto Localmente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Fazendo Mudanças

- Certifique-se de que seu código segue os padrões do projeto
- Teste suas mudanças localmente
- Escreva mensagens de commit claras e descritivas

### 5. Enviando Suas Mudanças

```bash
# Adicione suas mudanças
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade X"

# Push para sua branch
git push origin sua-branch

# Abra um Pull Request
```

## Padrões de Código

### Frontend (Next.js + TypeScript)
- Use TypeScript para tipagem estática
- Siga as convenções do React Hooks
- Use Tailwind CSS para estilização
- Componentes devem ser funcionais

### Backend (Node.js + Express)
- Use async/await para operações assíncronas
- Implemente tratamento de erro adequado
- Documente APIs com comentários JSDoc
- Use variáveis de ambiente para configurações

## Tipos de Contribuição

### 🐛 Reportar Bugs
- Use a aba "Issues" do GitHub
- Descreva o problema detalhadamente
- Inclua passos para reproduzir o bug
- Adicione screenshots se necessário

### ✨ Sugerir Melhorias
- Abra uma issue com a tag "enhancement"
- Descreva a melhoria proposta
- Explique por que seria útil

### 🔧 Implementar Features
- Verifique se já não existe uma issue para a feature
- Discuta a implementação antes de começar
- Mantenha o escopo do PR focado

## Estrutura de Commit

Use os seguintes prefixos para suas mensagens de commit:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Manutenção

Exemplo: `feat: adiciona gráfico de pizza para métricas`

## Guias de Estilo

### JavaScript/TypeScript
- Use 2 espaços para indentação
- Use single quotes para strings
- Adicione vírgula trailing em objetos e arrays
- Use nomes descritivos para variáveis e funções

### CSS/Tailwind
- Prefira classes utilitárias do Tailwind
- Use responsive design
- Mantenha consistência visual

## Testando

Antes de enviar um PR:

1. Teste o projeto localmente
2. Verifique se não há erros no console
3. Teste em diferentes navegadores (Chrome, Firefox, Safari)
4. Verifique responsividade mobile

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Verifique a documentação no README.md
2. Procure issues similares
3. Abra uma nova issue com a tag "question"

## Código de Conduta

- Seja respeitoso com outros contribuidores
- Use linguagem inclusiva
- Mantenha discussões construtivas
- Foque no código, não na pessoa

## Reconhecimento

Todos os contribuidores serão reconhecidos no projeto. Obrigado por ajudar a melhorar o Dashboard Analítico! 🚀
