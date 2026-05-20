// src/routes/api/upload/+server.ts
import type { RequestHandler } from './$types';
import { uploadPhoto } from '$lib/server/upload';
import { ok, unauthorized, badRequest } from '$lib/server/utils/response';

export const POST: RequestHandler = async (event) => {
  if (!event.locals.user) return unauthorized();

  const formData = await event.request.formData();
  const file     = formData.get('file') as File | null;
  const folder   = (formData.get('folder')?.toString() ?? 'misc') as 'staff' | 'students' | 'misc';

  if (!file || file.size === 0) return badRequest('No file provided');

  const result = await uploadPhoto(file, folder);
  if (!result.success) return badRequest(result.error);

  return ok({ url: result.url, filename: result.filename });
};
