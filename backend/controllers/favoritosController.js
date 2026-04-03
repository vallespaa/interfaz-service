const Favorito = require('../models/favoritos');
const { v4: uuidv4 } = require('uuid');
const { pubClient } = require('../config/redis');

// TODO: Pendiente de probar con datos de producción

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

  // POST /api/favoritos
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

      // Evento Redis
      const evento = {
        tipo: "FAVORITO_CREADO",
        fecha: new Date().toISOString(),
        datos: nuevoFavorito
      };
      await pubClient.publish('iumaestro.favoritos', JSON.stringify(evento));

      res.status(201).json(nuevoFavorito);
    } catch (error) {
      res.status(400).json({ mensaje: "Error al crear favorito", error: error.message });
    }
  },

  // DELETE /api/favoritos/:id
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

      // Evento Redis
      const evento = {
        tipo: "FAVORITO_ELIMINADO",
        fecha: new Date().toISOString(),
        datos: favorito
      };
      await pubClient.publish('iumaestro.favoritos', JSON.stringify(evento));

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar" });
    }
  }
};

module.exports = FavoritoController;
