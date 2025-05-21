import axios from 'axios';

export async function verificarAdmin(req, res, next) {
  try {
    const userId = req.header('Authorization');
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado: falta userId' });
    }

    const { data: usuarios } = await axios.get('http://localhost:3003/usuarios');
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!usuario.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: no es admin' });
    }

    next();

  } catch (error) {
    console.error('Error en verificación admin:', error);
    return res.status(500).json({ message: 'Error en servidor al verificar admin' });
  }
}
