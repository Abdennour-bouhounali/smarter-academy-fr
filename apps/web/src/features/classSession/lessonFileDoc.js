/**
 * « ملفّ الدرس » — the teacher's work file of a lesson (owner, 2026-11-18; CLASS_SESSION.md §2ter). ONE per (teacher,
 * lesson). It is drawn with the Math Lab's whiteboard — the same instrument, nothing rebuilt — but it is NOT in the lab:
 * it has its own full-screen page (`/enseignant/milaff/:lessonId`), and leaving it returns to the lesson.
 * The server keeps the link lesson → document (`/teacher/lesson-files/{lesson}`).
 */
import { createMathLabDocument, fetchMathLabDocument } from '../../services/mathLabService';
import { fetchLessonFile, saveLessonFile } from '../../services/teacher/classSessionService';
import { newMathLabDocument } from '../mathlab/mathLabDocument';
import { whiteboardTool } from '../mathlab/tools/whiteboard/index.js';

export const lessonFilePagePath = (lessonId) => `/enseignant/milaff/${encodeURIComponent(lessonId)}`;
export const lessonFileTitle = (lessonTitle) => `ملفّ الدرس — ${lessonTitle}`.slice(0, 120);

/**
 * The document of the lesson's file: the one already attached when it still exists, a new empty whiteboard otherwise
 * (first opening, or the document was deleted).
 */
const opening = new Map();
/** One opening at a time per lesson: two calls made together (a double tap, a page mounted twice) share ONE document. */
export function lessonFileDocumentId(token, lessonCode, lessonTitle, api) {
  if (!opening.has(lessonCode))
    opening.set(
      lessonCode,
      resolveDocumentId(token, lessonCode, lessonTitle, api).finally(() => opening.delete(lessonCode)),
    );
  return opening.get(lessonCode);
}
async function resolveDocumentId(
  token,
  lessonCode,
  lessonTitle,
  api = { fetchLessonFile, saveLessonFile, fetchMathLabDocument, createMathLabDocument },
) {
  const file = await api.fetchLessonFile(token, lessonCode);
  let id = file?.documentId ?? null;
  if (id != null) {
    try {
      await api.fetchMathLabDocument(token, id);
    } catch {
      id = null;
    }
  }
  if (id == null) {
    const fresh = newMathLabDocument(whiteboardTool, { title: lessonFileTitle(lessonTitle) });
    const { document } = await api.createMathLabDocument(token, {
      tool: fresh.tool,
      title: fresh.title,
      schemaVersion: fresh.schemaVersion,
      data: fresh.data,
    });
    id = document.id;
    await api.saveLessonFile(token, lessonCode, { documentId: id });
  }
  return id;
}
