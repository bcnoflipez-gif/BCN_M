export interface MetroLine {
  id: string;
  name: string;
  color: string; // hex color for UI
  textColor: string; // text color on line badge
  type: "metro" | "rodalies";
}

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[]; // references MetroLine.id
  type: "metro" | "rodalies" | "both";
  generalInfo: {
    accessibility: boolean; // Elevator access
    escalators: boolean;
    transfers: string; // Description of transfers
    infoTextRu: string; // Station general info in Russian
    infoTextEn: string; // Station general info in English
  };
}

export const METRO_LINES: Record<string, MetroLine> = {
  // Metro Lines
  L1: { id: "L1", name: "L1", color: "#ef4444", textColor: "#ffffff", type: "metro" },
  L2: { id: "L2", name: "L2", color: "#a855f7", textColor: "#ffffff", type: "metro" },
  L3: { id: "L3", name: "L3", color: "#22c55e", textColor: "#ffffff", type: "metro" },
  L4: { id: "L4", name: "L4", color: "#facc15", textColor: "#000000", type: "metro" },
  L5: { id: "L5", name: "L5", color: "#3b82f6", textColor: "#ffffff", type: "metro" },
  L9N: { id: "L9N", name: "L9N", color: "#f97316", textColor: "#ffffff", type: "metro" },
  L9S: { id: "L9S", name: "L9S", color: "#f97316", textColor: "#ffffff", type: "metro" },
  L10N: { id: "L10N", name: "L10N", color: "#06b6d4", textColor: "#ffffff", type: "metro" },
  L10S: { id: "L10S", name: "L10S", color: "#06b6d4", textColor: "#ffffff", type: "metro" },
  L11: { id: "L11", name: "L11", color: "#84cc16", textColor: "#ffffff", type: "metro" },
  FM: { id: "FM", name: "FM", color: "#16a34a", textColor: "#ffffff", type: "metro" },
  // Rodalies Lines
  R1: { id: "R1", name: "R1", color: "#f59e0b", textColor: "#000000", type: "rodalies" },
  R2: { id: "R2", name: "R2", color: "#d97706", textColor: "#ffffff", type: "rodalies" },
  R3: { id: "R3", name: "R3", color: "#ea580c", textColor: "#ffffff", type: "rodalies" },
  R4: { id: "R4", name: "R4", color: "#c2410c", textColor: "#ffffff", type: "rodalies" },
  R7: { id: "R7", name: "R7", color: "#b45309", textColor: "#ffffff", type: "rodalies" },
  R8: { id: "R8", name: "R8", color: "#78350f", textColor: "#ffffff", type: "rodalies" },
  R5: { id: "R5", name: "R5", color: "#f39200", textColor: "#ffffff", type: "rodalies" },
  R6: { id: "R6", name: "R6", color: "#9b2680", textColor: "#ffffff", type: "rodalies" },
};

