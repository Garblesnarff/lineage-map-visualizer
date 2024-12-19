export interface TeacherData {
  id: string;
  name: string;
  tibetan_name: string | null;
  tradition: string;
  period: string | null;
  scholastic: number | null;
  tantric: number | null;
  meditation: number | null;
  philosophical: number | null;
  location_name: string | null;
  description?: string; // Made optional with ?
}