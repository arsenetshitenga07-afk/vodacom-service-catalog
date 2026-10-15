/**
 * POST /api/auth/verify-code
 * Vérifie le code reçu par e-mail et ouvre la session.
 *
 * Body : { email, code }
 * Réponse 200 : { accessToken, user: { id, name, email, role } }
 * Réponse 401 : code incorrect
 * Réponse 410 : code expiré
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(422).json({ message: 'email and code are required' });
    }
    // TODO : vérifiez le code, chargez l'utilisateur, renvoyez un token.
    const user = {
      id: 'user_demo',
      name: email.split('@')[0],
      email,
      role: 'user',
    };
    const accessToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return res.status(200).json({ accessToken, user });
  },
  { methods: 'POST,OPTIONS' },
);
