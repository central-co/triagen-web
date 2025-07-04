import { getConfig } from '../../utils/config';

export interface AuthResponse {
  token: string;
}

export async function startInterview(authToken: string): Promise<string> {
  const config = await getConfig();
  const response = await fetch(`${config.apiUrl}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interview_code: authToken }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Código inválido ou entrevista não disponível');
  }

  const data: AuthResponse = await response.json();
  return data.token;
}