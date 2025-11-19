# 🔧 URGENTE: Mover Geração de Plano para o Momento da Candidatura

## 🎯 Problema Atual

O plano de entrevista está sendo gerado **no momento errado**:

❌ **Atual:** Plano é gerado quando candidato clica em "Iniciar Entrevista"

- Causa **Rate Limit 429** errors (15 req/min no Gemini free tier)
- Candidato **espera** enquanto o plano é gerado
- **Desperdiça** chamadas de API em testes repetidos
- **Ruim para UX** - demora para começar a entrevista

✅ **Correto:** Plano deve ser gerado **ao enviar candidatura**

- Gerado **1 única vez** por candidato
- Candidato **não espera** na hora da entrevista
- **Melhor UX** - entrevista começa instantaneamente
- **Evita rate limits** - só gera quando necessário

---

## 📋 Checklist de Implementação

### ✅ Etapa 1: Adicionar Cache no PlanInterviewUseCase (5 min)

**Arquivo:** `src/application/usecases/interview/plan-interview.usecase.ts`

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { CandidateRepository } from "@domain/repositories/candidate.repository";
import { InterviewPlanRepository } from "@domain/repositories/interview-plan.repository";
import { GeminiLLMProvider } from "@infrastructure/providers/gemini.provider";

@Injectable()
export class PlanInterviewUseCase {
    constructor(
        private readonly candidateRepo: CandidateRepository,
        private readonly interviewPlanRepo: InterviewPlanRepository,
        private readonly geminiProvider: GeminiLLMProvider,
    ) {}

    async execute(candidateId: string): Promise<string> {
        // ✅ 1. Verificar se já existe plano (CACHE)
        const existingPlan = await this.interviewPlanRepo.findByCandidateId(
            candidateId,
        );

        if (existingPlan) {
            console.log(
                `✅ Plan already exists for candidate ${candidateId}:`,
                existingPlan.id,
            );
            return existingPlan.id;
        }

        // ✅ 2. Buscar candidato e vaga
        const candidate = await this.candidateRepo.findById(candidateId);
        if (!candidate) {
            throw new NotFoundException(`Candidate not found: ${candidateId}`);
        }

        if (!candidate.jobs) {
            throw new NotFoundException(
                `Job not found for candidate: ${candidateId}`,
            );
        }

        // ✅ 3. Gerar novo plano apenas se não existir
        console.log(
            `🔄 Generating new interview plan for candidate ${candidateId}...`,
        );

        try {
            const plan = await this.geminiProvider.generateInterviewPlan(
                candidate.name,
                candidate.resume_text || "",
                candidate.jobs.title,
                candidate.jobs.description,
                candidate.jobs.requirements || [],
            );

            // ✅ 4. Salvar no banco
            const savedPlan = await this.interviewPlanRepo.save({
                candidateId,
                questions: plan.questions,
                criteria: plan.criteria,
                createdAt: new Date(),
            });

            console.log(`✅ Plan generated successfully:`, savedPlan.id);
            return savedPlan.id;
        } catch (error) {
            // ✅ 5. Tratar erro de rate limit especificamente
            if (error.status === 429) {
                console.error(
                    "⚠️ Rate limit exceeded - plan will be generated later",
                );
                throw new Error(
                    "Rate limit exceeded. The interview plan will be generated when the candidate starts the interview.",
                );
            }

            console.error("❌ Error generating plan:", error);
            throw error;
        }
    }
}
```

**Verificar se o Repository tem o método:**

```typescript
// src/domain/repositories/interview-plan.repository.ts
export interface InterviewPlanRepository {
    save(data: CreateInterviewPlanDto): Promise<InterviewPlan>;
    findById(id: string): Promise<InterviewPlan | null>;
    findByCandidateId(candidateId: string): Promise<InterviewPlan | null>; // ✅ Este método
}
```

Se não tiver, adicionar na implementação:

```typescript
// src/infrastructure/repositories/interview-plan.repository.ts
async findByCandidateId(candidateId: string): Promise<InterviewPlan | null> {
    return await this.prisma.interviewPlans.findFirst({
        where: { candidateId },
        orderBy: { createdAt: 'desc' }, // Pega o mais recente
    });
}
```

---

### ✅ Etapa 2: Gerar Plano ao Criar Candidatura (10 min)

**Arquivo:** `src/presentation/application/application.service.ts`

**Adicionar injeção de dependência:**

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateApplicationUseCase } from "@application/usecases/application/create-application.usecase";
import { SendEmailUseCase } from "@application/usecases/email/send-email.usecase";
import { PlanInterviewUseCase } from "@application/usecases/interview/plan-interview.usecase"; // ✅ Adicionar

@Injectable()
export class ApplicationService {
    constructor(
        private readonly createApplicationUseCase: CreateApplicationUseCase,
        private readonly sendEmailUseCase: SendEmailUseCase,
        private readonly planInterviewUseCase: PlanInterviewUseCase, // ✅ Adicionar
        private readonly configService: ConfigService,
    ) {}

    async createApplication(dto: CreateApplicationDto): Promise<{
        candidate_id: string;
        short_code: string;
        email: string;
    }> {
        // 1. Criar candidato
        const result = await this.createApplicationUseCase.execute(dto);

        // 2. ✅ GERAR PLANO IMEDIATAMENTE (NOVO!)
        console.log(
            `🎯 Generating interview plan for candidate ${result.candidateId}...`,
        );

        try {
            const planId = await this.planInterviewUseCase.execute(
                result.candidateId,
            );
            console.log(`✅ Interview plan generated: ${planId}`);
        } catch (error) {
            // ⚠️ NÃO bloqueia a candidatura se falhar
            // O plano pode ser gerado depois quando o candidato iniciar a entrevista
            console.error(
                "⚠️ Error generating plan (non-blocking):",
                error.message,
            );

            // Log para monitoramento
            if (error.message?.includes("Rate limit")) {
                console.warn(
                    "⚠️ Rate limit hit during application creation - plan will be generated on interview start",
                );
            }
        }

        // 3. Enviar email
        const appUrl = this.configService.get<string>("APP_URL") ||
            "http://localhost:8080";
        await this.sendEmailUseCase.execute({
            to: dto.email,
            subject: "🎉 Candidatura Confirmada - Triagen",
            body:
                `Olá ${dto.name}!\n\nSua candidatura foi recebida com sucesso! 🚀\n\nEstamos preparando sua entrevista personalizada com IA.\n\nQuando estiver pronto, inicie sua entrevista pelo link:\n${appUrl}/interview/${result.shortCode}\n\nOu use o código: ${result.shortCode}\n\nBoa sorte!\n\n---\nEquipe Triagen`,
        });

        return {
            candidate_id: result.candidateId,
            short_code: result.shortCode,
            email: dto.email,
        };
    }

    // ... resto dos métodos
}
```

