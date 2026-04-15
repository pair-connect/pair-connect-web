export interface SignupInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export const validateSignupInput = (input: unknown): { value?: SignupInput; error?: string } => {
  if (!input || typeof input !== 'object') {
    return { error: 'Todos los campos son requeridos' };
  }

  const data = input as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name : '';
  const username = typeof data.username === 'string' ? data.username : '';
  const email = typeof data.email === 'string' ? data.email : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!name || !username || !email || !password) {
    return { error: 'Todos los campos son requeridos' };
  }

  return { value: { name, username, email, password } };
};
