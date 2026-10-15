/**
 * POST /api/auth/reset-password
 * Valide le code et enregistre le nouveau mot de passe.
 *
 * Body : { email, code, newPassword }
 * Réponse 204 : mot de passe mis à jour
 * Réponse 401 : code incorrect
 * Réponse 410 : code expiré
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
      return res
        .status(422)
        .json({ message: 'email, code and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res
        .status(422)
        .json({ message: 'newPassword must be at least 8 characters' });
    }
    // TODO : vérifiez le code, hashez le mot de passe, mettez à jour l'utilisateur.
    return res.status(204).end();
  },
  { methods: 'POST,OPTIONS' },
);
