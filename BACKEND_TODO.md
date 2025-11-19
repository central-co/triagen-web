# 🔧 Backend Implementation TODO

## ✅ O Backend JÁ ESTÁ 95% COMPLETO!

A maior parte do backend **já está implementada**. Falta apenas **1 endpoint
crítico** e **1 ajuste pequeno**.

---

## ❌ FALTA IMPLEMENTAR (Apenas 2 coisas!)

### 🔴 CRÍTICO #1: GET /api/application/:shortCode

**Por que precisa:** O frontend recebe `https://triagen.app/interview/Kb04VBy`
no email, mas não tem como buscar o candidato pelo código.

**Status:** ❌ Não existe

**Implementação (5 minutos):**

````typescript
**Implementação (5 minutos):**

```typescript
// src/presentation/application/application.controller.ts
@Get(':shortCode')
async getByCode(@Param('shortCode') shortCode: string) {
    return await this.applicationService.getByCode(shortCode);
}
````

```typescript
// src/presentation/application/application.service.ts
async getByCode(shortCode: string) {
    const app = await this.createApplicationUseCase.findByToken(shortCode);
    if (!app) {
        throw new NotFoundException('Application not found');
    }
    return {
        id: app.id,
        candidate_id: app.id,
        name: app.name,
        email: app.email,
        job_id: app.job_id,
    };
}
```

```typescript
// src/application/usecases/application/create-application.usecase.ts
async findByToken(token: string) {
    return await this.applicationRepo.findByInterviewToken(token);
}
```

**Teste:**

```bash
curl http://localhost:3000/api/application/Kb04VBy
```

**Response esperado:**

```json
{
    "id": "86a035e1-58bf-4831-95b0-7014463cdb98",
    "candidate_id": "86a035e1-58bf-4831-95b0-7014463cdb98",
    "name": "Felipe Gameleira",
    "email": "gameleirafelipe@gmail.com",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc"
}
```

---

### 🟡 ALTA #2: Ajustar POST /api/application/create Response

**Por que precisa:** Frontend precisa do `candidate_id` após criar a aplicação,
mas hoje retorna apenas `string`.

**Status atual:**

```typescript
@Post('create')
async createApplication(@Body() dto: CreateApplicationDto): Promise<string> {
    return await this.applicationService.createApplication(dto);
}
```

**Deveria retornar:**

```typescript
{
  candidate_id: "86a035e1-...",
  short_code: "Kb04VBy",
  email: "gameleirafelipe@gmail.com"
}
```

**Ajuste no Service (3 minutos):**

```typescript
// src/presentation/application/application.service.ts
async createApplication(dto: CreateApplicationDto): Promise<{
    candidate_id: string;
    short_code: string;
    email: string;
}> {
    const result = await this.createApplicationUseCase.execute(dto);

    await this.sendEmailUseCase.execute({
        to: dto.email,
        subject: 'Sua inscrição na vaga está confirmada!',
        body: `Link: ${this.configService.get('APP_URL')}/interview/${result.shortCode}`,
    });

    return {
        candidate_id: result.candidateId,
        short_code: result.shortCode,
        email: dto.email,
    };
}
```

```typescript
// src/application/usecases/application/create-application.usecase.ts
async execute(dto: CreateApplicationDto): Promise<{
    candidateId: string;
    shortCode: string;
}> {
    const shortCode = this.generateShortCode();
    const candidate = await this.applicationRepo.save(shortCode, { id: dto.job_id }, {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        resume: dto.resume_text,
    });

    return {
        candidateId: candidate.id,
        shortCode,
    };
}
```

---

## ✅ O Que JÁ ESTÁ IMPLEMENTADO (Não precisa fazer nada!)

### Interview Endpoints (Todos prontos!)

```typescript
// src/presentation/interview/interview.controller.ts