---

### ✅ Etapa 3: Atualizar ApplicationModule (2 min)

**Arquivo:** `src/presentation/application/application.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";
import { CreateApplicationUseCase } from "@application/usecases/application/create-application.usecase";
import { SendEmailUseCase } from "@application/usecases/email/send-email.usecase";
import { PlanInterviewUseCase } from "@application/usecases/interview/plan-interview.usecase"; // ✅ Adicionar

// ... outros imports

@Module({
    controllers: [ApplicationController],
    providers: [
        ApplicationService,
        CreateApplicationUseCase,
        SendEmailUseCase,
        PlanInterviewUseCase, // ✅ Adicionar
        // ... outros providers
    ],
})
export class ApplicationModule {}
```

---

### ✅ Etapa 4: Ajustar Endpoint de Interview Plan (Opcional)

**Arquivo:** `src/presentation/interview/interview.controller.ts`

Manter o endpoint, mas agora ele será usado apenas como **fallback**:

```typescript
@Post('plan/:candidateId')
async planInterview(@Param('candidateId') candidateId: string) {
    // Agora com cache, só gera se não existir
    console.log(`📋 Planning interview for candidate: ${candidateId}`);
    return await this.interviewService.planInterview(candidateId);
}
```

---

## 🧪 Como Testar

### Teste 1: Criar Nova Candidatura

```bash
curl -X POST http://localhost:3000/api/application/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "21999999999",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc",
    "resume_text": "Desenvolvedor com 5 anos de experiência em React"
  }'
```

**Esperado no console:**

```
🎯 Generating interview plan for candidate 976b4c2e-...
🔄 Generating new interview plan for candidate 976b4c2e-...
✅ Plan generated successfully: plan-id-123
```

**Response:**

```json
{
    "candidate_id": "976b4c2e-b7aa-4fe3-a9ec-ae44f277065b",
    "short_code": "ABC123",
    "email": "joao@example.com"
}
```

