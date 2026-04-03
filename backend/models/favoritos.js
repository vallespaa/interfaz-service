const mongoose = require('mongoose');

const favoritoSchema = new mongoose.Schema({
  idFavorito: {
    type: String,
    required: true,
    unique: true
  },
  idConductor: {
    type: String,
    required: true
  },
  idZona: {
    type: String,
    required: true
  },
  fechaGuardado: {
    type: Date,
    default: Date.now
  }
});

favoritoSchema.index({ idConductor: 1, idZona: 1 }, { unique: true });

module.exports = mongoose.model('Favorito', favoritoSchema);
