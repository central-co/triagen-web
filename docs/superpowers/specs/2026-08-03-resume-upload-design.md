# Upload de currículo (PDF) na candidatura — Design

**Data:** 2026-08-03
**Contexto:** Antes da gravação do vídeo demo, o campo de currículo em texto puro na página de candidatura passa má impressão. Decisão aprovada: extração de texto no frontend (opção A), mantendo o backend e o banco intactos. A evolução futura (guardar o PDF original no Supabase Storage) fica para a fase de polimento pós-demo.

## Objetivo

Substituir o textarea "Resumo do seu currículo" em `src/components/dashboard/jobs/JobApplicationPage.tsx` por um campo de upload de PDF que extrai o texto no navegador e envia o resultado no mesmo campo `resume_text` do payload atual de `POST /application/create`. Nenhuma mudança em backend, banco ou contrato de API.

## Arquitetura

- **Extração:** `pdfjs-dist` (worker via bundler, padrão do Vite). Ao selecionar o arquivo, extrair o texto de todas as páginas (`getTextContent`) e concatenar com quebras de linha por página.
- **Componente novo:** `src/components/ui/ResumeUploadField.tsx`, seguindo o padrão dos componentes de UI existentes (prop `darkMode`, estilo dos componentes de `Field.tsx`). Responsabilidade única: receber um `File`, extrair texto, reportar `onTextExtracted(text, fileName)` ou erro. A página continua dona do estado `resume_text`.
- **Payload:** inalterado — `resume_text` segue como string opcional.

## UX

- Área de upload com clique e drag-and-drop, aceitando apenas `.pdf` (validação por extensão e MIME type), limite de 10 MB.
- Estados visíveis: vazio (instrução "Anexe seu currículo em PDF"), processando (spinner), sucesso (nome do arquivo + confirmação de leitura + ação de remover), erro (mensagem clara).
- **Fallback:** link discreto "Prefere escrever? Preencha manualmente" que revela o textarea atual. Se o PDF não tiver camada de texto (extração retorna vazio/quase vazio, < 50 caracteres), mostrar erro orientando usar o fallback: "Não conseguimos ler este PDF. Ele pode ser digitalizado como imagem — tente outro arquivo ou escreva um resumo."
- Campo permanece **opcional**, como hoje.
- Textos em pt-BR, coerentes com o tom atual da página.

## Tratamento de erros

- Arquivo não-PDF ou acima de 10 MB: mensagem inline no campo, sem tocar no erro global do formulário.
- Falha na extração (PDF corrompido, exceção do pdf.js): mesma mensagem de fallback acima.
- Erros de extração nunca bloqueiam o envio do formulário — o candidato pode remover o arquivo ou usar o textarea.

## Testes

O projeto não tem suíte de testes de frontend configurada; a verificação será manual via dev server (fluxo completo: upload de PDF válido, PDF escaneado sem texto, arquivo inválido, fallback de texto, envio da candidatura) antes de dar o trabalho como concluído.

## Fora de escopo

- Suporte a `.docx` (pode ser adicionado depois com `mammoth` se os testadores pedirem).
- Armazenamento do arquivo original (opção C — Supabase Storage), rate limiting e encurtamento do código da entrevista no e-mail: fase pós-demo.
