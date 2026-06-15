export type Language = "ru" | "en" | "es" | "fr";

export interface TranslationSchema {
  tabs: {
    map: string;
    list: string;
    favorites: string;
    profile: string;
  };
  common: {
    all: string;
    metro: string;
    rodalies: string;
    alerts: string;
    search: string;
    empty: string;
    save: string;
    loading: string;
    yes: string;
    no: string;
    cancel: string;
    close: string;
    hide: string;
    you: string;
  };
  station: {
    about: string;
    accessibility: string;
    escalators: string;
    transfers: string;
    noAlerts: string;
    favoriteBtn: string;
    activeAlerts: string;
    commentsCount: string;
    addCommentPlaceholder: string;
    commentBtn: string;
    deleteBtn: string;
    flagBtn: string;
    noComments: string;
    minutesAgo: string;
    justNow: string;
    currentStatus: string;
    editDetails: string;
    editInfo: string;
    descRu: string;
    descEn: string;
    photoUrl: string;
    saveChanges: string;
    noInfo: string;
    loginToContribute: string;
  };
  report: {
    infoBox: string;
    labelType: string;
    labelDesc: string;
    descPlaceholder: string;
    cooldownWait: string;
    submitBtn: string;
    success: string;
    error: string;
    softBanned: string;
  };
  controls: {
    gossos: { label: string; desc: string };
    pregunta: { label: string; desc: string };
    gorilles: { label: string; desc: string };
    lliure: { label: string; desc: string };
    delay: { label: string; desc: string };
    closed: { label: string; desc: string };
    other: { label: string; desc: string };
  };
  list: {
    filters: string;
    reset: string;
    selectAll: string;
    clearAll: string;
    toggleAll: string;
    lines: string;
    show: string;
    metroSystem: string;
    rodaliesSystem: string;
    metroStations: string;
    rodaliesStations: string;
    alertAll: string;
    alertLliure: string;
    alertGossos: string;
    alertPregunta: string;
    alertGorilles: string;
    alertDelay: string;
    alertClosed: string;
  };
  profile: {
    title: string;
    sub: string;
    username: string;
    created: string;
    deviceId: string;
    stats: string;
    statsReports: string;
    statsComments: string;
    langTitle: string;
    tgTitle: string;
    tgText: string;
    tgHow: string;
    loginTitle: string;
    loginSub: string;
    loginEmail: string;
    loginPassword: string;
    loginBtn: string;
    logoutBtn: string;
    registerLink: string;
    registerTitle: string;
    registerUsername: string;
    adminTitle: string;
    adminTicker: string;
    adminTickerSave: string;
    adminUsers: string;
    makeAdmin: string;
    removeAdmin: string;
    locateBtn: string;
  };
  map: {
    layerAll: string;
    layerHide: string;
    filters: string;
  };
  favorites: {
    title: string;
    empty: string;
    emptyHint: string;
    clear: string;
    delay: string;
    closed: string;
    ticketCheck: string;
    clear2: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  // ─────────────────────────────────────────── RUSSIAN
  ru: {
    tabs: { map: "Карта", list: "Список", favorites: "Любимые", profile: "Профиль" },
    common: {
      all: "Все", metro: "Ⓜ️ Метро", rodalies: "🟠 Rodalies",
      alerts: "⚠️ Проверки", search: "Поиск станций...", empty: "Список пуст",
      save: "Сохранить", loading: "Загрузка...", yes: "Доступно", no: "Отсутствует",
      cancel: "Отмена", close: "Закрыть", hide: "Скрыть", you: "(Вы)",
    },
    station: {
      about: "О станции", accessibility: "Лифты / Пандусы", escalators: "Эскалаторы",
      transfers: "Пересадки",
      noAlerts: "Активных проверок и задержек на станции нет. Всё чисто!",
      favoriteBtn: "В избранное", activeAlerts: "Текущие оповещения",
      commentsCount: "Сообщество", addCommentPlaceholder: "Напишите комментарий о станции...",
      commentBtn: "Отправить", deleteBtn: "Удалить", flagBtn: "Пожаловаться",
      noComments: "Никаких комментариев пока нет. Будьте первыми!",
      minutesAgo: "мин назад", justNow: "только что",
      currentStatus: "Текущий статус", editDetails: "Редактирование",
      editInfo: "Редактировать", descRu: "Описание (Русский)",
      descEn: "Описание (Английский)", photoUrl: "Ссылка на фото",
      saveChanges: "Сохранить", noInfo: "Информация об этой станции пока не добавлена.",
      loginToContribute: "Войдите в аккаунт в разделе Профиль, чтобы оставлять комментарии и сообщать о статусе станции.",
    },
    report: {
      infoBox: "Ваша жалоба поможет другим пассажирам! Пожалуйста, выбирайте корректный тип и пишите подробности. Она будет видна 2 часа.",
      labelType: "Тип предупреждения", labelDesc: "Описание (детали)",
      descPlaceholder: "Пример: стоят контролеры у турникетов на выход, 4 человека.",
      cooldownWait: "Пожалуйста подождите", submitBtn: "Отправить предупреждение",
      success: "Успешно отправлено!", error: "Ошибка при отправке.",
      softBanned: "Аккаунт временно заблокирован из-за жалоб.",
    },
    controls: {
      gossos: { label: "👮 Gossos (Собаки)", desc: "Инспекторы метрополитена проводят рейды с обученными служебными собаками для выявления нарушителей." },
      pregunta: { label: "❔ Pregunta (Опрос/Контроль)", desc: "Информационная проверка билетов или опрос пассажиров на входе перед турникетами или на пересадках." },
      gorilles: { label: "🦺 Goril·les (Охрана)", desc: "Сотрудники частной охранной службы (Securitas и др.) в жилетах. Стоят на выходах или патрулируют станцию." },
      lliure: { label: "💚 Lliure (Свободно)", desc: "Станция полностью чиста. Никаких проверок билетов, охраны или задержек не обнаружено." },
      delay: { label: "🕐 Задержка поезда", desc: "Поезда задерживаются или стоят в туннеле." },
      closed: { label: "🔒 Closed (Закрыто)", desc: "Станция или вход на станцию временно закрыты по техническим причинам, из-за забастовки или безопасности." },
      other: { label: "ℹ️ Прочее происшествие", desc: "Другое событие или ситуация, требующая внимания." },
    },
    list: {
      filters: "Фильтры", reset: "Сбросить", selectAll: "Выбрать все",
      clearAll: "Сбросить все", toggleAll: "Все / Сбросить", lines: "Линии",
      show: "Показать", metroSystem: "Метро (TMB)", rodaliesSystem: "Пригородные (Rodalies)",
      metroStations: "Станции метро", rodaliesStations: "Пригородные станции",
      alertAll: "Все", alertLliure: "Чисто ✓", alertGossos: "Gossos 🐕",
      alertPregunta: "Опрос ❔", alertGorilles: "Охрана 🦺", alertDelay: "Задержка ⏱",
      alertClosed: "Закрыто 🔒",
    },
    profile: {
      title: "Мой профиль", sub: "Управление профилем и статистика активности.",
      username: "Имя пользователя", created: "В приложении с", deviceId: "ID Вашего Устройства",
      stats: "Ваша статистика", statsReports: "Отчеты", statsComments: "Комментарии",
      langTitle: "Язык приложения", tgTitle: "Интеграция с Telegram",
      tgText: "Наше приложение поддерживает автоматический парсинг сообщений из Telegram-чата. Бот считывает текст и наносит точки на карту.",
      tgHow: "Как настроить: подключите бота к вебхуку по адресу:",
      loginTitle: "Войти", loginSub: "Войдите чтобы сохранять репорты и комментарии",
      loginEmail: "Email", loginPassword: "Пароль", loginBtn: "Войти",
      logoutBtn: "Выйти", registerLink: "Нет аккаунта? Зарегистрироваться",
      registerTitle: "Регистрация", registerUsername: "Имя пользователя",
      adminTitle: "Панель администратора", adminTicker: "Текст рекламной полосы",
      adminTickerSave: "Сохранить текст", adminUsers: "Управление пользователями",
      makeAdmin: "Сделать администратором", removeAdmin: "Снять права", locateBtn: "Найти меня",
    },
    map: { layerAll: "Все", layerHide: "Скрыть", filters: "Фильтры" },
    favorites: {
      title: "Избранные станции", empty: "Нет избранных станций",
      emptyHint: "Добавляйте станции в избранное, нажав ♡ в карточке станции.",
      clear: "Очистить", delay: "Задержка поездов", closed: "Закрыто",
      ticketCheck: "Контроль билетов", clear2: "Свободно",
    },
  },

  // ─────────────────────────────────────────── ENGLISH
  en: {
    tabs: { map: "Map", list: "List", favorites: "Favorites", profile: "Profile" },
    common: {
      all: "All", metro: "Ⓜ️ Metro", rodalies: "🟠 Rodalies",
      alerts: "⚠️ Warnings", search: "Search stations...", empty: "List is empty",
      save: "Save", loading: "Loading...", yes: "Available", no: "Not available",
      cancel: "Cancel", close: "Close", hide: "Hide", you: "(You)",
    },
    station: {
      about: "About Station", accessibility: "Elevator access", escalators: "Escalators",
      transfers: "Transfers",
      noAlerts: "No active ticket checks or delays here. All clear!",
      favoriteBtn: "Add to favorites", activeAlerts: "Active Warnings",
      commentsCount: "Community", addCommentPlaceholder: "Write a comment about this station...",
      commentBtn: "Post", deleteBtn: "Delete", flagBtn: "Report spam",
      noComments: "No comments yet. Be the first to share!",
      minutesAgo: "m ago", justNow: "just now",
      currentStatus: "Current Status", editDetails: "Edit Details",
      editInfo: "Edit Info", descRu: "Description (Russian)",
      descEn: "Description (English)", photoUrl: "Photo URL",
      saveChanges: "Save Changes", noInfo: "No information added for this station yet.",
      loginToContribute: "Log in via the Profile tab to leave comments and update station status.",
    },
    report: {
      infoBox: "Your report helps other passengers! Please select the correct warning type and add details. It will be visible for 2 hours.",
      labelType: "Warning Type", labelDesc: "Description (details)",
      descPlaceholder: "Example: 4 controllers checking at L2 exit gates.",
      cooldownWait: "Please wait", submitBtn: "Submit Warning",
      success: "Report submitted successfully!", error: "Error submitting report.",
      softBanned: "Account temporarily suspended due to reports.",
    },
    controls: {
      gossos: { label: "👮 Gossos (Dogs)", desc: "Metro inspectors carrying out ticket check raids accompanied by trained guard dogs." },
      pregunta: { label: "❔ Pregunta (Check/Inquiry)", desc: "Active ticket control check or user inquiries at the entrance gates or interchange halls." },
      gorilles: { label: "🦺 Goril·les (Security)", desc: "Private security guards (Securitas, etc.) wearing high-vis vests stationed at gates or patrolling platforms." },
      lliure: { label: "💚 Lliure (Clear)", desc: "The station is completely clear. No ticket inspectors, security, or train delays present." },
      delay: { label: "🕐 Train Delay", desc: "Trains are experiencing delays or stopped in the tunnel." },
      closed: { label: "🔒 Closed", desc: "The station or entrance is temporarily closed due to technical issues, strike, or security reasons." },
      other: { label: "ℹ️ Other Incident", desc: "Another event or situation requiring attention." },
    },
    list: {
      filters: "Filters", reset: "Reset", selectAll: "Select all",
      clearAll: "Clear all", toggleAll: "All / Clear", lines: "Lines",
      show: "Show", metroSystem: "Metro (TMB)", rodaliesSystem: "Rodalies",
      metroStations: "Metro Stations", rodaliesStations: "Rodalies Stations",
      alertAll: "All", alertLliure: "Clear ✓", alertGossos: "Gossos 🐕",
      alertPregunta: "Check ❔", alertGorilles: "Security 🦺", alertDelay: "Delay ⏱",
      alertClosed: "Closed 🔒",
    },
    profile: {
      title: "My Profile", sub: "Manage profile settings and view contribution stats.",
      username: "Username", created: "Joined on", deviceId: "Your Device ID",
      stats: "Your Contribution Stats", statsReports: "Reports", statsComments: "Comments",
      langTitle: "App Language", tgTitle: "Telegram Integration",
      tgText: "Our app supports automatic warning parsing from Telegram chats. The bot reads message texts and plots alerts on the map.",
      tgHow: "How to setup: connect your Telegram bot webhook to this URL:",
      loginTitle: "Sign In", loginSub: "Sign in to save reports and comments",
      loginEmail: "Email", loginPassword: "Password", loginBtn: "Sign In",
      logoutBtn: "Sign Out", registerLink: "No account? Register",
      registerTitle: "Register", registerUsername: "Username",
      adminTitle: "Admin Panel", adminTicker: "Ad ticker text",
      adminTickerSave: "Save text", adminUsers: "User management",
      makeAdmin: "Make admin", removeAdmin: "Remove admin", locateBtn: "Locate me",
    },
    map: { layerAll: "All", layerHide: "Hide", filters: "Filters" },
    favorites: {
      title: "Saved Stations", empty: "No saved stations",
      emptyHint: "Add stations to favorites by tapping ♡ in the station card.",
      clear: "Clear", delay: "Train delays", closed: "Closed",
      ticketCheck: "Ticket check", clear2: "Clear",
    },
  },

  // ─────────────────────────────────────────── SPANISH
  es: {
    tabs: { map: "Mapa", list: "Lista", favorites: "Favoritos", profile: "Perfil" },
    common: {
      all: "Todos", metro: "Ⓜ️ Metro", rodalies: "🟠 Rodalies",
      alerts: "⚠️ Controles", search: "Buscar estaciones...", empty: "La lista está vacía",
      save: "Guardar", loading: "Cargando...", yes: "Disponible", no: "No disponible",
      cancel: "Cancelar", close: "Cerrar", hide: "Ocultar", you: "(Tú)",
    },
    station: {
      about: "Sobre la estación", accessibility: "Ascensores / Rampas",
      escalators: "Escaleras mecánicas", transfers: "Transbordos",
      noAlerts: "No hay controles ni retrasos activos aquí. ¡Todo despejado!",
      favoriteBtn: "Añadir a favoritos", activeAlerts: "Alertas activas",
      commentsCount: "Comunidad", addCommentPlaceholder: "Escribe un comentario sobre esta estación...",
      commentBtn: "Publicar", deleteBtn: "Eliminar", flagBtn: "Reportar spam",
      noComments: "No hay comentarios aún. ¡Sé el primero en escribir!",
      minutesAgo: "min antes", justNow: "ahora mismo",
      currentStatus: "Estado actual", editDetails: "Editar detalles",
      editInfo: "Editar info", descRu: "Descripción (Ruso)",
      descEn: "Descripción (Inglés)", photoUrl: "URL de foto",
      saveChanges: "Guardar cambios", noInfo: "Aún no se ha añadido información de esta estación.",
      loginToContribute: "Inicia sesión en la pestaña Perfil para dejar comentarios y actualizar el estado de la estación.",
    },
    report: {
      infoBox: "¡Tu reporte ayuda a otros pasajeros! Elige el tipo de control correcto y añade detalles. Será visible durante 2 horas.",
      labelType: "Tipo de alerta", labelDesc: "Descripción (detalles)",
      descPlaceholder: "Ejemplo: hay revisores controlando en la salida de L2.",
      cooldownWait: "Por favor espera", submitBtn: "Enviar alerta",
      success: "¡Alerta enviada correctamente!", error: "Error al enviar la alerta.",
      softBanned: "Cuenta suspendida temporalmente por denuncias.",
    },
    controls: {
      gossos: { label: "👮 Gossos (Perros)", desc: "Inspectores del metro realizando redadas de control acompañados por perros adiestrados." },
      pregunta: { label: "❔ Pregunta (Control/Consulta)", desc: "Control de billetes en los accesos de entrada o consultas informativas a pasajeros en transbordos." },
      gorilles: { label: "🦺 Goril·les (Seguridad)", desc: "Vigilantes de seguridad privada (Securitas, etc.) con chalecos de alta visibilidad en tornos o andenes." },
      lliure: { label: "💚 Lliure (Limpio)", desc: "La estación está totalmente limpia. No hay revisores, seguridad ni retrasos de trenes." },
      delay: { label: "🕐 Retraso de tren", desc: "Los trenes tienen retrasos o están parados en el túnel." },
      closed: { label: "🔒 Cerrado", desc: "La estación o el acceso está temporalmente cerrado por motivos técnicos, huelga o seguridad." },
      other: { label: "ℹ️ Otro incidente", desc: "Otro evento o situación que requiere atención." },
    },
    list: {
      filters: "Filtros", reset: "Restablecer", selectAll: "Seleccionar todo",
      clearAll: "Borrar todo", toggleAll: "Todo / Borrar", lines: "Líneas",
      show: "Mostrar", metroSystem: "Metro (TMB)", rodaliesSystem: "Rodalies",
      metroStations: "Estaciones de metro", rodaliesStations: "Estaciones Rodalies",
      alertAll: "Todo", alertLliure: "Limpio ✓", alertGossos: "Gossos 🐕",
      alertPregunta: "Control ❔", alertGorilles: "Seguridad 🦺", alertDelay: "Retraso ⏱",
      alertClosed: "Cerrado 🔒",
    },
    profile: {
      title: "Mi Perfil", sub: "Gestiona tu configuración y consulta estadísticas de contribución.",
      username: "Nombre de usuario", created: "En la app desde", deviceId: "ID de tu dispositivo",
      stats: "Tus estadísticas", statsReports: "Reportes", statsComments: "Comentarios",
      langTitle: "Idioma de la app", tgTitle: "Integración con Telegram",
      tgText: "Nuestra app admite el análisis automático de alertas desde chats de Telegram. El bot lee textos y añade puntos al mapa.",
      tgHow: "Cómo configurar: conecta el webhook de tu bot de Telegram a esta URL:",
      loginTitle: "Iniciar sesión", loginSub: "Inicia sesión para guardar reportes y comentarios",
      loginEmail: "Email", loginPassword: "Contraseña", loginBtn: "Entrar",
      logoutBtn: "Cerrar sesión", registerLink: "¿Sin cuenta? Regístrate",
      registerTitle: "Registro", registerUsername: "Nombre de usuario",
      adminTitle: "Panel de administrador", adminTicker: "Texto del banner publicitario",
      adminTickerSave: "Guardar texto", adminUsers: "Gestión de usuarios",
      makeAdmin: "Hacer administrador", removeAdmin: "Quitar permisos", locateBtn: "Localizarme",
    },
    map: { layerAll: "Todos", layerHide: "Ocultar", filters: "Filtros" },
    favorites: {
      title: "Estaciones guardadas", empty: "Sin estaciones guardadas",
      emptyHint: "Añade estaciones a favoritos pulsando ♡ en la tarjeta de la estación.",
      clear: "Borrar", delay: "Retraso de trenes", closed: "Cerrado",
      ticketCheck: "Control de billetes", clear2: "Limpio",
    },
  },

  // ─────────────────────────────────────────── FRENCH
  fr: {
    tabs: { map: "Carte", list: "Liste", favorites: "Favoris", profile: "Profil" },
    common: {
      all: "Tout", metro: "Ⓜ️ Métro", rodalies: "🟠 Rodalies",
      alerts: "⚠️ Contrôles", search: "Rechercher...", empty: "La liste est vide",
      save: "Enregistrer", loading: "Chargement...", yes: "Disponible", no: "Indisponible",
      cancel: "Annuler", close: "Fermer", hide: "Masquer", you: "(Vous)",
    },
    station: {
      about: "À propos de la station", accessibility: "Ascenseurs / Rampas",
      escalators: "Escaliers mécaniques", transfers: "Correspondances",
      noAlerts: "Pas de contrôle ni de retard signalé ici. Tout est calme !",
      favoriteBtn: "Ajouter aux favoris", activeAlerts: "Alertes actives",
      commentsCount: "Communauté", addCommentPlaceholder: "Écrire un commentaire sur cette station...",
      commentBtn: "Publier", deleteBtn: "Supprimer", flagBtn: "Signaler spam",
      noComments: "Aucun commentaire pour l'instant. Soyez le premier !",
      minutesAgo: "min avant", justNow: "à l'instant",
      currentStatus: "Statut actuel", editDetails: "Modifier les détails",
      editInfo: "Modifier", descRu: "Description (Russe)",
      descEn: "Description (Anglais)", photoUrl: "URL de la photo",
      saveChanges: "Enregistrer les modifications", noInfo: "Aucune information ajoutée pour cette station.",
      loginToContribute: "Connectez-vous via l'onglet Profil pour laisser des commentaires et mettre à jour le statut.",
    },
    report: {
      infoBox: "Votre signalement aide les autres voyageurs ! Veuillez choisir le bon type d'alerte et donner des détails. Visible pendant 2 heures.",
      labelType: "Type de signalement", labelDesc: "Description (détails)",
      descPlaceholder: "Exemple: contrôleurs aux portiques.",
      cooldownWait: "Veuillez patienter", submitBtn: "Envoyer l'alerte",
      success: "Alerte envoyée avec succès !", error: "Erreur lors de l'envoi de l'alerte.",
      softBanned: "Compte temporairement suspendu suite à des signalements.",
    },
    controls: {
      gossos: { label: "👮 Gossos (Chiens)", desc: "Inspecteurs de métro effectuant des contrôles accompagnés de chiens de garde dressés." },
      pregunta: { label: "❔ Pregunta (Contrôle/Enquête)", desc: "Contrôle des billets ou enquête menée auprès des passagers devant les portiques ou dans les couloirs." },
      gorilles: { label: "🦺 Goril·les (Sécurité)", desc: "Gardiens de sécurité privée (Securitas, etc.) équipés de gilets de sécurité aux accès ou sur les quais." },
      lliure: { label: "💚 Lliure (Libre)", desc: "La station est complètement dégagée. Pas de contrôleurs, de vigiles ni de retards de train." },
      delay: { label: "🕐 Retard de train", desc: "Les trains subissent des retards ou sont arrêtés dans le tunnel." },
      closed: { label: "🔒 Fermé", desc: "La station ou l'accès est temporairement fermé pour des raisons techniques, grève ou sécurité." },
      other: { label: "ℹ️ Autre incident", desc: "Un autre événement ou situation nécessitant attention." },
    },
    list: {
      filters: "Filtres", reset: "Réinitialiser", selectAll: "Tout sélectionner",
      clearAll: "Tout déselectionner", toggleAll: "Tout / Effacer", lines: "Lignes",
      show: "Afficher", metroSystem: "Métro (TMB)", rodaliesSystem: "Rodalies",
      metroStations: "Stations de métro", rodaliesStations: "Stations Rodalies",
      alertAll: "Tout", alertLliure: "Libre ✓", alertGossos: "Gossos 🐕",
      alertPregunta: "Contrôle ❔", alertGorilles: "Sécurité 🦺", alertDelay: "Retard ⏱",
      alertClosed: "Fermé 🔒",
    },
    profile: {
      title: "Mon Profil", sub: "Gérez vos paramètres et consultez vos statistiques de contribution.",
      username: "Nom d'utilisateur", created: "Inscrit le", deviceId: "ID de votre appareil",
      stats: "Vos statistiques", statsReports: "Signalements", statsComments: "Commentaires",
      langTitle: "Langue de l'application", tgTitle: "Intégration Telegram",
      tgText: "Notre application prend en charge l'analyse automatique des alertes depuis les salons Telegram. Le bot lit les textes et affiche les points sur la carte.",
      tgHow: "Comment configurer: connectez le webhook de votre bot Telegram à cette URL:",
      loginTitle: "Se connecter", loginSub: "Connectez-vous pour sauvegarder vos signalements",
      loginEmail: "Email", loginPassword: "Mot de passe", loginBtn: "Se connecter",
      logoutBtn: "Se déconnecter", registerLink: "Pas de compte ? S'inscrire",
      registerTitle: "Inscription", registerUsername: "Nom d'utilisateur",
      adminTitle: "Panneau administrateur", adminTicker: "Texte du bandeau publicitaire",
      adminTickerSave: "Sauvegarder", adminUsers: "Gestion des utilisateurs",
      makeAdmin: "Rendre administrateur", removeAdmin: "Retirer les droits", locateBtn: "Me localiser",
    },
    map: { layerAll: "Tout", layerHide: "Masquer", filters: "Filtres" },
    favorites: {
      title: "Stations sauvegardées", empty: "Aucune station sauvegardée",
      emptyHint: "Ajoutez des stations en appuyant sur ♡ dans la fiche de la station.",
      clear: "Effacer", delay: "Retard de trains", closed: "Fermé",
      ticketCheck: "Contrôle de billets", clear2: "Libre",
    },
  },
};
