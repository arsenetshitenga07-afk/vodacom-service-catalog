/**
 * POST /api/auth/send-code
 * Envoie un code à 4 chiffres par e-mail (mode 2FA).
 *
 * Body : { email }
 * Réponse 204 : code envoyé (ou silencieusement, pour ne pas leaker les e-mails)
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
    // TODO : générez un code à 4 chiffres, stockez-le en cache/DB
    // (avec expiration), envoyez l'e-mail. Répondez toujours 204 pour
    // ne pas révéler si l'e-mail existe.
    return res.status(204).end();
  },
  { methods: 'POST,OPTIONS' },
);
