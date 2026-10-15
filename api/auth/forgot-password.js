/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe. Envoie un code par e-mail.
 *
 * Body : { email }
 * Réponse 204 : code envoyé (toujours 204, même si l'e-mail n'existe pas)
 */
import { withCors } from '../_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    const { email } = req.body || {};
    if (!email) {
      return res.status(422).json({ message: 'email is required' });
    }
    // TODO : générez un code, envoyez l'e-mail, stockez le code.
    return res.status(204).end();
  },
  { methods: 'POST,OPTIONS' },
);
