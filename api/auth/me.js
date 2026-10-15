/**
 * GET /api/auth/me
 * Profil de l'utilisateur courant (lit le token dans Authorization).
 *
 * Header : Authorization: Bearer <accessToken>
 * Réponse 200 : { id, name, email, role }
 * Réponse 401 : token manquant, expiré ou invalide
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }
    // TODO : décodez le token JWT, chargez l'utilisateur en base.
    return res.status(200).json({
      id: 'user_demo',
      name: 'Demo User',
      email: 'demo@vodacom.cd',
      role: 'admin',
    });
  },
  { methods: 'GET,OPTIONS' },
);
