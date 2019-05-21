interface rect {
  left: number,
  top: number,
  right: number,
  bottom: number
}

interface point {
  lat: number,
  lng: number
}


export function rect(lat: number, lng: number, distance: number, precision: number) : number;
export function area(fn : Function, precision: number) : number;
export function encode(lat: number, lng: number, precision: number) : string;
export function decode(hash: string) : rect;
export function distance(start: point, end: point) : number;