/**
 * POST /api/auth/register
 * Crée un compte et ouvre la session.
 *
 * Body : { name, email, password }
 * Réponse 201 : { accessToken, user: { id, name, email, role } }
 * Réponse 409 : email déjà utilisé
 * Réponse 422 : payload invalide
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(422).json({ message: 'email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res
        .status(422)
        .json({ message: 'password must be at least 8 characters' });
    }

    // ────────────────────────────────────────────────────────────────────
    // TODO : branchez ici votre vraie logique métier (base de données,
    // hash du mot de passe, génération du token JWT, etc.).
    // Ci-dessous un placeholder qui illustre la forme de la réponse.
    // ────────────────────────────────────────────────────────────────────
    const user = {
      id: `user_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role: 'user',
    };
    const accessToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return res.status(201).json({ accessToken, user });
  },
  { methods: 'POST,OPTIONS' },
);
