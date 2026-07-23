# Triagen Web - Roadmap de Refatoração e Melhorias

## 📋 Visão Geral

Este documento mapeia oportunidades de melhoria e refatoração identificadas no repositório triagen-web, organizadas por prioridade, impacto e esforço de implementação.

## 🔍 Análise Técnica Executada

### Stack Tecnológico Atual
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth + Database)
- **Real-time**: LiveKit (Video/Audio)
- **Routing**: React Router v7
- **Linting**: ESLint + TypeScript ESLint

### Métricas de Qualidade Atuais
- **ESLint Issues**: 42 problemas (33 erros + 9 warnings)
- **Type Safety**: ~85% (15% usando `any`)
- **Code Duplication**: Alta (11+ componentes com loading duplicado)
- **Bundle Size**: Não otimizado
- **Test Coverage**: 0% (sem testes identificados)

---

## 🎯 Melhorias por Prioridade

### 🔴 Alta Prioridade
> **Critério**: Alto impacto na qualidade do código + Baixo esforço de implementação

#### 1. Componente Loading Spinner Reutilizável
**Problema**: 11+ implementações duplicadas do mesmo spinner
```tsx
// Atual (repetido em 11+ arquivos)
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue"></div>
```

**Solução Proposta**:
```tsx
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

**Arquivos Afetados**: 11 componentes
**Esforço**: 2-3 horas
**Impacto**: Manutenibilidade, Consistência

#### 2. Eliminação de Tipos `any`
**Problema**: 16+ ocorrências de `any` prejudicando type safety

**Locations identificadas**:
- `src/types/company.ts`: 8 ocorrências
- `src/hooks/useJobsData.ts`: 2 ocorrências  
- `src/components/dashboard/`: Múltiplas ocorrências

**Soluções Específicas**:
```typescript
// Em vez de Record<string, any>
interface CustomFields {
  [key: string]: string | number | boolean | string[];
}

// Em vez de any[] para evaluation_criteria
interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  description?: string;
}
```

**Esforço**: 4-6 horas
**Impacto**: Type Safety, Developer Experience

#### 3. Correção de Dependências useEffect
**Problema**: 9 warnings de `react-hooks/exhaustive-deps`

**Arquivos Afetados**:
- `InterviewRoom.tsx`
- `CandidateProfilePage.tsx`
- `CandidatesPage.tsx`
- `JobApplicationPage.tsx`
- `JobDetailsPage.tsx`
- `ReportsPage.tsx`
- `SettingsPage.tsx`
- `useDashboardStats.ts`
- `useJobsData.ts`

**Soluções**:
1. Adicionar dependências faltantes
2. Usar `useCallback` para funções
3. Extrair lógica para custom hooks

**Esforço**: 3-4 horas
**Impacto**: Performance, Prevenção de bugs

#### 4. Limpeza de Código Morto
**Problema**: Múltiplos exports/variáveis não utilizados

**Arquivos com Código Morto**:
- `src/utils/apiSecurity.ts`: Arquivo completamente não utilizado
- `src/integrations/supabase/types.ts`: 6 tipos não utilizados
- `src/utils/config.ts`: 2 funções não utilizadas
- `src/types/company.ts`: 4 interfaces não utilizadas

**Esforço**: 1-2 horas
**Impacto**: Bundle size, Clareza do código

### 🟡 Média Prioridade
> **Critério**: Impacto médio-alto + Esforço médio

#### 5. Error Boundary Global
**Problema**: Sem tratamento centralizado de erros

**Implementação Proposta**:
```tsx
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  // Implementação com fallback UI e logging
}

