/**
 * CourseRefreshBus — pub/sub event bus pentru notificări de tip
 * "cursul X a fost modificat din chat".
 *
 * Folosit ca să decuplăm `ChatContext` (publisher — emite când un tool
 * de modificare returnează un `tool_result`) de pagini ca
 * `CourseBuilderPage` (subscriber — re-fetch curs cu `silent: true`).
 *
 * E un singleton module-scoped, intenționat simplu — nu vrem un context
 * React pentru asta pentru că lifecycle-ul subscriber-ului e legat de
 * o pagină, nu de provider-ul de chat.
 */

type Listener = (courseId: string) => void;

const listeners = new Set<Listener>();

export const courseRefreshBus = {
  /** Înregistrează un listener. Returnează un unsubscribe. */
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** Notifică toți listener-ii că `courseId` a fost modificat. */
  emit(courseId: string): void {
    listeners.forEach((l) => {
      try {
        l(courseId);
      } catch (e) {
        // Un subscriber buggy nu trebuie să oprească restul lanțului.
        // eslint-disable-next-line no-console
        console.warn("[courseRefreshBus] listener threw:", e);
      }
    });
  },
};
