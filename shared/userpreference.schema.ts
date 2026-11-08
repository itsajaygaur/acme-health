export interface SearchPreference {
  id: number;
  userId: number;
  pageName: string;
  filterJson: string;
}

export interface FilterPreference {
  controlName: string;
  filterValue: string;
}