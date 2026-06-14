export interface Note {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// what send to the backend (API) when creating a new note
// id/timestamps are added by the backend
export interface CreateNotePayload {
  title: string;
  content: string;
}