✅ POST /api/interviews/plan/:candidateId
✅ POST /api/interviews/start/:candidateId
✅ GET /api/interviews/:candidateId/report
✅ POST /api/interviews/finish
```

### Services & Use Cases (Todos prontos!)

```typescript
✅ InterviewService.planInterview()
✅ InterviewService.startSession()
✅ InterviewService.getReport()
✅ InterviewService.finishAndAnalyze()

✅ PlanInterviewUseCase
✅ StartInterviewSessionUseCase
✅ AnalyzeInterviewUseCase
```

### Providers (Todos prontos!)

```typescript
✅ GeminiLLMProvider (com planner.prompt.yml e analyzer.prompt.yml)
✅ LiveKitRoomProvider
✅ JwtTokenProvider
```

### Configurações (Tudo OK!)

```typescript
✅ CORS configurado para http://localhost:8080
✅ Campo interview_token no banco
✅ Repository com findByInterviewToken()
```

---

## 📋 Checklist Final (8 minutos!)

- [ ] **Implementar GET /api/application/:shortCode** (5 min)
  - [ ] Adicionar método no controller
  - [ ] Adicionar método no service
  - [ ] Adicionar findByToken no use case
  - [ ] Testar com curl

- [ ] **Ajustar response do POST create** (3 min)
  - [ ] Mudar tipo de retorno no controller
  - [ ] Ajustar service para retornar objeto
  - [ ] Ajustar use case se necessário
  - [ ] Testar com curl

---

## 🧪 Testes Rápidos

### Teste 1: Buscar candidato (APÓS IMPLEMENTAR)

```bash
curl http://localhost:3000/api/application/Kb04VBy
```

### Teste 2: Criar candidatura (JÁ FUNCIONA)

```bash
curl -X POST http://localhost:3000/api/application/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc",
    "phone": "21999999999",
    "resume_text": "Experiência em React"
  }'
```

### Teste 3: Endpoints de interview (JÁ FUNCIONAM)

```bash
# Planejar
curl -X POST http://localhost:3000/api/interviews/plan/86a035e1-58bf-4831-95b0-7014463cdb98

# Iniciar
curl -X POST http://localhost:3000/api/interviews/start/86a035e1-58bf-4831-95b0-7014463cdb98

# Relatório
curl http://localhost:3000/api/interviews/86a035e1-58bf-4831-95b0-7014463cdb98/report
```

---

## 🎯 Resumo

| Item                            | Status          | Tempo |
| ------------------------------- | --------------- | ----- |
| GET /api/application/:shortCode | ❌ Falta        | 5 min |
| Ajustar POST create response    | ❌ Falta        | 3 min |
| **Todos os outros endpoints**   | ✅ **Prontos!** | 0 min |

**Total para completar:** ~8 minutos de código! 🚀

````
```typescript
// src/presentation/application/application.service.ts
async getApplicationByCode(shortCode: string) {
    const application = await this.applicationRepo.findByInterviewToken(shortCode);

    if (!application) {
        throw new NotFoundException('Application not found');
    }

    return {
        id: application.id,
        candidate_id: application.id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        job_id: application.job_id,
        job: {
            id: application.jobs.id,
            title: application.jobs.title,
            description: application.jobs.description,
        },
    };
}
````

### Response Esperado pelo Frontend:

```typescript
{
    id: string;
    candidate_id: string;
    name: string;
    email: string;
    job_id: string;
}
```

---

## 2. Ajustar: POST /api/application/create

**Prioridade: 🟡 ALTA** - Melhora UX mas não bloqueia

### Status Atual:

```typescript
// Retorna apenas string
return "Kb04VBy";
```

### Deveria Retornar:

```typescript
{
  candidate_id: "86a035e1-58bf-4831-95b0-7014463cdb98",
  short_code: "Kb04VBy",
  email: "gameleirafelipe@gmail.com"
}
```

### Ajuste no Service:

