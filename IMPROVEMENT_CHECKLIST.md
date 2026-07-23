# Checklist de Melhorias - Triagen Web

## 📊 Status Atual do Repositório

### Problemas Identificados
- **ESLint Issues**: 42 problemas (33 erros + 9 warnings)
- **Type Safety**: 16+ usos de `any` type
- **Code Duplication**: 11+ loading spinners duplicados
- **Dead Code**: 4 arquivos/funções não utilizados
- **Architecture**: Sem error boundary, padrões inconsistentes

---

## 🎯 Checklist de Implementação

### 🔴 Alta Prioridade (Semana 1-2)

#### ✅ Componente Loading Spinner Reutilizável
- [ ] Criar `src/components/ui/LoadingSpinner.tsx`
- [ ] Definir interface com props (size, color, text)
- [ ] Substituir em `App.tsx` (2 ocorrências)
- [ ] Substituir em `LandingPage.tsx`
- [ ] Substituir em `CandidateProfilePage.tsx`
- [ ] Substituir em `CandidatesPage.tsx`
- [ ] Substituir em `ReportsPage.tsx`
- [ ] Substituir em `DashboardHome.tsx`
- [ ] Substituir em `SettingsPage.tsx`
- [ ] Substituir em `JobsPage.tsx`
- [ ] Substituir em `JobDetailsPage.tsx`
- [ ] Substituir em `JobApplicationPage.tsx`
- [ ] Testar todas as telas com novo componente
- [ ] Validar responsividade e dark mode

#### ✅ Eliminação de Tipos `any`
- [ ] Criar `src/types/common.ts` com interfaces:
  - [ ] `CustomFields` interface
  - [ ] `CustomQuestion` interface  
  - [ ] `EvaluationCriteria` interface
  - [ ] `CategoryScores` interface
  - [ ] `CustomAnswers` interface
- [ ] Atualizar `src/types/company.ts`:
  - [ ] Substituir `Record<string, any>` por `CustomFields`
  - [ ] Substituir `any[]` por tipos específicos
  - [ ] Adicionar `PlanFeatures` interface
  - [ ] Adicionar `UsageMetadata` interface
- [ ] Atualizar `src/hooks/useJobsData.ts`:
  - [ ] Remover cast `as Record<string, any>`
  - [ ] Usar tipos específicos
- [ ] Atualizar componentes dashboard:
  - [ ] `CandidateProfilePage.tsx`
  - [ ] `JobDetailsPage.tsx`
  - [ ] `JobApplicationPage.tsx`
  - [ ] `NewJobPage.tsx`
- [ ] Atualizar `src/hooks/useAuth.ts`:
  - [ ] Substituir `metadata?: any` por interface específica
- [ ] Executar `tsc --noEmit` para validar

#### ✅ Correção Dependências useEffect
- [ ] `src/components/InterviewRoom.tsx`:
  - [ ] Adicionar `connectToRoom` e `room` como deps
  - [ ] Ou mover lógica para useCallback
- [ ] `src/components/dashboard/candidates/CandidateProfilePage.tsx`:
  - [ ] Converter `fetchCandidate` para useCallback
  - [ ] Adicionar dep correta
- [ ] `src/components/dashboard/candidates/CandidatesPage.tsx`:
  - [ ] Converter `fetchData` para useCallback
- [ ] `src/components/dashboard/jobs/JobApplicationPage.tsx`:
  - [ ] Converter `fetchJob` para useCallback
- [ ] `src/components/dashboard/jobs/JobDetailsPage.tsx`:
  - [ ] Converter `fetchJobDetails` para useCallback
- [ ] `src/components/dashboard/reports/ReportsPage.tsx`:
  - [ ] Converter `fetchReports` para useCallback
- [ ] `src/components/dashboard/settings/SettingsPage.tsx`:
  - [ ] Converter `loadUserData` para useCallback
- [ ] `src/hooks/useDashboardStats.ts`:
  - [ ] Converter `fetchStats` para useCallback
- [ ] `src/hooks/useJobsData.ts`:
  - [ ] Converter `fetchJobs` para useCallback
- [ ] Executar `npm run lint` para validar correções

#### ✅ Limpeza de Código Morto
- [ ] Remover arquivo `src/utils/apiSecurity.ts`:
  - [ ] Confirmar que não há imports
  - [ ] Deletar arquivo completamente
- [ ] Limpar `src/utils/config.ts`:
  - [ ] Remover função `reloadConfig` (não exportada/usada)
  - [ ] Remover função `validateConfig` (deprecated)
- [ ] Limpar `src/integrations/supabase/types.ts`:
  - [ ] Remover export `Tables`
  - [ ] Remover export `TablesInsert`
  - [ ] Remover export `TablesUpdate`
  - [ ] Remover export `Enums`
  - [ ] Remover export `CompositeTypes`
  - [ ] Remover const `Constants`
- [ ] Limpar `src/types/company.ts`:
  - [ ] Remover interface `Company` (não exportada)
  - [ ] Remover interface `InterviewReport`
  - [ ] Remover interface `Plan`
  - [ ] Remover interface `Subscription`
  - [ ] Remover interface `UsageTracking`
- [ ] Remover variável não usada em `JobCard.tsx`:
  - [ ] Remover `const navigate = useNavigate();`
- [ ] Executar `npm run lint` para confirmar limpeza

#### ✅ Validação Final Alta Prioridade
- [ ] `npm run lint` retorna 0 errors e 0 warnings
- [ ] `npm run build` executa com sucesso
- [ ] `tsc --noEmit` executa sem erros
- [ ] Todas as páginas carregam corretamente
- [ ] Loading states funcionam
- [ ] Não há console errors no browser

