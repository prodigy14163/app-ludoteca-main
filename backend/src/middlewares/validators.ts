/**
 * VALIDACIONES DE ENTRADA
 * Usa express-validator para validar datos antes de llegar al controlador.
 */

import { body, validationResult, query, FieldValidationError } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Verifica si hubo errores de validación y responde 400 si los hay
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      campo: (err as FieldValidationError).path,
      mensaje: err.msg,
    }));

    res.status(400).json({
      success: false,
      error: "Datos de entrada inválidos",
      details: errorMessages,
    });
    return;
  }

  next();
}

// Validaciones para crear un juego
export const validateCreateGame = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ max: 150 }).withMessage("El nombre no puede superar 150 caracteres")
    .escape(),

  body("tipo").trim().notEmpty().withMessage("El tipo es obligatorio")
    .isLength({ max: 100 }).withMessage("El tipo no puede superar 100 caracteres")
    .escape(),

  body("numeroJugadores").notEmpty().withMessage("El número de jugadores es obligatorio")
    .isInt({ min: 1, max: 100 }).withMessage("El número de jugadores debe ser entre 1 y 100"),

  body("edadMinima").notEmpty().withMessage("La edad mínima es obligatoria")
    .isInt({ min: 0, max: 18 }).withMessage("La edad mínima debe ser entre 0 y 18"),

  body("disponible").optional()
    .isBoolean().withMessage("disponible debe ser true o false"),

  body("stock").optional()
    .isInt({ min: 0 }).withMessage("El stock debe ser un número positivo"),

  body("tags").optional()
    .isArray({ max: 20 }).withMessage("tags debe ser un array de máximo 20 elementos")
    .custom((tags: unknown[]) =>
      tags.every((t) => typeof t === "string" && t.length <= 50 && !/[<>]/.test(t))
    )
    .withMessage("Cada tag debe ser texto (máx. 50 caracteres, sin HTML)"),

  body("descripcion").optional()
    .isString().withMessage("La descripción debe ser un texto")
    .isLength({ max: 2000 }).withMessage("La descripción no puede superar 2000 caracteres"),
];

// Validaciones para actualizar (todos opcionales)
export const validateUpdateGame = [
  body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío")
    .isLength({ max: 150 }).withMessage("El nombre no puede superar 150 caracteres")
    .escape(),

  body("tipo").optional().trim().notEmpty().withMessage("El tipo no puede estar vacío")
    .isLength({ max: 100 }).withMessage("El tipo no puede superar 100 caracteres")
    .escape(),

  body("numeroJugadores").optional()
    .isInt({ min: 1, max: 100 }).withMessage("El número de jugadores debe ser entre 1 y 100"),

  body("edadMinima").optional()
    .isInt({ min: 0, max: 18 }).withMessage("La edad mínima debe ser entre 0 y 18"),

  body("disponible").optional()
    .isBoolean().withMessage("disponible debe ser true o false"),

  body("stock").optional()
    .isInt({ min: 0 }).withMessage("El stock debe ser un número positivo"),

  body("tags").optional()
    .isArray({ max: 20 }).withMessage("tags debe ser un array de máximo 20 elementos")
    .custom((tags: unknown[]) =>
      tags.every((t) => typeof t === "string" && t.length <= 50 && !/[<>]/.test(t))
    )
    .withMessage("Cada tag debe ser texto (máx. 50 caracteres, sin HTML)"),

  body("descripcion").optional()
    .isString().withMessage("La descripción debe ser un texto")
    .isLength({ max: 2000 }).withMessage("La descripción no puede superar 2000 caracteres"),
];

// Validaciones para filtros en query string
export const validateGameFilters = [
  query("search").optional()
    .isString()
    .isLength({ max: 100 }).withMessage("La búsqueda no puede superar 100 caracteres")
    .trim(),

  query("edadMinima").optional()
    .isInt({ min: 0 }).withMessage("edadMinima debe ser un número positivo"),

  query("numeroJugadores").optional()
    .isInt({ min: 1 }).withMessage("numeroJugadores debe ser mayor a 0"),

  query("disponible").optional()
    .isIn(["true", "false"]).withMessage("disponible debe ser 'true' o 'false'"),

  query("page").optional()
    .isInt({ min: 1 }).withMessage("page debe ser mayor a 0"),

  query("limit").optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit debe ser entre 1 y 100"),
];