// src/hooks/useErrorHandler.ts
export function useErrorHandler() {
  // Hook para tratamento consistente de erros
}
```

**Esforço**: 4-6 horas
**Impacto**: UX, Debugging, Manutenibilidade

#### 6. Hook Customizado para Data Fetching
**Problema**: Padrões de fetch duplicados e inconsistentes

**Implementação Proposta**:
```tsx
// src/hooks/useApiCall.ts
interface UseApiCallOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiCall<T>(
  apiCall: () => Promise<T>,
  options: UseApiCallOptions<T> = {}
) {
  // Implementação com loading, error, retry
}
```

**Esforço**: 6-8 horas
**Impacto**: Consistência, Manutenibilidade

#### 7. Loading State Hook
**Problema**: Estados de loading duplicados e inconsistentes

**Implementação Proposta**:
```tsx
// src/hooks/useLoadingState.ts
export function useLoadingState(initialState = false) {
  // Gerenciamento centralizado de loading states
}
```

**Esforço**: 2-3 horas
**Impacto**: Consistência, UX

#### 8. Interfaces para API Responses
**Problema**: Respostas da API sem tipagem adequada

**Áreas Identificadas**:
- Supabase queries responses
- Edge function responses
- Form submission responses

**Esforço**: 4-5 horas
**Impacto**: Type Safety, Documentation

### 🟢 Baixa Prioridade
> **Critério**: Impacto baixo-médio + Alto esforço

#### 9. Decomposição de Componentes Grandes
**Componentes Identificados**:
- `JobDetailsPage.tsx` (200+ linhas)
- `CandidateProfilePage.tsx` (400+ linhas)
- `Button.tsx` (106 linhas com muitas props)

**Esforço**: 8-12 horas
**Impacto**: Manutenibilidade, Testabilidade

#### 10. Design Tokens
**Problema**: Classes TailwindCSS hardcoded repetidas

**Solução Proposta**:
```css
/* src/styles/design-tokens.css */
:root {
  --color-primary-blue: /* valor da cor */;
  --spacing-component: /* valor do spacing */;
}
```

**Esforço**: 6-8 horas
**Impacto**: Consistência visual, Manutenibilidade

#### 11. Code Splitting e Lazy Loading
**Oportunidades**:
- Rotas do dashboard
- Componentes pesados (Interview, Reports)
- Bibliotecas third-party

**Esforço**: 4-6 horas
**Impacto**: Performance, Bundle size

---

## 📊 Análise de Impacto vs Esforço

```
Alto Impacto     │ 2. Type Safety        │ 5. Error Boundary
                 │ 3. useEffect deps     │ 6. Data Fetching Hook
                 │ 1. Loading Spinner    │ 
─────────────────┼───────────────────────┼──────────────────────
Baixo Impacto    │ 4. Código Morto       │ 9. Component Splitting
                 │                       │ 10. Design Tokens
                 │                       │ 11. Code Splitting
                 Baixo Esforço           Alto Esforço
```

## 🚀 Plano de Implementação Recomendado

### Sprint 1 (Semana 1)
- [ ] Criar LoadingSpinner component
- [ ] Limpar código morto
- [ ] Corrigir 3-4 useEffect dependencies mais críticos

### Sprint 2 (Semana 2)  
- [ ] Implementar types apropriados (eliminar anys)
- [ ] Corrigir remaining useEffect dependencies
- [ ] Criar Error Boundary básico

### Sprint 3 (Semana 3)
- [ ] Implementar useApiCall hook
- [ ] Implementar useLoadingState hook
- [ ] Refatorar 2-3 componentes para usar novos hooks

### Sprint 4 (Semana 4)
- [ ] Definir interfaces para API responses
- [ ] Implementar design tokens básicos
- [ ] Planejar code splitting strategy

## 🎯 Objetivos de Qualidade

### Curto Prazo (1 mês)
- ✅ 0 ESLint errors
- ✅ 0 TypeScript `any` types
- ✅ 100% components usando LoadingSpinner
- ✅ Error boundary implementado

### Médio Prazo (2-3 meses)
- ✅ Custom hooks implementados
- ✅ Code splitting nas rotas principais
- ✅ Design tokens estabelecidos
- ✅ Testes unitários (coverage > 70%)

### Longo Prazo (6 meses)
- ✅ Architecture documentation
- ✅ Performance benchmarks
- ✅ Accessibility compliance
- ✅ Storybook para design system

## 📚 Recursos e Referências

### Documentação
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint React Hooks Rules](https://legacy.reactjs.org/docs/hooks-rules.html)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#async-chunks)

### Tools Sugeridas
- **Type Generation**: `typescript-transform-paths`
- **Bundle Analysis**: `rollup-plugin-visualizer`
- **Performance**: `@loadable/component`
- **Testing**: `@testing-library/react`

---

*Documento gerado em: Dezembro 2024*
*Última atualização: Análise inicial completa*