import { STATIONS, Station } from "./metroData";
import { ReportType } from "../types";

// Helper: Normalize text by converting to lowercase and removing accents
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/·/g, "") // remove Catalan middle dot
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " "); // replace punctuation with spaces
}

interface MatchResult {
  matched: boolean;
  station: Station | null;
  type: ReportType | null;
  description: string;
}

// Station keyword mappings (Russian, Catalan, Spanish, abbreviations, and new towns)
const STATION_KEYWORDS: Record<string, string[]> = {
  catalunya: ["catalunya", "placa cat", "каталония", "площадь каталонии"],
  sants_estacio: ["sants", "санц", "санс", "вокзал sants"],
  passeig_de_gracia: ["passeig de gracia", "пасео де грасия", "pg gracia"],
  sagrada_familia: ["sagrada", "familia", "саграда", "святого семейства"],
  espanya: ["espanya", "espana", "испании", "площадь испании"],
  diagonal: ["diagonal", "диагональ"],
  universitat: ["universitat", "университет", "универ"],
  el_clot: ["clot", "клот"],
  arc_de_triomf: ["arc de triomf", "триумфальная арка", "арка"],
  marina: ["marina", "марина"],
  bogatell: ["bogatell", "богатель"],
  poblenou: ["poblenou", "побленоу"],
  barceloneta: ["barceloneta", "барселонета"],
  jaume_i: ["jaume", "хауме", "жауме"],
  urquinaona: ["urquinaona", "уркинаона"],
  liceu: ["liceu", "лисео", "лисей"],
  drassanes: ["drassanes", "драссанес"],
  paral_lel: ["paral·lel", "parallel", "параллель"],
  la_sagrera: ["sagrera", "сагрера"],
  fabra_i_puig: ["fabra i puig", "fabra", "фабра и пуч", "фабра", "sant andreu arenal", "andreu arenal"],
  // Expanded Towns
  badalona_pompeu_fabra: ["badalona pompeu fabra", "pompeu fabra", "бадалона помпеу фабра"],
  gorg: ["gorg", "горг"],
  pep_ventura: ["pep ventura", "пеп вентура"],
  torrassa: ["torrassa", "торрасса"],
  bellvitge: ["bellvitge", "бельвитже"],
  can_vidalet: ["can vidalet", "кан видалет"],
  fondo: ["fondo", "фондо"],
  santa_coloma: ["santa coloma", "санта колома"],
  cornella_centre: ["cornella centre", "cornella", "корнелья"],
  almeda: ["almeda", "алмеда"],
  sabadell_centre: ["sabadell centre", "сабадель центр"],
  sabadell_nord: ["sabadell nord", "sabadell север"],
  sabadell_sud: ["sabadell sud", "sabadell юг"],
  terrassa_estacio_nord: ["terrassa estacio del nord", "terrassa estacio nord", "террасса северный вокзал", "terrassa nord"],
  terrassa_est: ["terrassa est", "террасса восток"],
  castelldefels: ["castelldefels", "кастельдефельс"],
  platja_castelldefels: ["platja de castelldefels", "platja castelldefels", "пляж кастельдефельс"],
  mataro: ["mataro", "матаро"],
  aeroport_t1: ["aeroport t1", "аэропорт т1", "airport t1"],
  aeroport_t2: ["aeroport t2", "аэропорт т2", "airport t2"],
  sant_cugat: ["sant cugat", "сант кугат"],
  rubi: ["rubi", "руби"],
  el_prat_estacio: ["el prat estacio", "el prat", "эль прат"],
  granollers_centre: ["granollers centre", "granollers", "гранольерс"],
  l_hospitalet: ["l'hospitalet", "hospitalet", "госпиталет", "хоспиталет", "l hospitalet"],
  badalona_rodalies: ["badalona rodalies", "бадалона родалиес", "бадалона электричка", "badalona r1"],
  estacio_de_franca: ["estacio de franca", "franca", "вокзал франция", "французский вокзал"],
  sant_andreu_rodalies: ["sant andreu rodalies", "sant andreu r2", "сант андреу родалиес"],
  gava: ["gava", "гава"],
  viladecans: ["viladecans", "виладеканс"],
  sitges: ["sitges", "сиджес", "ситжес", "сиджесе"],
  vilanova_i_la_geltru: ["vilanova", "вилланова", "виланова"],
  sant_vicenc_de_calders: ["sant vicenc", "sant vicente", "сант висенс"],
  molins_de_rei: ["molins", "молинс"],
  martorell: ["martorell", "марторель"],
  castellbisbal: ["castellbisbal", "кастельбисбаль"],
  cerdanyola_del_valles: ["cerdanyola del valles", "cerdanyola", "серданьола"],
  cerdanyola_universitat: ["cerdanyola universitat", "universitat autonoma", "uab", "университет автономный"],
  sant_adria_rodalies: ["sant adria rodalies", "sant adria r1", "сант адриа"],
  el_masnou: ["el masnou", "masnou", "масноу"],
  premia_de_mar: ["premia", "премья"],
  vilassar_de_mar: ["vilassar", "виласар"],
  arenys_de_mar: ["arenys", "аренис"],
  calella: ["calella", "калелья", "калея"],
  blanes: ["blanes", "бланес"],
  macanet_massanes: ["macanet", "масанет"],
  montcada_bifurcacio: ["montcada bifurcacio", "монкада бифуркация"],
  vic: ["vic", "вик"],
  ripoll: ["ripoll", "риполь"],
  puigcerda: ["puigcerda", "пучсерда"],
  vilafranca_del_penedes: ["vilafranca", "вилафранка"],
  manresa: ["manresa", "манреса"],
  montcada_i_reixac: ["montcada i reixac", "montcada", "монкада"],
  mollet_sant_fost: ["mollet", "моллет"],
  sant_celoni: ["sant celoni", "сант селони"],
};

