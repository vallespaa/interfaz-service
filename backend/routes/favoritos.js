const { Router } = require('express');
const FavoritoController = require('../controllers/favoritosController'); 
const verificarToken = require('../middlewares/auth');

const favoritosRouter = Router();

favoritosRouter.use(verificarToken);

favoritosRouter.get('/', FavoritoController.getAll);
favoritosRouter.post('/', FavoritoController.create);
favoritosRouter.delete('/:id', FavoritoController.delete);

module.exports = favoritosRouter;