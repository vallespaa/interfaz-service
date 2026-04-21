const Favorito = require('../models/favoritos');
const { v4: uuidv4 } = require('uuid');
const { pubClient } = require('../config/redis');

const publicarEvento = (evento) => {
  pubClient.publish(process.env.CANAL_IUMAESTRO, JSON.stringify(evento))
    .catch(err => console.error('[Redis] Error al publicar evento:', err));
};

const FavoritoController = {
  // GET /api/iu/favoritos
  getAll: async (req, res) => {
    try {
      const idConductor = req.idConductor; 
      const favoritos = await Favorito.find({ idConductor });
      res.json(favoritos);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener favoritos" });
    }
  },

  // POST /api/iu/favoritos
  create: async (req, res) => {
    try {
      const { idZona } = req.body;
      const idConductor = req.idConductor;

      const existe = await Favorito.findOne({ idConductor, idZona });
      if (existe) return res.status(409).json({ mensaje: "La zona ya está en favoritos" });

      const nuevoFavorito = new Favorito({
        idFavorito: `fav-${uuidv4().substring(0, 8)}`,
        idConductor,
        idZona
      });

      await nuevoFavorito.save();
      res.status(201).json(nuevoFavorito);

      publicarEvento({
        tipo: "FAVORITO_CREADO",
        fecha: new Date().toISOString(),
        datos: {
          idFavorito: nuevoFavorito.idFavorito,
          idConductor: nuevoFavorito.idConductor,
          idZona: nuevoFavorito.idZona
        }
      });
    } catch (error) {
      res.status(400).json({ mensaje: "Error al crear favorito", error: error.message });
    }
  },

  // DELETE /api/iu/favoritos/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const idConductor = req.idConductor;

      const favorito = await Favorito.findOne({ idFavorito: id });

      if (!favorito) return res.status(404).json({ mensaje: "No encontrado" });

      // Verificación de propiedad (Seguridad)
      if (favorito.idConductor !== idConductor) {
        return res.status(403).json({ mensaje: "No tienes permiso para eliminar este favorito" });
      }

      await Favorito.deleteOne({ idFavorito: id });
      res.status(204).send();

      publicarEvento({
        tipo: "FAVORITO_ELIMINADO",
        fecha: new Date().toISOString(),
        datos: {
          idFavorito: favorito.idFavorito,
          idConductor: favorito.idConductor,
          idZona: favorito.idZona
        }
      });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar" });
    }
  }
};

module.exports = FavoritoController;
