export type FuelPriceBoundingBox = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  initialized: boolean;
  latitudeSeparation: number;
};

export type FuelPriceStationInfo = {
  id: number | null;
  rotulo: string | null;
  operador: string | null;
  direccion: string | null;
  margen: string | null;
  codPostal: string | null;
  provincia: string | null;
  municipio: string | null;
  localidad: string | null;
  fechaPvp: string | null;
  horaPvp: string | null;
  tipoVenta: string | null;
  remision: string | null;
  coordenadaX: string | null;
  coordenadaY: string | null;
  coordenadaX_dec: number | null;
  coordenadaY_dec: number | null;
  horario: string | null;
  tipoServicio: string | null;
  nombreCCAA: string | null;
  tipoRango: string | null;
  tipoEstacion: string | null;
  porcBioetanol: number | null;
  porcBioalcohol: number | null;
  servicios: string | null;
  imagenEESS: string | null;
  planesDescuento: string | null;
  favorita: boolean;
  valoracion: number | null;
  precio: number | null;
};

export type FuelPriceProductInfo = {
  id: number | null;
  nombre: string | null;
  descripcion: string | null;
  activo: boolean | null;
  terrestre: boolean | null;
  embarcacion: boolean | null;
  bioetanol: boolean | null;
  biodiesel: boolean | null;
  orden: number | null;
};

export type FuelPriceStation = {
  id: number | null;
  precio: number | null;
  fuelId?: string | null;
  estacion: FuelPriceStationInfo;
  producto: FuelPriceProductInfo;
  rango: string | null;
  favorita: boolean;
};

export type FuelPriceSearchResult = {
  bbox: FuelPriceBoundingBox;
  estaciones: FuelPriceStation[];
};

export type FuelPriceSearchCriteria = {
  stationType?: string;
  provinceId?: string;
  municipalityId?: string;
  productId?: string;
  brand?: string;
  economicalStations?: boolean;
  discountPlans?: boolean;
  startTime?: string;
  endTime?: string;
  street?: string;
  streetNumber?: string;
  postalCode?: string;
  saleType?: string;
  serviceType?: string | null;
  operatorId?: string;
  planName?: string;
  recipientTypeId?: string | null;
  bounds?: {
    x0?: string;
    y0?: string;
    x1?: string;
    y1?: string;
  };
};
