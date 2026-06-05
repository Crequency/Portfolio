import type { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProject(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'Request body is required' }];
  }
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== 'string' || b.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }
  if (b.description !== undefined && typeof b.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }
  if (b.path !== undefined && typeof b.path !== 'string') {
    errors.push({ field: 'path', message: 'Path must be a string' });
  }
  if (b.tags !== undefined) {
    if (!Array.isArray(b.tags) || b.tags.some((t: unknown) => typeof t !== 'string')) {
      errors.push({ field: 'tags', message: 'Tags must be an array of strings' });
    }
  }
  return errors;
}

export function validateService(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'Request body is required' }];
  }
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== 'string' || b.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  }
  if (b.port === undefined || b.port === null || typeof b.port !== 'number' || !Number.isInteger(b.port) || b.port < 1 || b.port > 65535) {
    errors.push({ field: 'port', message: 'Port is required and must be an integer between 1 and 65535' });
  }
  if (b.description !== undefined && typeof b.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }
  return errors;
}
