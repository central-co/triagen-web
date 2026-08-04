# Upload de currículo (PDF) na candidatura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o textarea de currículo em texto puro na página de candidatura por um campo de upload de PDF que extrai o texto no navegador, sem alterar backend, banco ou contrato de API.

**Architecture:** Um utilitário puro (`extractPdfText`) usa `pdfjs-dist` para ler o texto de um `File` PDF no navegador. Um componente de UI (`ResumeUploadField`) encapsula a dropzone (clique + drag-and-drop nativo via `<input type="file">`), os estados visuais (vazio/carregando/sucesso/erro) e chama esse utilitário. A página `JobApplicationPage` alterna entre esse componente e o textarea original através de um link de fallback, mas em ambos os casos escreve no mesmo campo de estado `formData.resume_text` que já é enviado para `POST /application/create` hoje.

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, `pdfjs-dist@4.8.69` (pinado — versões 4.9+ exigem Node ≥20, e o ambiente de build do Netlify não tem essa versão garantida).

## Global Constraints

- Não alterar `triagen-core` (backend), banco de dados, ou o payload de `POST /application/create`. O campo `resume_text` continua sendo uma string opcional.
- `pdfjs-dist` fixado em `4.8.69` exato (não usar `^`/`~`) — é a última versão da série 4.x com `engines.node: ">=18"`. Confirmado via `npm view pdfjs-dist@4.8.69 engines` e inspeção do tarball (`build/pdf.worker.mjs` e `build/pdf.worker.min.mjs` existem, sem `exports` map restritivo no `package.json` do pacote).
- Não há suíte de testes de frontend configurada neste projeto (sem vitest/jest). Verificação é manual via dev server, conforme já documentado no spec.
- `npm run build` roda só `vite build` (esbuild, sem `tsc`) — mas ainda assim escrever TypeScript correto e rodar `npm run lint` (eslint com typescript-eslint) como verificação, já que é rápido e evita erros óbvios.
- Seguir os tokens de design existentes: cores `triagen-*` do `tailwind.config.js`, padrão de `label`/`hint` do `src/components/ui/Field.tsx`, ícones de `lucide-react`, textos em pt-BR no tom já usado na página.
- Tamanho máximo de arquivo: 10 MB. Formato aceito: apenas `.pdf`.
- Limiar de extração válida: texto extraído com `< 50` caracteres (após `trim()`) é tratado como falha (PDF provavelmente escaneado/sem camada de texto).

---

### Task 1: Instalar `pdfjs-dist` e criar o utilitário de extração

**Files:**
- Modify: `package.json` (adicionar dependência)
- Create: `src/lib/extractPdfText.ts`

**Interfaces:**
- Produces: `extractPdfText(file: File): Promise<string>` — retorna o texto concatenado de todas as páginas do PDF (páginas separadas por `\n\n`), já com `trim()` aplicado no resultado final. Lança (`throw`) se o PDF não puder ser parseado (arquivo corrompido, não é um PDF válido, etc.).

- [ ] **Step 1: Instalar a dependência pinada**

Run:
```bash
npm install pdfjs-dist@4.8.69
```

Expected: `package.json` passa a ter `"pdfjs-dist": "4.8.69"` em `dependencies` (sem `^`).

- [ ] **Step 2: Criar o utilitário de extração**

Create `src/lib/extractPdfText.ts`:

```ts
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extracts text from a PDF file entirely in the browser using pdf.js.
 * Throws if the file cannot be parsed as a PDF.
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText.trim());
  }

  return pageTexts.join('\n\n').trim();
}
```

- [ ] **Step 3: Verificar que o projeto compila e o lint passa**

Run:
```bash
npm run lint
```

