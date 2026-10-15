/**
 * POST /api/auth/login
 * Vérifie les identifiants et ouvre la session.
 *
 * Body : { email, password }
 * Réponse 200 : { accessToken, user: { id, name, email, role } }
 * Réponse 401 : identifiants invalides
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // TODO : vérifiez l'utilisateur en base, hashez le mot de passe, etc.
    const user = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'user',
    };
    const accessToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return res.status(200).json({ accessToken, user });
  },
  { methods: 'POST,OPTIONS' },
);