```typescript
// src/presentation/application/application.service.ts
async createApplication(dto: CreateApplicationDto): Promise<{
    candidate_id: string;
    short_code: string;
    email: string;
}> {
    const result = await this.createApplicationUseCase.execute(dto);

    await this.sendEmailUseCase.execute({
        to: dto.email,
        subject: 'Sua inscrição na vaga está confirmada!',
        body: `Olá!\n\nQuando estiver pronto, inicie sua entrevista pelo link abaixo:\n${this.configService.get<string>('APP_URL')}/interview/${result.shortCode}\n\nCódigo: ${result.shortCode}\n\nBoa sorte!\nTriaGen`,
    });

    return {
        candidate_id: result.candidateId,
        short_code: result.shortCode,
        email: dto.email,
    };
}
```

---

## 3. Endpoints de Interview

**Prioridade: 🔴 CRÍTICA** - Bloqueia fluxo completo

### 3.1 POST /api/interviews/plan/:candidateId

```typescript
// src/presentation/interview/interview.controller.ts
@Post('plan/:candidateId')
async planInterview(@Param('candidateId') candidateId: string) {
    return await this.interviewService.planInterview(candidateId);
}
```

**Response Esperado:**

```typescript
{
    planId: string;
    status: "ready" | "processing";
}
```

---

### 3.2 POST /api/interviews/start/:candidateId

**⚠️ Mudar de Body para Path Param**

**Atual:**

```typescript
@Post('start')
async startInterview(@Body() dto: StartInterviewDto) { ... }
```

**Deveria ser:**

```typescript
@Post('start/:candidateId')
async startSession(@Param('candidateId') candidateId: string) {
    return await this.interviewService.startSession(candidateId);
}
```

**Response Esperado:**

```typescript
{
    token: string; // JWT para LiveKit
    roomName: string; // Nome da sala LiveKit
    sessionId: string; // ID da sessão
}
```

---

### 3.3 GET /api/interviews/:candidateId/report

```typescript
@Get(':candidateId/report')
async getReport(@Param('candidateId') candidateId: string) {
    return await this.interviewService.getReport(candidateId);
}
```

**Response Esperado:**

**Quando não existe (404):**

```typescript
{
    status: "not_found";
}
```

**Quando está processando:**

```typescript
{
    status: "processing";
}
```

**Quando completo:**

```typescript
{
  status: "completed",
  overallScore: 8.5,
  criteriaScores: {
    "React": { score: 9, justification: "..." },
    "Git": { score: 8, justification: "..." }
  },
  category_scores: {
    "technical": 8.5,
    "communication": 7.5
  },
  summary: "Candidato demonstrou...",
  strengths: ["Forte em React", "Boa comunicação"],
  weaknesses: ["Pouca experiência com testes"],
  recommendation: "approve" | "reject" | "technical_test",
  alignment_analysis: "O candidato está alinhado..."
}
```

---

## 4. Service Implementation

### InterviewService

```typescript
// src/presentation/interview/interview.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PlanInterviewUseCase } from "@application/usecases/interview/plan-interview.usecase";
import { StartInterviewSessionUseCase } from "@application/usecases/interview/start-interview-session.usecase";
import { GetInterviewReportUseCase } from "@application/usecases/interview/get-interview-report.usecase";

@Injectable()
export class InterviewService {
    constructor(
        private readonly planUseCase: PlanInterviewUseCase,
        private readonly startSessionUseCase: StartInterviewSessionUseCase,
        private readonly getReportUseCase: GetInterviewReportUseCase,
    ) {}

    async planInterview(candidateId: string) {
        const plan = await this.planUseCase.execute(candidateId);
        return { planId: plan.id, status: "ready" };
    }

    async startSession(candidateId: string) {
        const session = await this.startSessionUseCase.execute(candidateId);
        return {
            token: session.token,
            roomName: session.roomName,
            sessionId: session.sessionId,
        };
    }

    async getReport(candidateId: string) {
        try {
            const report = await this.getReportUseCase.execute(candidateId);

            if (!report) {
                return { status: "not_found" };
            }

            // Check if still processing
            if (!report.overallScore && !report.summary) {
                return { status: "processing" };
            }

            return {
                status: "completed",
                ...report,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return { status: "not_found" };
            }
            throw error;
        }
    }
}
```

