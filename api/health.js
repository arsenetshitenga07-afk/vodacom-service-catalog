/**
 * GET /api/health
 * Health check simple. Utilisé par la page Paramètres pour indiquer
 * l'état de l'API (en ligne / injoignable).
 */
import { withCors } from './_lib/cors';

export default withCors(
  async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    return res.status(200).json({ status: 'ok', uptime: process.uptime() });
  },
  { methods: 'GET,OPTIONS' },
);