### 🟡 Média Prioridade (Semana 3-4)

#### ✅ Error Boundary Global
- [ ] Criar `src/components/ErrorBoundary.tsx`:
  - [ ] Implementar class component
  - [ ] Adicionar fallback UI elegante
  - [ ] Adicionar logging de erros
  - [ ] Suporte a dark mode
- [ ] Criar `src/hooks/useErrorHandler.ts`:
  - [ ] Hook para tratamento consistente
  - [ ] Integração com Error Boundary
- [ ] Envolver App com ErrorBoundary em `main.tsx`
- [ ] Testar com erros simulados

#### ✅ Custom Hook para Data Fetching  
- [ ] Criar `src/hooks/useApiCall.ts`:
  - [ ] Interface `UseApiCallOptions<T>`
  - [ ] Estados loading, error, data
  - [ ] Suporte a retry
  - [ ] Callbacks onSuccess/onError
- [ ] Refatorar hooks existentes:
  - [ ] `useJobsData.ts`
  - [ ] `useDashboardStats.ts`
  - [ ] `useAuth.ts` (parcialmente)
- [ ] Refatorar componentes para usar novo hook:
  - [ ] `CandidateProfilePage.tsx`
  - [ ] `JobDetailsPage.tsx`
  - [ ] `ReportsPage.tsx`

#### ✅ Loading State Hook
- [ ] Criar `src/hooks/useLoadingState.ts`:
  - [ ] Estados múltiplos de loading
  - [ ] Helpers para start/stop
  - [ ] Integração com useApiCall
- [ ] Migrar componentes para novo hook
- [ ] Padronizar UX de loading

#### ✅ Interfaces para API Responses
- [ ] Criar `src/types/api.ts`:
  - [ ] `SupabaseResponse<T>` interface
  - [ ] `EdgeFunctionResponse<T>` interface
  - [ ] `PaginatedResponse<T>` interface
- [ ] Tipar respostas do Supabase
- [ ] Tipar respostas das Edge Functions
- [ ] Atualizar hooks com tipos corretos

### 🟢 Baixa Prioridade (Semana 5-8)

#### ✅ Decomposição de Componentes
- [ ] `CandidateProfilePage.tsx` (400+ linhas):
  - [ ] Extrair `CandidateInfo` component
  - [ ] Extrair `InterviewSection` component
  - [ ] Extrair `CustomAnswers` component
- [ ] `JobDetailsPage.tsx` (200+ linhas):
  - [ ] Extrair `JobInfo` component
  - [ ] Extrair `CandidatesList` component
- [ ] `Button.tsx` (muitas props):
  - [ ] Considerar compound component pattern
  - [ ] Separar variants em components

#### ✅ Design Tokens
- [ ] Criar `src/styles/design-tokens.css`:
  - [ ] Cores do Triagen
  - [ ] Spacing system
  - [ ] Typography scale
  - [ ] Shadow system
- [ ] Atualizar `tailwind.config.js`:
  - [ ] Usar tokens como CSS variables
  - [ ] Manter compatibilidade
- [ ] Migrar componentes gradualmente

#### ✅ Code Splitting
- [ ] Implementar lazy loading:
  - [ ] Rota `/dashboard`
  - [ ] Rota `/interview`
  - [ ] Componentes pesados (Reports, Settings)
- [ ] Usar `React.lazy()` e `Suspense`
- [ ] Configurar preloading para rotas críticas
- [ ] Medir impacto no bundle size

#### ✅ Performance e Bundle
- [ ] Configurar `rollup-plugin-visualizer`
- [ ] Analisar bundle atual
- [ ] Implementar tree shaking
- [ ] Otimizar imports (barrel exports)
- [ ] Considerar dynamic imports para libs

---

## 📋 Checklist de Validação por Sprint

### Sprint 1 - Fundação
- [ ] 0 ESLint errors
- [ ] 0 TypeScript any types  
- [ ] 1 LoadingSpinner component reutilizável
- [ ] Código morto removido

### Sprint 2 - Robustez
- [ ] Error Boundary implementado
- [ ] Custom hooks para data fetching
- [ ] Loading states padronizados
- [ ] API responses tipadas

### Sprint 3 - Otimização
- [ ] Componentes decompostos
- [ ] Design tokens básicos
- [ ] Code splitting implementado
- [ ] Bundle size otimizado

### Sprint 4 - Consolidação
- [ ] Documentation atualizada
- [ ] Testes implementados
- [ ] Performance benchmarks
- [ ] Code review completo

---

## 🎯 Métricas de Sucesso

### Qualidade de Código
- **Antes**: 42 ESLint issues → **Meta**: 0 issues
- **Antes**: 16+ any types → **Meta**: 0 any types
- **Antes**: 11+ loading duplicados → **Meta**: 1 component

### Performance
- **Bundle Size**: Redução de 10-15%
- **Loading Time**: Melhoria de 20%+ com code splitting
- **Type Safety**: 100% coverage

### Developer Experience  
- **Build Time**: Manter ou melhorar
- **Hot Reload**: Manter funcionalidade
- **IDE Support**: Melhor autocomplete com types

---

## 🚨 Riscos e Mitigações

### Riscos Identificados
1. **Breaking Changes**: Mudanças de tipos podem quebrar builds
2. **Performance**: Refatoração pode introduzir regressions
3. **Timeline**: Subestimar esforço de testing

### Mitigações
1. **Testes Incrementais**: Validar cada mudança isoladamente
2. **Backup**: Branches separados para cada feature
3. **Rollback Plan**: Manter versão funcional sempre disponível

---

*Checklist criado em: Dezembro 2024*
*Última atualização: Análise inicial completa*