// Alert types keyword mappings updated with new subtypes
const ALERT_KEYWORDS: Record<ReportType, string[]> = {
  gossos: [
    "gossos", "perro", "perros", "собака", "собаки", "собак", "dog", "dogs"
  ],
  pregunta: [
    "pregunta", "consulta", "опрос", "проверяют на входе", "спросить", "узнать", "входе перед", "inquiry"
  ],
  gorilles: [
    "goril·les", "gorilles", "gorilas", "securitas", "seguridad", "охрана", "охранники", "жилетах", "vigilantes", "guards"
  ],
  lliure: [
    "lliure", "libre", "clean", "limpio", "свободно", "чисто", "проход свободен", "нет проверок", "clear"
  ],
  delay: [
    "retraso", "demora", "parado", "averia", "no funciona",
    "задержка", "стоит поезд", "сломался", "задержки", "опоздание", "отменили"
  ],
  closed: [
    "cerrado", "tancat", "closed", "закрыто", "закрыта", "закрыт", "блокирован", "заблокирован", "ferme", "fermee"
  ],
  other: [
    "obras", "incidencia", "ремонт", "проблема", "авария"
  ]
};

export function parseTelegramMessage(messageText: string): MatchResult {
  const normalized = normalizeText(messageText);

  // 1. Find Station Match
  let matchedStation: Station | null = null;
  for (const station of STATIONS) {
    const keywords = STATION_KEYWORDS[station.id] || [normalizeText(station.name)];
    const hasMatch = keywords.some(keyword => {
      const regex = new RegExp(`\\b${normalizeText(keyword)}\\b`, "i");
      return regex.test(normalized) || normalized.includes(normalizeText(keyword));
    });

    if (hasMatch) {
      matchedStation = station;
      break;
    }
  }

  // 2. Find Alert Type Match
  let matchedType: ReportType | null = null;
  for (const [type, keywords] of Object.entries(ALERT_KEYWORDS)) {
    const hasMatch = keywords.some(keyword => normalized.includes(normalizeText(keyword)));
    if (hasMatch) {
      matchedType = type as ReportType;
      break;
    }
  }

  // 3. Construct description or determine if matched
  const matched = matchedStation !== null && matchedType !== null;
  
  let description = messageText.trim();
  if (description.length > 150) {
    description = description.substring(0, 147) + "...";
  }

  return {
    matched,
    station: matchedStation,
    type: matchedType,
    description: matched ? `[Telegram Feed]: ${description}` : description,
  };
}
