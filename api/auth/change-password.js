/**
 * POST /api/auth/change-password
 * Modifie le mot de passe de l'utilisateur connecté.
 *
 * Header : Authorization: Bearer <accessToken>
 * Body : { currentPassword, newPassword }
 * Réponse 204 : OK
 * Réponse 401 : mot de passe actuel incorrect
 * Réponse 422 : nouveau mot de passe invalide
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(422).json({ message: 'Missing fields' });
    }
    if (newPassword.length < 8) {
      return res
        .status(422)
        .json({ message: 'New password must be at least 8 characters' });
    }
    // TODO : vérifiez currentPassword, hashez newPassword, persistez.
    return res.status(204).end();
  },
  { methods: 'POST,OPTIONS' },
);