Expected: sem erros novos relacionados a `src/lib/extractPdfText.ts` (o arquivo não deve gerar warnings de `no-unused-vars` ou tipos implícitos).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/extractPdfText.ts
git commit -m "feat: adiciona utilitário de extração de texto de PDF no frontend"
```

---

### Task 2: Criar o componente `ResumeUploadField`

**Files:**
- Create: `src/components/ui/ResumeUploadField.tsx`

**Interfaces:**
- Consumes: `extractPdfText(file: File): Promise<string>` do Task 1 (`src/lib/extractPdfText.ts`).
- Produces:
  ```ts
  interface ResumeUploadFieldProps {
    darkMode?: boolean;
    onTextExtracted: (text: string, fileName: string) => void;
    onRemove: () => void;
  }
  export default function ResumeUploadField(props: Readonly<ResumeUploadFieldProps>): JSX.Element;
  ```
  Componente controla seu próprio estado visual internamente (idle/loading/success/error) e chama `onTextExtracted` sempre que uma extração for bem-sucedida (texto com 50+ caracteres), e `onRemove` quando o usuário remove o arquivo selecionado.

- [ ] **Step 1: Criar o componente**

Create `src/components/ui/ResumeUploadField.tsx`:

```tsx
import { useId, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { extractPdfText } from '../../lib/extractPdfText';
import StatusMessage from './StatusMessage';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_EXTRACTED_TEXT_LENGTH = 50;
const UNREADABLE_PDF_MESSAGE =
  'Não conseguimos ler este PDF. Ele pode ser digitalizado como imagem — tente outro arquivo ou escreva um resumo.';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

interface ResumeUploadFieldProps {
  darkMode?: boolean;
  onTextExtracted: (text: string, fileName: string) => void;
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUploadField({
  darkMode = false,
  onTextExtracted,
  onRemove,
}: Readonly<ResumeUploadFieldProps>) {
  const inputId = useId();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setErrorMessage('Envie um arquivo em formato PDF.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setStatus('error');
      setErrorMessage(`O arquivo deve ter no máximo 10 MB (este tem ${formatFileSize(file.size)}).`);
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const text = await extractPdfText(file);
      if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
        setStatus('error');
        setErrorMessage(UNREADABLE_PDF_MESSAGE);
        return;
      }
      setFileName(file.name);
      setStatus('success');
      onTextExtracted(text, file.name);
    } catch {
      setStatus('error');
      setErrorMessage(UNREADABLE_PDF_MESSAGE);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void processFile(file);
  };

  const handleRemove = () => {
    setStatus('idle');
    setFileName(null);
    setErrorMessage(null);
    onRemove();
  };

  const labelClasses = `block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`;
  const hintClasses = `text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`;

  const dropzoneClasses = `relative rounded border-2 border-dashed p-8 text-center transition-colors duration-200 ${
    isDragging
      ? darkMode
        ? 'border-triagen-secondary-green bg-triagen-secondary-green/10'
        : 'border-triagen-secondary-green bg-triagen-sage-tint/40'
      : darkMode
        ? 'border-gray-700 bg-gray-800/40'
        : 'border-triagen-border-light bg-white'
  }`;

  return (
    <div>
      <label htmlFor={inputId} className={labelClasses}>Currículo (opcional)</label>

      {status === 'success' && fileName ? (
        <div className={`flex items-center gap-3 rounded border p-4 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
          <FileText className={`h-8 w-8 shrink-0 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-secondary-green'}`} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{fileName}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Currículo lido com sucesso</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remover currículo anexado"
            className={`shrink-0 p-1.5 rounded transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-triagen-secondary hover:bg-neutral-100 hover:text-triagen-primary'}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={dropzoneClasses}>
          <input
            id={inputId}
            type="file"
            accept="application/pdf,.pdf"
            disabled={status === 'loading'}
            onChange={handleFileChange}
            onDragEnter={() => setIsDragging(true)}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label="Anexar currículo em PDF"
          />
          <div className="pointer-events-none flex flex-col items-center gap-2">
            {status === 'loading' ? (
              <>
                <Loader2 className={`h-8 w-8 animate-spin ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`} aria-hidden="true" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>Lendo currículo...</p>
              </>
            ) : (
              <>
                <Upload className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`} aria-hidden="true" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                  Arraste seu currículo em PDF aqui ou clique para selecionar
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {status !== 'error' && <p className={hintClasses}>Formato aceito: PDF, até 10 MB.</p>}
      {status === 'error' && errorMessage && (
        <StatusMessage type="error" message={errorMessage} darkMode={darkMode} className="mt-3" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar lint**

Run:
```bash
npm run lint
```

Expected: sem erros novos em `src/components/ui/ResumeUploadField.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ResumeUploadField.tsx
git commit -m "feat: adiciona componente ResumeUploadField com dropzone e extração de PDF"
```

---

### Task 3: Integrar o upload na página de candidatura com fallback para texto manual

**Files:**
- Modify: `src/components/dashboard/jobs/JobApplicationPage.tsx:1-14` (imports), `:48-54` (estado inicial), `:393-403` (bloco do textarea)

**Interfaces:**
- Consumes: `ResumeUploadField` (Task 2, props `darkMode`, `onTextExtracted(text, fileName)`, `onRemove()`), `formData.resume_text` (estado já existente, inalterado).

- [ ] **Step 1: Importar o novo componente**

In `src/components/dashboard/jobs/JobApplicationPage.tsx`, after the existing import of `Input, Textarea` from `'../../ui/Field'` (around line 13), add:

```ts
import ResumeUploadField from '../../ui/ResumeUploadField';
```

- [ ] **Step 2: Adicionar estado de alternância entre upload e texto manual**

Find (around line 37-46):

```tsx
function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [acceptingApplications, setAcceptingApplications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { darkMode } = useDarkMode();
```

Replace with:

```tsx
function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [acceptingApplications, setAcceptingApplications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resumeMode, setResumeMode] = useState<'upload' | 'manual'>('upload');
  const { darkMode } = useDarkMode();
```

- [ ] **Step 3: Adicionar handlers de upload e alternância de modo**

Find the `handlePhoneChange` function (around line 131-144) and add the new handlers right after it, before `handleSubmit`:

```tsx
  const handleResumeExtracted = (text: string) => {
    setFormData(prev => ({ ...prev, resume_text: text }));
  };

  const handleResumeRemoved = () => {
    setFormData(prev => ({ ...prev, resume_text: '' }));
  };

  const toggleResumeMode = () => {
    setResumeMode(prev => (prev === 'upload' ? 'manual' : 'upload'));
    setFormData(prev => ({ ...prev, resume_text: '' }));
  };
```

- [ ] **Step 4: Substituir o textarea fixo pelo par upload/manual com fallback**

Find (around line 393-403):

```tsx
            <Textarea
              label="Resumo do seu currículo (opcional)"
              id="resume_text"
              name="resume_text"
              darkMode={darkMode}
              value={formData.resume_text}
              onChange={handleInputChange}
              placeholder="Descreva brevemente sua experiência profissional, formação e principais habilidades..."
              rows={4}
              hint="Essas informações ajudam nossa IA a personalizar a entrevista para você."
            />
```

Replace with:

```tsx
            {resumeMode === 'upload' ? (
              <div>
                <ResumeUploadField
                  darkMode={darkMode}
                  onTextExtracted={handleResumeExtracted}
                  onRemove={handleResumeRemoved}
                />
                <button
                  type="button"
                  onClick={toggleResumeMode}
                  className={`mt-2 text-xs font-medium underline underline-offset-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary'}`}
                >
                  Prefere escrever? Preencha manualmente
                </button>
              </div>
            ) : (
              <div>
                <Textarea
                  label="Resumo do seu currículo (opcional)"
                  id="resume_text"
                  name="resume_text"
                  darkMode={darkMode}
                  value={formData.resume_text}
                  onChange={handleInputChange}
                  placeholder="Descreva brevemente sua experiência profissional, formação e principais habilidades..."
                  rows={4}
                  hint="Essas informações ajudam nossa IA a personalizar a entrevista para você."
                />
                <button
                  type="button"
                  onClick={toggleResumeMode}
                  className={`mt-2 text-xs font-medium underline underline-offset-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary'}`}
                >
                  Prefere anexar um arquivo? Volte para o upload
                </button>
              </div>
            )}
```

- [ ] **Step 5: Verificar lint**

Run:
```bash
npm run lint
```

Expected: sem erros novos em `JobApplicationPage.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/jobs/JobApplicationPage.tsx
git commit -m "feat: integra upload de PDF com fallback manual na página de candidatura"
```

---

### Task 4: Verificação manual end-to-end no dev server

**Files:** nenhum (apenas verificação)

**Interfaces:** N/A — este task exercita o fluxo completo construído nos Tasks 1-3.

- [ ] **Step 1: Subir o dev server**

Run:
```bash
npm run dev
```

Expected: servidor sobe em `http://localhost:8080` sem erros no terminal.

- [ ] **Step 2: Abrir a página de candidatura de uma vaga aberta**

Navegar até `/jobs/:jobId/apply` (ou o caminho equivalente usado no roteamento) para uma vaga com `status: 'open'` existente no ambiente de desenvolvimento.

Expected: campo "Currículo (opcional)" aparece como dropzone (não mais textarea), com texto "Arraste seu currículo em PDF aqui ou clique para selecionar".

- [ ] **Step 3: Testar upload de um PDF com texto extraível**

Clicar na dropzone e selecionar um PDF de currículo real (com texto selecionável, não escaneado).

Expected: estado "Lendo currículo..." aparece brevemente, depois o estado de sucesso mostra o nome do arquivo e "Currículo lido com sucesso". Nenhum erro no console do navegador.

- [ ] **Step 4: Testar remoção do arquivo**

Clicar no botão de remover (ícone X) no estado de sucesso.

Expected: volta para a dropzone vazia; `formData.resume_text` volta a ficar vazio (verificável submetendo o formulário depois e checando no backend/Supabase que o campo ficou vazio, ou via React DevTools).

- [ ] **Step 5: Testar arquivo inválido (não-PDF)**

Selecionar um arquivo `.txt` ou `.jpg` renomeado sem extensão `.pdf`, ou qualquer arquivo que não termine em `.pdf`.

Expected: mensagem de erro "Envie um arquivo em formato PDF." aparece abaixo da dropzone.

- [ ] **Step 6: Testar fallback manual**

Clicar em "Prefere escrever? Preencha manualmente".

Expected: dropzone é substituída pelo textarea original ("Resumo do seu currículo (opcional)"), com link "Prefere anexar um arquivo? Volte para o upload" abaixo. Digitar um texto e confirmar que fica no campo. Clicar no link de volta e confirmar que retorna à dropzone vazia.

- [ ] **Step 7: Testar envio completo da candidatura com currículo anexado**

Preencher nome, e-mail, anexar um PDF válido, e enviar o formulário.

Expected: tela de sucesso ("Candidatura enviada!") aparece; verificar no Supabase (tabela `candidates` ou equivalente) que o campo `resume_url` contém o texto extraído do PDF, igual ao comportamento atual com texto manual.

- [ ] **Step 8: Confirmar que nenhuma regressão visual ocorreu em modo escuro**

Alternar o dark mode (toggle já existente na página) e repassar pelos estados idle/loading/success/error do `ResumeUploadField`.

Expected: cores e contraste seguem o padrão dos demais campos do formulário (`Field.tsx`) em ambos os temas.