---

## 5. Module Configuration

### InterviewModule

```typescript
// src/presentation/interview/interview.module.ts
import { Module } from "@nestjs/common";
import { InterviewController } from "./interview.controller";
import { InterviewService } from "./interview.service";
import { PlanInterviewUseCase } from "@application/usecases/interview/plan-interview.usecase";
import { StartInterviewSessionUseCase } from "@application/usecases/interview/start-interview-session.usecase";
import { GetInterviewReportUseCase } from "@application/usecases/interview/get-interview-report.usecase";

@Module({
    controllers: [InterviewController],
    providers: [
        InterviewService,
        PlanInterviewUseCase,
        StartInterviewSessionUseCase,
        GetInterviewReportUseCase,
        // Add repository providers
    ],
})
export class InterviewModule {}
```

---

## 📋 Checklist de Implementação

### Fase 1: Fluxo de Candidatura (1-2 horas)

- [ ] Implementar `GET /api/application/:shortCode`
- [ ] Ajustar response do `POST /api/application/create`
- [ ] Testar fluxo completo de candidatura

### Fase 2: Fluxo de Entrevista (3-4 horas)

- [ ] Implementar `POST /api/interviews/plan/:candidateId`
- [ ] Ajustar `POST /api/interviews/start/:candidateId` (path param)
- [ ] Implementar `GET /api/interviews/:candidateId/report`
- [ ] Configurar InterviewModule com DI
- [ ] Testar fluxo completo de entrevista

### Fase 3: Integração Worker (variável)

- [ ] Webhook para receber transcrições do worker
- [ ] Processar análise do worker
- [ ] Salvar relatório no banco

---

## 🧪 Como Testar

### 1. Testar GET /api/application/:shortCode

```bash
curl http://localhost:3000/api/application/Kb04VBy
```

**Deve retornar:**

```json
{
    "id": "86a035e1-58bf-4831-95b0-7014463cdb98",
    "candidate_id": "86a035e1-58bf-4831-95b0-7014463cdb98",
    "name": "Felipe Gameleira",
    "email": "gameleirafelipe@gmail.com",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc"
}
```

### 2. Testar POST /api/application/create

```bash
curl -X POST http://localhost:3000/api/application/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "job_id": "83b548a4-53b7-4673-899e-23c5c9570bdc",
    "phone": "21999999999",
    "resume_text": "Experiência em React"
  }'
```

**Deve retornar:**

```json
{
    "candidate_id": "uuid-aqui",
    "short_code": "ABC123",
    "email": "teste@example.com"
}
```

### 3. Testar Endpoints de Interview

```bash
# Planejar entrevista
curl -X POST http://localhost:3000/api/interviews/plan/86a035e1-58bf-4831-95b0-7014463cdb98

# Iniciar sessão
curl -X POST http://localhost:3000/api/interviews/start/86a035e1-58bf-4831-95b0-7014463cdb98

# Buscar relatório
curl http://localhost:3000/api/interviews/86a035e1-58bf-4831-95b0-7014463cdb98/report
```

---

## 📞 Perguntas Pendentes

1. **Autenticação**: Os endpoints de interview precisam de autenticação?
2. **Rate Limiting**: Precisa implementar rate limiting?
3. **Webhook**: Como o worker vai notificar quando a transcrição estiver pronta?
4. **LiveKit**: A configuração do LiveKit já está no ConfigService?

---

## 🎯 Prioridade de Implementação

1. 🔴 **CRÍTICO - Implementar primeiro**
   - GET /api/application/:shortCode
   - POST /api/interviews/start/:candidateId

2. 🟡 **IMPORTANTE - Implementar em seguida**
   - Ajustar response do POST create
   - POST /api/interviews/plan/:candidateId
   - GET /api/interviews/:candidateId/report

3. 🟢 **NICE TO HAVE - Pode deixar para depois**
   - Webhook de transcrição
   - Rate limiting
   - Métricas e logging
