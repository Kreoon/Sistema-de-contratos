/**
 * Ubicaciones en cascada: País → Departamento/Estado → Ciudad
 * Colombia tiene cobertura completa. Otros países tienen las principales divisiones.
 */

export const LOCATIONS: Record<string, Record<string, string[]>> = {
  Colombia: {
    Amazonas: ['Leticia', 'Puerto Nariño'],
    Antioquia: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Rionegro', 'Turbo', 'Caucasia', 'Sabaneta', 'La Estrella', 'Copacabana', 'Girardota', 'Barbosa', 'Carmen de Viboral'],
    Arauca: ['Arauca', 'Saravena', 'Tame'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa'],
    'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen de Bolívar', 'Arjona'],
    'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva'],
    Caldas: ['Manizales', 'La Dorada', 'Villamaría', 'Chinchiná'],
    'Caquetá': ['Florencia', 'San Vicente del Caguán'],
    Casanare: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena'],
    Cauca: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó'],
    Cesar: ['Valledupar', 'Aguachica', 'Codazzi', 'La Jagua de Ibirico'],
    'Chocó': ['Quibdó', 'Istmina', 'Tadó'],
    'Córdoba': ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Planeta Rica', 'Montelíbano'],
    Cundinamarca: ['Bogotá D.C.', 'Soacha', 'Facatativá', 'Zipaquirá', 'Chía', 'Fusagasugá', 'Girardot', 'Madrid', 'Mosquera', 'Funza', 'Cajicá', 'Cota', 'La Calera', 'Tabio', 'Tenjo', 'Sopó', 'Tocancipá', 'Gachancipá', 'Villeta', 'La Mesa'],
    Guainía: ['Inírida'],
    Guaviare: ['San José del Guaviare'],
    Huila: ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
    'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'San Juan del Cesar'],
    Magdalena: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato'],
    Meta: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López'],
    'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'La Unión'],
    'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Los Patios', 'Villa del Rosario'],
    Putumayo: ['Mocoa', 'Puerto Asís', 'Orito'],
    Quindío: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Circasia'],
    Risaralda: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia'],
    'San Andrés y Providencia': ['San Andrés', 'Providencia'],
    Santander: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
    Sucre: ['Sincelejo', 'Corozal', 'San Marcos', 'Tolú'],
    Tolima: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Mariquita', 'Líbano'],
    'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Jamundí', 'Candelaria'],
    Vaupés: ['Mitú'],
    Vichada: ['Puerto Carreño'],
  },
  México: {
    'Aguascalientes': ['Aguascalientes'],
    'Baja California': ['Tijuana', 'Mexicali', 'Ensenada'],
    'Baja California Sur': ['La Paz', 'Los Cabos'],
    Campeche: ['Campeche', 'Ciudad del Carmen'],
    Chiapas: ['Tuxtla Gutiérrez', 'San Cristóbal de las Casas', 'Tapachula'],
    Chihuahua: ['Chihuahua', 'Ciudad Juárez'],
    'Ciudad de México': ['Ciudad de México'],
    Coahuila: ['Saltillo', 'Torreón', 'Monclova'],
    Colima: ['Colima', 'Manzanillo'],
    Durango: ['Durango'],
    Guanajuato: ['León', 'Guanajuato', 'Irapuato', 'Celaya'],
    Guerrero: ['Acapulco', 'Chilpancingo'],
    Hidalgo: ['Pachuca'],
    Jalisco: ['Guadalajara', 'Zapopan', 'Puerto Vallarta', 'Tlaquepaque'],
    'Estado de México': ['Toluca', 'Naucalpan', 'Ecatepec', 'Tlalnepantla'],
    Michoacán: ['Morelia', 'Uruapan'],
    Morelos: ['Cuernavaca'],
    Nayarit: ['Tepic'],
    'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'San Nicolás'],
    Oaxaca: ['Oaxaca de Juárez'],
    Puebla: ['Puebla', 'Tehuacán'],
    Querétaro: ['Querétaro'],
    'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal'],
    'San Luis Potosí': ['San Luis Potosí'],
    Sinaloa: ['Culiacán', 'Mazatlán'],
    Sonora: ['Hermosillo', 'Ciudad Obregón', 'Nogales'],
    Tabasco: ['Villahermosa'],
    Tamaulipas: ['Reynosa', 'Tampico', 'Matamoros'],
    Tlaxcala: ['Tlaxcala'],
    Veracruz: ['Veracruz', 'Xalapa', 'Coatzacoalcos'],
    Yucatán: ['Mérida', 'Valladolid'],
    Zacatecas: ['Zacatecas'],
  },
  Argentina: {
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata'],
    'CABA': ['Ciudad Autónoma de Buenos Aires'],
    Córdoba: ['Córdoba', 'Villa María'],
    Mendoza: ['Mendoza'],
    'Santa Fe': ['Rosario', 'Santa Fe'],
    Tucumán: ['San Miguel de Tucumán'],
  },
  Chile: {
    'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes'],
    Valparaíso: ['Valparaíso', 'Viña del Mar'],
    Biobío: ['Concepción'],
    Araucanía: ['Temuco'],
  },
  Perú: {
    Lima: ['Lima', 'Miraflores', 'San Isidro', 'Callao'],
    Arequipa: ['Arequipa'],
    Cusco: ['Cusco'],
    'La Libertad': ['Trujillo'],
  },
  Ecuador: {
    Pichincha: ['Quito'],
    Guayas: ['Guayaquil'],
    Azuay: ['Cuenca'],
  },
  Panamá: {
    Panamá: ['Ciudad de Panamá'],
    'Panamá Oeste': ['La Chorrera'],
    Chiriquí: ['David'],
  },
  'Estados Unidos': {
    California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Fort Lauderdale', 'Jacksonville'],
    'New York': ['New York City', 'Buffalo'],
    Texas: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    Illinois: ['Chicago'],
    Georgia: ['Atlanta'],
    Massachusetts: ['Boston'],
    Washington: ['Seattle'],
    Nevada: ['Las Vegas'],
    Colorado: ['Denver'],
    'New Jersey': ['Newark', 'Jersey City'],
    Connecticut: ['Hartford', 'Stamford'],
  },
  España: {
    Madrid: ['Madrid'],
    Barcelona: ['Barcelona'],
    Valencia: ['Valencia'],
    Sevilla: ['Sevilla'],
    'País Vasco': ['Bilbao', 'San Sebastián'],
    Málaga: ['Málaga', 'Marbella'],
  },
  Brasil: {
    'São Paulo': ['São Paulo', 'Campinas'],
    'Rio de Janeiro': ['Rio de Janeiro'],
    'Minas Gerais': ['Belo Horizonte'],
    'Rio Grande do Sul': ['Porto Alegre'],
    Paraná: ['Curitiba'],
    Bahia: ['Salvador'],
  },
}

/**
 * Obtiene los departamentos/estados disponibles para un país
 */
export function getDepartments(country: string): string[] {
  return Object.keys(LOCATIONS[country] || {}).sort()
}

/**
 * Obtiene las ciudades disponibles para un departamento/estado
 */
export function getCities(country: string, department: string): string[] {
  return LOCATIONS[country]?.[department] || []
}

/**
 * Verifica si un país tiene datos de ubicación predefinidos
 */
export function hasLocationData(country: string): boolean {
  return country in LOCATIONS
}
