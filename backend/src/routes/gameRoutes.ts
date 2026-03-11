/**
 * RUTAS
 * Define qué URL corresponde a qué controlador y aplica las validaciones.
 */

import { Router } from "express";
import * as gameController from "../controllers/gameController";
import { validateCreateGame, validateUpdateGame, validateGameFilters, validate } from "../middlewares/validators";

const router = Router();

router.get("/",    validateGameFilters, validate, gameController.getGames);
router.get("/:id",                                gameController.getGameById);
router.post("/",   validateCreateGame,  validate, gameController.createGame);
router.put("/:id", validateUpdateGame,  validate, gameController.updateGame);
router.delete("/:id",                             gameController.deleteGame);

export default router;
