// Point in 2D space (in centimeters or your preferred unit)
export interface Point {
  x: number;
  y: number;
}

// Furniture item
export interface Furniture {
  id: string;
  name: string;
  width: number; // horizontal length in cm
  height: number; // vertical length in cm
  position: Point; // position on the canvas
  rotation: number; // rotation angle in degrees (0-360)
}

// Room defined by polygon points
export interface Room {
  id: string;
  name: string;
  points: Point[]; // array of points defining the room boundary
}

// Application state
export interface AppState {
  room: Room | null;
  furniture: Furniture[];
  selectedFurnitureId: string | null;
}