### Teste 2: Buscar Candidato (Frontend usa isso)

```bash
curl http://localhost:3000/api/application/ABC123
```

**Response:**

```json
{
    "id": "976b4c2e-b7aa-4fe3-a9ec-ae44f277065b",
    "candidate_id": "976b4c2e-b7aa-4fe3-a9ec-ae44f277065b",
    "name": "João Silva",
    "email": "joao@example.com",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc"
}
```

### Teste 3: Verificar se Plano Existe (Não gera de novo)

```bash
curl -X POST http://localhost:3000/api/interviews/plan/976b4c2e-b7aa-4fe3-a9ec-ae44f277065b
```

**Esperado no console:**

```
✅ Plan already exists for candidate 976b4c2e-...: plan-id-123
```

**Response:**

```json
{
    "planId": "plan-id-123",
    "status": "ready"
}
```

---

## 🔍 Verificação no Banco

Após criar candidatura, verificar no Supabase:

```sql
-- Verificar candidato criado
SELECT id, name, email, interview_token, created_at
FROM candidates
WHERE email = 'joao@example.com';

-- Verificar plano gerado
SELECT id, candidate_id, questions, criteria, created_at
FROM interview_plans
WHERE candidate_id = '976b4c2e-b7aa-4fe3-a9ec-ae44f277065b';
```

---

## 📊 Fluxo Completo (Depois da Implementação)

### 1. Candidatura (Backend)

```
POST /api/application/create
  ↓
Cria candidato no banco
  ↓
✅ GERA PLANO imediatamente (NOVO!)
  ↓
Envia email com link
  ↓
Retorna { candidate_id, short_code, email }
```

### 2. Entrevista (Frontend + Backend)

```
Candidato clica no link
  ↓
GET /api/application/:shortCode (busca candidato)
  ↓
✅ Plano JÁ EXISTE (gerado na candidatura)
  ↓
POST /api/interviews/start/:candidateId (inicia LiveKit)
  ↓
Entrevista acontece IMEDIATAMENTE (sem espera!)
```

---

## ⚠️ Tratamento de Erros

### Caso 1: Rate Limit ao Criar Candidatura

Se acontecer rate limit na criação:

- ✅ **Candidatura é criada** normalmente
- ⚠️ Plano **não** é gerado (logged)
- ✅ Email é enviado
- 🔄 Plano será gerado quando candidato **iniciar entrevista** (fallback)

### Caso 2: Rate Limit ao Iniciar Entrevista

Se não tem plano e dá rate limit:

- ❌ Frontend mostra: "Muitas tentativas. Aguarde 1 minuto e tente novamente."
- 🔄 Candidato pode tentar de novo em 1 minuto

---

## ✅ Checklist Final

- [ ] Adicionar cache no `PlanInterviewUseCase`
- [ ] Adicionar `findByCandidateId` no `InterviewPlanRepository` (se não
      existir)
- [ ] Injetar `PlanInterviewUseCase` no `ApplicationService`
- [ ] Chamar `planInterview()` após criar candidato
- [ ] Adicionar logs apropriados
- [ ] Adicionar `PlanInterviewUseCase` no `ApplicationModule`
- [ ] Testar criando nova candidatura
- [ ] Verificar no console se plano foi gerado
- [ ] Verificar no banco se plano foi salvo
- [ ] Testar iniciar entrevista (deve ser RÁPIDO)
- [ ] Testar criar 2 candidaturas seguidas (não deve dar rate limit)

---

## 🎯 Resultado Esperado

✅ **Candidaturas são criadas rapidamente** (1 por vez) ✅ **Planos são gerados
1x por candidato** (cache) ✅ **Entrevista inicia INSTANTANEAMENTE** (plano já
existe) ✅ **Sem mais rate limit 429** (muito menos chamadas) ✅ **Melhor
experiência** para o candidato

---

## 📞 Dúvidas?

Se encontrar algum problema:

1. Verificar logs do console (`console.log` adicionados)
2. Verificar tabela `interview_plans` no banco
3. Verificar se `InterviewPlanRepository.findByCandidateId` existe
4. Verificar se `PlanInterviewUseCase` está no module

---

**Tempo estimado:** ~15-20 minutos **Prioridade:** 🔴 **CRÍTICA** - Resolve rate
limit e melhora UX significativamente