export const STATIONS: Station[] = [
  {
    id: "catalunya",
    name: "Catalunya",
    lat: 41.3870,
    lng: 2.1700,
    lines: ["L1", "L3", "R1", "R3", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L3, R1, R3, R4, FGC Lines",
      infoTextRu: "Главный транспортный узел Барселоны, расположенный под одноименной площадью. Выходы к Рамбле, торговому центру El Corte Inglés и проспекту Грасиа.",
      infoTextEn: "The main transport hub of Barcelona, located beneath Plaza Catalunya. Access to Las Ramblas, El Corte Inglés shopping center, and Passeig de Gràcia."
    }
  },
  {
    id: "sants_estacio",
    name: "Sants Estació",
    lat: 41.3792,
    lng: 2.1400,
    lines: ["L3", "L5", "R1", "R2", "R3", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L3, L5, Rodalies (R1-R4), AVE High Speed Trains",
      infoTextRu: "Главный железнодорожный вокзал Барселоны. Отсюда ходят скоростные поезда в Мадрид/Францию и пригородные электрички во все направления.",
      infoTextEn: "The main railway station of Barcelona. Connects to AVE high-speed trains to Madrid/France and suburban trains to all directions."
    }
  },
  {
    id: "passeig_de_gracia",
    name: "Passeig de Gràcia",
    lat: 41.3897,
    lng: 2.1648,
    lines: ["L2", "L3", "L4", "R2"],
    type: "both",
    generalInfo: {
      accessibility: false,
      escalators: true,
      transfers: "L2, L3, L4, Rodalies R2",
      infoTextRu: "Станция в самом центре города, известная своими длинными подземными переходами. Выход к домам Гауди (Casa Batlló, Casa Milà).",
      infoTextEn: "Central station famous for its long underground transfer corridors. Close to Antoni Gaudí masterpieces (Casa Batlló, Casa Milà)."
    }
  },
  {
    id: "sagrada_familia",
    name: "Sagrada Família",
    lat: 41.4036,
    lng: 2.1744,
    lines: ["L2", "L5"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L2, L5",
      infoTextRu: "Станция непосредственно у знаменитого собора Святого Семейства Антонио Гауди. Популярная туристическая точка с высоким пассажиропотоком.",
      infoTextEn: "Station right outside the famous Basílica de la Sagrada Família by Antoni Gaudí. A highly populated tourist spot with heavy passenger traffic."
    }
  },
  {
    id: "espanya",
    name: "Espanya",
    lat: 41.3750,
    lng: 2.1492,
    lines: ["L1", "L3", "R5", "R6"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L3, FGC Lines",
      infoTextRu: "Станция под площадью Испании. Выход к Волшебному фонтану Монжуик, торговому центру Arenas и выставочному комплексу Fira Barcelona.",
      infoTextEn: "Station beneath Plaça d'Espanya. Access to the Magic Fountain of Montjuïc, Arenas mall, and Fira Barcelona exhibition center."
    }
  },
  {
    id: "diagonal",
    name: "Diagonal",
    lat: 41.3960,
    lng: 2.1583,
    lines: ["L3", "L5"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L3, L5, FGC (Provença)",
      infoTextRu: "Узел пересечения проспекта Диагональ и улицы Рамбла де Каталония. Соединен переходом со станцией Provença железных дорог FGC.",
      infoTextEn: "Intersection node of Avinguda Diagonal and Rambla de Catalunya. Connected internally with Provença FGC train station."
    }
  },
  {
    id: "universitat",
    name: "Universitat",
    lat: 41.3855,
    lng: 2.1627,
    lines: ["L1", "L2"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L2",
      infoTextRu: "Расположена у исторического здания Университета Барселоны. Популярна среди студентов, частые проверки билетов на выходе из L2.",
      infoTextEn: "Located next to the historic University of Barcelona building. Highly popular among students, frequent ticket controls near L2 exits."
    }
  },
  {
    id: "el_clot",
    name: "El Clot / Aragó",
    lat: 41.4085,
    lng: 2.1865,
    lines: ["L1", "L2", "R1", "R2", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L2, Rodalies R1, R2, R4",
      infoTextRu: "Крупная пересадочная станция на востоке города. Удобное сообщение с аэропортом через линию R2 Nord.",
      infoTextEn: "Large interchange station in the eastern area of the city. Convenient airport connection via the R2 Nord train line."
    }
  },
  {
    id: "arc_de_triomf",
    name: "Arc de Triomf",
    lat: 41.3917,
    lng: 2.1803,
    lines: ["L1", "R1", "R3", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, Rodalies R1, R3, R4, Nord Bus Station",
      infoTextRu: "Станция у Триумфальной арки и парка Цитадели. В непосредственной близости находится автовокзал Estació del Nord.",
      infoTextEn: "Station near the Arc de Triomf monument and Ciutadella Park. Direct connection to the Estació del Nord bus terminal."
    }
  },
  {
    id: "marina",
    name: "Marina",
    lat: 41.3944,
    lng: 2.1906,
    lines: ["L1"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция в районе Побленоу. Рядом находится ночной клуб Razzmatazz и трамвайная остановка TRAM.",
      infoTextEn: "Station in Poblenou district. Close to the famous Razzmatazz nightclub and TRAM stop."
    }
  },
  {
    id: "bogatell",
    name: "Bogatell",
    lat: 41.3915,
    lng: 2.1965,
    lines: ["L4"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Ближайшая станция к пляжу Богатель и олимпийскому порту. Очень оживленная в летний период.",
      infoTextEn: "Closest station to Bogatell beach and Olympic Port. Extremely busy during the summer season."
    }
  },
  {
    id: "poblenou",
    name: "Poblenou",
    lat: 41.4018,
    lng: 2.2065,
    lines: ["L4"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция в сердце креативного района Побленоу, рядом с Рамбла де Побленоу с её кафе и ресторанами.",
      infoTextEn: "Station in the heart of the creative Poblenou neighborhood, close to Rambla del Poblenou filled with cafes and terraces."
    }
  },
  {
    id: "barceloneta",
    name: "Barceloneta",
    lat: 41.3804,
    lng: 2.1887,
    lines: ["L4"],
    type: "metro",
    generalInfo: {
      accessibility: false,
      escalators: false,
      transfers: "None",
      infoTextRu: "Главная станция для поездки на пляж Барселонета. Маленькая, часто переполненная станция без лифтов, высокий риск карманных краж.",
      infoTextEn: "The main station to reach Barceloneta beach. Small, frequently overcrowded with no elevator access. High risk of pickpocketing."
    }
  },
  {
    id: "jaume_i",
    name: "Jaume I",
    lat: 41.3842,
    lng: 2.1783,
    lines: ["L4"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция в Готическом квартале. Выход на площадь Ангел и к Кафедральному собору Барселоны.",
      infoTextEn: "Station inside the Gothic Quarter. Exit to Plaça de l'Àngel and close to the Barcelona Cathedral."
    }
  },
  {
    id: "urquinaona",
    name: "Urquinaona",
    lat: 41.3891,
    lng: 2.1729,
    lines: ["L1", "L4"],
    type: "metro",
    generalInfo: {
      accessibility: false,
      escalators: true,
      transfers: "L1, L4",
      infoTextRu: "Пересадочный узел рядом с площадью Каталонии и Дворцом каталонской музыки. Узкие перроны, душно летом.",
      infoTextEn: "Interchange close to Plaça de Catalunya and Palau de la Música Catalana. Narrow platforms, can get very hot during summer."
    }
  },
  {
    id: "liceu",
    name: "Liceu",
    lat: 41.3806,
    lng: 2.1738,
    lines: ["L3"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция прямо посреди бульвара Рамбла, рядом с оперным театром Лисео и рынком Бокерия.",
      infoTextEn: "Station directly in the middle of La Rambla boulevard, next to the Gran Teatre del Liceu and La Boqueria Market."
    }
  },
  {
    id: "drassanes",
    name: "Drassanes",
    lat: 41.3762,
    lng: 2.1772,
    lines: ["L3"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Самая южная точка бульвара Рамбла у памятника Колумбу и Морского музея. Уникальный футуристический дизайн станции с белыми стенами.",
      infoTextEn: "The southernmost point of La Rambla by the Columbus Monument and Maritime Museum. Unique futuristic white-walled station design."
    }
  },
  {
    id: "paral_lel",
    name: "Paral·lel",
    lat: 41.3748,
    lng: 2.1672,
    lines: ["L2", "L3", "FM"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L2, L3, Funicular de Montjuïc (FM)",
      infoTextRu: "Конечная станция фиолетовой линии L2. Здесь совершается пересадка на фуникулер Монжуик, идущий на холм к парку и замку.",
      infoTextEn: "Terminus of purple line L2. Interchange point for the Montjuïc Funicular railway (FM) going up the hill."
    }
  },
  {
    id: "la_sagrera",
    name: "La Sagrera",
    lat: 41.4231,
    lng: 2.1911,
    lines: ["L1", "L5", "L9N", "L10N", "R3", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L5, L9N, L10N, Rodalies R3, R4",
      infoTextRu: "Огромный пересадочный хаб на севере города. Интегрирует четыре ветки метро и пригородные электрички.",
      infoTextEn: "A massive transport hub in the northern part of the city. Integrates four metro lines and suburban train systems."
    }
  },
  {
    id: "fabra_i_puig",
    name: "Fabra i Puig",
    lat: 41.4304,
    lng: 2.1828,
    lines: ["L1", "R3", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, Rodalies R3, R4 (Sant Andreu Arenal)",
      infoTextRu: "Станция пересадки между линией L1 метро и пригородными поездами Rodalies на станции Sant Andreu Arenal. Рядом находится автобусный вокзал Fabra i Puig.",
      infoTextEn: "Transfer station between Metro line L1 and Rodalies commuter trains at Sant Andreu Arenal station. Convenient access to Fabra i Puig bus station."
    }
  },
  // Expanded Metropolitan Stations
  {
    id: "badalona_pompeu_fabra",
    name: "Badalona Pompeu Fabra",
    lat: 41.4489,
    lng: 2.2475,
    lines: ["L2"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Конечная станция линии L2 в центре города Бадалона. Просторный современный терминал, доступный для инвалидов.",
      infoTextEn: "L2 Terminus station located in the center of Badalona. Spacious modern terminal with full accessibility."
    }
  },
  {
    id: "gorg",
    name: "Gorg",
    lat: 41.4403,
    lng: 2.2411,
    lines: ["L2", "L10N"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L2, L10 Nord, Tram T5",
      infoTextRu: "Пересадочный узел в Бадалоне. Соединяет оранжевую ветку L10N с фиолетовой L2 и трамваем TRAM.",
      infoTextEn: "Interchange station in Badalona. Connects L10 Nord, L2, and the T5 Tram route."
    }
  },
  {
    id: "pep_ventura",
    name: "Pep Ventura",
    lat: 41.4422,
    lng: 2.2417,
    lines: ["L2"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция метро в Бадалоне, названа в честь известного каталонского композитора Пепа Вентуры.",
      infoTextEn: "Metro station in Badalona, named after the famous Catalan composer Pep Ventura."
    }
  },
  {
    id: "torrassa",
    name: "Torrassa",
    lat: 41.3686,
    lng: 2.1228,
    lines: ["L1", "L9S", "L10S"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L9 Sud, L10 Sud",
      infoTextRu: "Пересадочный узел в Госпиталете. Соединяет красную линию L1 с южными автоматическими ветками L9S и L10S.",
      infoTextEn: "Interchange node in L'Hospitalet. Connects L1 and the southern automated lines L9S & L10S."
    }
  },
  {
    id: "bellvitge",
    name: "Bellvitge",
    lat: 41.3528,
    lng: 2.1189,
    lines: ["L1"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "Rodalies Bellvitge (R2)",
      infoTextRu: "Станция L1 в районе Белльвитже города Оспиталет-де-Льобрегат. Рядом находится госпиталь Белльвитже.",
      infoTextEn: "L1 station in L'Hospitalet de Llobregat. Close to the Bellvitge Hospital, connecting with Rodalies R2."
    }
  },
  {
    id: "can_vidalet",
    name: "Can Vidalet",
    lat: 41.3711,
    lng: 2.1028,
    lines: ["L5"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция линии L5 на границе городов Оспиталет и Эсплугес-де-Льобрегат.",
      infoTextEn: "L5 station bordering L'Hospitalet and Esplugues de Llobregat."
    }
  },
  {
    id: "fondo",
    name: "Fondo",
    lat: 41.4517,
    lng: 2.2181,
    lines: ["L1", "L9N"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L1, L9 Nord",
      infoTextRu: "Конечная станция красной ветки L1 в городе Санта-Колома-де-Граманет, узел пересадки на линию L9 Nord.",
      infoTextEn: "Terminus of L1 line in Santa Coloma de Gramenet, connecting directly with L9 Nord."
    }
  },
  {
    id: "santa_coloma",
    name: "Santa Coloma",
    lat: 41.4503,
    lng: 2.2069,
    lines: ["L1"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Центральная станция в городе Санта-Колома-де-Граманет на красной ветке метро L1.",
      infoTextEn: "Central metro station in Santa Coloma de Gramenet on the L1 red line."
    }
  },
  {
    id: "cornella_centre",
    name: "Cornellà Centre",
    lat: 41.3581,
    lng: 2.0719,
    lines: ["L5", "R1", "R4"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L5, Rodalies R1, R4, Tram T1/T2",
      infoTextRu: "Конечная станция синей ветки L5 в Корнелье. Крупный хаб с пересадками на пригородные поезда и трамваи.",
      infoTextEn: "L5 Terminus in Cornellà de Llobregat. Large multimodal terminal with Rodalies R1, R4, and Tram lines."
    }
  },
  {
    id: "sabadell_centre",
    name: "Sabadell Centre",
    lat: 41.5467,
    lng: 2.1150,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "FGC Sabadell Plaça Major",
      infoTextRu: "Станция пригородных поездов Rodalies в центре города Сабадель. Удобная пересадка на сеть FGC.",
      infoTextEn: "Rodalies train station in the center of Sabadell city. Connected with FGC railway network."
    }
  },
  {
    id: "sabadell_nord",
    name: "Sabadell Nord",
    lat: 41.5601,
    lng: 2.0950,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "FGC Sabadell Nord",
      infoTextRu: "Крупный пересадочный пункт на севере Сабаделя. Объединяет линию R4 Rodalies и ветку FGC S2.",
      infoTextEn: "Major transport terminal in the north of Sabadell, integrating Rodalies R4 and FGC S2."
    }
  },
  {
    id: "sabadell_sud",
    name: "Sabadell Sud",
    lat: 41.5311,
    lng: 2.1130,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Железнодорожная станция на юге Сабаделя, обслуживающая промышленный и жилой сектора.",
      infoTextEn: "Railway station in the southern part of Sabadell, serving residential and industrial districts."
    }
  },
  {
    id: "terrassa_estacio_nord",
    name: "Terrassa Estació del Nord",
    lat: 41.5683,
    lng: 2.0167,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "FGC Vallparadís / Terrassa",
      infoTextRu: "Главный пересадочный вокзал в городе Террасса. Соединяет пригородную электричку R4 с метрополитеном FGC.",
      infoTextEn: "Main train station in Terrassa. Connects Rodalies R4 trains with the FGC metro network."
    }
  },
  {
    id: "castelldefels",
    name: "Castelldefels",
    lat: 41.2805,
    lng: 1.9792,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция в жилой зоне пригородного города Кастельдефельс. Регулярные поезда до вокзала Сантс.",
      infoTextEn: "Train station in Castelldefels residential town center. High frequency trains to Barcelona Sants."
    }
  },
  {
    id: "platja_castelldefels",
    name: "Platja de Castelldefels",
    lat: 41.2680,
    lng: 1.9542,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Пляжная станция Кастельдефельса. Очень популярная летом, обеспечивает прямой доступ к побережью.",
      infoTextEn: "Beachside station in Castelldefels. Highly populated in summer, providing direct access to the sea."
    }
  },
  {
    id: "mataro",
    name: "Mataró",
    lat: 41.5317,
    lng: 2.4439,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Конечная станция ветки R1 в столице района Маресме — городе Матаро. Станция на побережье.",
      infoTextEn: "Rodalies R1 terminus station in Mataró, capital of the Maresme coast. Located right by the beach."
    }
  },
  {
    id: "aeroport_t1",
    name: "Aeroport T1",
    lat: 41.2872,
    lng: 2.0733,
    lines: ["L9S"],
    type: "metro",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Конечная станция оранжевой ветки метро L9S в Терминале 1 аэропорта Эль-Прат. Требуется специальный билет.",
      infoTextEn: "Metro Terminus of L9 Sud in Terminal 1 of El Prat Airport. Airport ticket supplement is required."
    }
  },
  {
    id: "aeroport_t2",
    name: "Aeroport T2",
    lat: 41.3033,
    lng: 2.0767,
    lines: ["L9S", "R2"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L9 Sud, Rodalies R2 Nord",
      infoTextRu: "Узел в Терминале 2 аэропорта. Соединяет линию метро L9S и пригородную электричку R2 Nord.",
      infoTextEn: "Airport Terminal 2 hub. Connects the L9 Sud metro line and the R2 Nord suburban train route."
    }
  },
  {
    id: "sant_cugat",
    name: "Sant Cugat",
    lat: 41.4722,
    lng: 2.0850,
    lines: ["R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "FGC Sant Cugat",
      infoTextRu: "Станция пригородных поездов в зеленой зоне Сант-Кугат-дель-Вальес. Переход на поезда FGC в Барселону.",
      infoTextEn: "Rodalies station in Sant Cugat del Vallès. Short walk to FGC station for connections to Barcelona center."
    }
  },
  {
    id: "rubi",
    name: "Rubí",
    lat: 41.4880,
    lng: 2.0180,
    lines: ["R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "FGC Rubí",
      infoTextRu: "Железнодорожная станция Rodalies в городе Руби на линии R8, соединяющей Марторель и Гранольерс.",
      infoTextEn: "Rodalies train station in Rubí on the R8 line linking Martorell and Granollers."
    }
  },
  {
    id: "el_prat_estacio",
    name: "El Prat Estació",
    lat: 41.3314,
    lng: 2.0911,
    lines: ["L9S", "R2"],
    type: "both",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "L9 Sud, Rodalies R2",
      infoTextRu: "Пересадочный узел в центре города Эль-Прат-де-Льобрегат, обеспечивающий легкий доступ к аэропорту.",
      infoTextEn: "Interchange station in El Prat de Llobregat center, offering quick transit options to the airport."
    }
  },
  {
    id: "granollers_centre",
    name: "Granollers Centre",
    lat: 41.5997,
    lng: 2.2883,
    lines: ["R2", "R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "R2, R8",
      infoTextRu: "Крупная железнодорожная станция в городе Гранольерс, хаб для линий R2 и R8.",
      infoTextEn: "Major train station in Granollers, serving as a hub for Rodalies lines R2 and R8."
    }
  },
  {
    id: "l_hospitalet",
    name: "L'Hospitalet de Llobregat",
    lat: 41.3592,
    lng: 2.0997,
    lines: ["R1", "R3", "R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "R1, R3, R4, Metro L1 (Rambla Just Oliveras)",
      infoTextRu: "Крупная пригородная станция в Госпиталете, конечная для многих поездов линий R1 и R3.",
      infoTextEn: "Major suburban station in L'Hospitalet, terminus for many R1 and R3 trains."
    }
  },
  {
    id: "badalona_rodalies",
    name: "Badalona (Rodalies)",
    lat: 41.4428,
    lng: 2.2536,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Железнодорожная пригородная станция в Бадалоне на побережье линии R1.",
      infoTextEn: "Suburban railway station in Badalona along the coastal R1 line."
    }
  },
  {
    id: "estacio_de_franca",
    name: "Estació de França",
    lat: 41.3838,
    lng: 2.1864,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "Metro L4 (Barceloneta)",
      infoTextRu: "Исторический вокзал Барселоны с красивой металлической крышей. Конечная для поездов R2 Sud.",
      infoTextEn: "Historic railway station in Barcelona with grand iron ceilings. Terminus for R2 Sud trains."
    }
  },
  {
    id: "sant_andreu_rodalies",
    name: "Sant Andreu (Rodalies)",
    lat: 41.4350,
    lng: 2.1917,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "Metro L1 (Sant Andreu)",
      infoTextRu: "Железнодорожная станция в районе Сант-Андреу, полностью реконструирована под землю.",
      infoTextEn: "Suburban train station in Sant Andreu district, fully reconstructed underground."
    }
  },
  {
    id: "gava",
    name: "Gavà",
    lat: 41.3060,
    lng: 2.0125,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Станция в пригородном городе Гава на линии R2 Sud.",
      infoTextEn: "Suburban station in Gavà town on the R2 Sud line."
    }
  },
  {
    id: "viladecans",
    name: "Viladecans",
    lat: 41.3142,
    lng: 2.0317,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Пригородная станция в городе Виладеканс на южной ветке R2.",
      infoTextEn: "Suburban station serving Viladecans on the southern R2 branch."
    }
  },
  {
    id: "sitges",
    name: "Sitges",
    lat: 41.2403,
    lng: 1.8105,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Станция в живописном туристическом городе Сиджес на побережье Коста-Дорада.",
      infoTextEn: "Train station in the scenic coastal tourist town of Sitges."
    }
  },
  {
    id: "vilanova_i_la_geltru",
    name: "Vilanova i la Geltrú",
    lat: 41.2203,
    lng: 1.7303,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Конечная станция многих поездов R2 Sud в городе Виланова-и-ла-Желтру.",
      infoTextEn: "Terminus of many R2 Sud trains in Vilanova i la Geltrú."
    }
  },
  {
    id: "sant_vicenc_de_calders",
    name: "Sant Vicenç de Calders",
    lat: 41.1822,
    lng: 1.5283,
    lines: ["R2", "R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "R2, R4, Regional Trains",
      infoTextRu: "Крупный железнодорожный узел на юге Каталонии, конечная для линий R2 Sud и R4.",
      infoTextEn: "Major railway junction in southern Catalonia, terminus for R2 Sud and R4 lines."
    }
  },
  {
    id: "molins_de_rei",
    name: "Molins de Rei",
    lat: 41.4089,
    lng: 2.0161,
    lines: ["R1", "R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "R1, R4",
      infoTextRu: "Станция в городе Молинс-де-Рей, конечная для поездов линии R1.",
      infoTextEn: "Suburban station in Molins de Rei, terminus for the R1 line."
    }
  },
  {
    id: "martorell",
    name: "Martorell",
    lat: 41.4744,
    lng: 1.9214,
    lines: ["R4", "R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "R4, R8, FGC Lines",
      infoTextRu: "Важный пригородный узел в городе Марторель, соединяющий линии R4 и R8 с поездами FGC.",
      infoTextEn: "Important suburban hub in Martorell, connecting R4 and R8 lines with FGC trains."
    }
  },
  {
    id: "castellbisbal",
    name: "Castellbisbal",
    lat: 41.4800,
    lng: 1.9778,
    lines: ["R4", "R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "R4, R8",
      infoTextRu: "Станция в Кастельбисбаль, обслуживающая пересечение линий R4 и R8.",
      infoTextEn: "Station in Castellbisbal serving the intersection of R4 and R8 lines."
    }
  },
  {
    id: "cerdanyola_del_valles",
    name: "Cerdanyola del Vallès",
    lat: 41.4914,
    lng: 2.1464,
    lines: ["R4", "R7"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "R4, R7",
      infoTextRu: "Железнодорожная пригородная станция в Сарданьоле, обслуживает линии R4 и R7.",
      infoTextEn: "Suburban train station in Cerdanyola, serving lines R4 and R7."
    }
  },
  {
    id: "cerdanyola_universitat",
    name: "Cerdanyola Universitat",
    lat: 41.5028,
    lng: 2.1097,
    lines: ["R7", "R8"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "R7, R8, UAB Shuttle Buses",
      infoTextRu: "Станция у кампуса Автономного университета Барселоны (UAB). Популярна среди студентов.",
      infoTextEn: "Station next to the Autonomous University of Barcelona (UAB) campus. Highly popular with students."
    }
  },
  {
    id: "sant_adria_rodalies",
    name: "Sant Adrià de Besòs (Rodalies)",
    lat: 41.4233,
    lng: 2.2333,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "Tram T4/T6",
      infoTextRu: "Станция пригородных поездов в Сант-Адриа-де-Безос, обеспечивающая пересадку на трамваи.",
      infoTextEn: "Suburban train station in Sant Adrià de Besòs, with connections to Tram routes."
    }
  },
  {
    id: "el_masnou",
    name: "El Masnou",
    lat: 41.4789,
    lng: 2.3164,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Пригородная станция на побережье Маресме в городе Эль-Масноу.",
      infoTextEn: "Suburban coastal station in El Masnou town on the R1 line."
    }
  },
  {
    id: "premia_de_mar",
    name: "Premià de Mar",
    lat: 41.4889,
    lng: 2.3614,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Железнодорожная пригородная станция на пляжной линии в Премья-де-Мар.",
      infoTextEn: "Suburban beachside railway station in Premià de Mar."
    }
  },
  {
    id: "vilassar_de_mar",
    name: "Vilassar de Mar",
    lat: 41.5033,
    lng: 2.3997,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Станция в приморском городе Виласар-де-Мар.",
      infoTextEn: "Coastal station in Vilassar de Mar."
    }
  },
  {
    id: "arenys_de_mar",
    name: "Arenys de Mar",
    lat: 41.5786,
    lng: 2.5483,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Промежуточная конечная пригородная станция в Аренис-де-Мар.",
      infoTextEn: "Coastal town train station and intermediate terminus in Arenys de Mar."
    }
  },
  {
    id: "calella",
    name: "Calella",
    lat: 41.6125,
    lng: 2.6586,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Популярная туристическая станция в Калелье на побережье Коста-дель-Маресме.",
      infoTextEn: "Popular tourist train station in Calella along the Maresme coast."
    }
  },
  {
    id: "blanes",
    name: "Blanes",
    lat: 41.6744,
    lng: 2.7753,
    lines: ["R1"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Конечная станция пригородной сети Барселоны в Бланесе — воротах побережья Коста-Брава.",
      infoTextEn: "Terminus of the Barcelona suburban network in Blanes, portal of Costa Brava."
    }
  },
  {
    id: "macanet_massanes",
    name: "Maçanet-Massanes",
    lat: 41.7744,
    lng: 2.6711,
    lines: ["R1", "R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "R1, R2, Regional Trains",
      infoTextRu: "Самый северный пригородный узел, соединяющий линии R1 и R2 Nord с региональными поездами.",
      infoTextEn: "Northernmost suburban interchange linking R1 and R2 Nord lines with regional trains."
    }
  },
  {
    id: "montcada_bifurcacio",
    name: "Montcada Bifurcació",
    lat: 41.4633,
    lng: 2.1803,
    lines: ["R3", "R4", "R7"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "R3, R4, R7",
      infoTextRu: "Крупная узловая станция пригородных путей в Монкаде.",
      infoTextEn: "Major railway junction station for Rodalies lines in Montcada."
    }
  },
  {
    id: "vic",
    name: "Vic",
    lat: 41.9333,
    lng: 2.2581,
    lines: ["R3"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Историческая пригородная станция в столице комарки Озона — городе Вик на линии R3.",
      infoTextEn: "Historic train station in Vic, capital of Osona comarca, on the R3 line."
    }
  },
  {
    id: "ripoll",
    name: "Ripoll",
    lat: 42.2006,
    lng: 2.1931,
    lines: ["R3"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Станция пригородных поездов в горном городе Риполь на севере линии R3.",
      infoTextEn: "Train station in the mountain town of Ripoll along the northern stretch of R3."
    }
  },
  {
    id: "puigcerda",
    name: "Puigcerdà",
    lat: 42.4314,
    lng: 1.9256,
    lines: ["R3"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "SNCF French Trains",
      infoTextRu: "Приграничная станция в Пиренеях в городе Пучсерда. Конечная для поездов R3.",
      infoTextEn: "Pyrenees border railway station in Puigcerdà. Terminus for the R3 route."
    }
  },
  {
    id: "vilafranca_del_penedes",
    name: "Vilafranca del Penedès",
    lat: 41.3436,
    lng: 1.6992,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Крупная подземная станция в столице винодельческого региона Вилафранка-дель-Пенедес.",
      infoTextEn: "Major underground station in the wine capital Vilafranca del Penedès."
    }
  },
  {
    id: "manresa",
    name: "Manresa",
    lat: 41.7222,
    lng: 1.8317,
    lines: ["R4"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "FGC Manresa-Alta",
      infoTextRu: "Конечная железнодорожная станция пригородной ветки R4 в городе Манреса.",
      infoTextEn: "Terminus of the R4 Rodalies train line in the city of Manresa."
    }
  },
  {
    id: "montcada_i_reixac",
    name: "Montcada i Reixac",
    lat: 41.4842,
    lng: 2.1883,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Железнодорожная пригородная станция в Монкада-и-Решак на ветке R2.",
      infoTextEn: "Suburban railway station in Montcada i Reixac on the R2 line."
    }
  },
  {
    id: "mollet_sant_fost",
    name: "Mollet - Sant Fost",
    lat: 41.5319,
    lng: 2.2225,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: false,
      transfers: "None",
      infoTextRu: "Станция пригородных поездов в Мольет-дель-Вальес на линии R2 Nord.",
      infoTextEn: "Suburban train station serving Mollet del Vallès on the R2 Nord line."
    }
  },
  {
    id: "sant_celoni",
    name: "Sant Celoni",
    lat: 41.6917,
    lng: 2.4914,
    lines: ["R2"],
    type: "rodalies",
    generalInfo: {
      accessibility: true,
      escalators: true,
      transfers: "None",
      infoTextRu: "Крупная пригородная станция и промежуточная конечная для линии R2 Nord в Сант-Селони.",
      infoTextEn: "Major suburban station and intermediate terminus for R2 Nord in Sant Celoni."
    }
  }
];;

export const getStationById = (id: string): Station | undefined => {
  return STATIONS.find(s => s.id === id);
};

export const getStationsByLine = (lineId: string): Station[] => {
  return STATIONS.filter(s => s.lines.includes(lineId));
};
