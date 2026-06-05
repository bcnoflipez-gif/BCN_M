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
  };
  controls: {
    gossos: { label: string; desc: string };
    mosquits: { label: string; desc: string };
    pregunta: { label: string; desc: string };
    gorilles: { label: string; desc: string };
    lliure: { label: string; desc: string };
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
  };
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  ru: {
    tabs: {
      map: "Карта",
      list: "Список",
      favorites: "Любимые",
      profile: "Профиль",
    },
    common: {
      all: "Все",
      metro: "Ⓜ️ Метро",
      rodalies: "🟠 Rodalies",
      alerts: "⚠️ Проверки",
      search: "Поиск станций...",
      empty: "Список пуст",
      save: "Сохранить",
      loading: "Загрузка...",
      yes: "Доступно",
      no: "Отсутствует",
      cancel: "Отмена",
      close: "Закрыть",
    },
    station: {
      about: "О станции",
      accessibility: "Лифты / Пандусы",
      escalators: "Эскалаторы",
      transfers: "Пересадки",
      noAlerts: "Активных проверок и задержек на станции нет. Всё чисто!",
      favoriteBtn: "В избранное",
      activeAlerts: "Текущие оповещения",
      commentsCount: "Сообщество",
      addCommentPlaceholder: "Напишите комментарий о станции...",
      commentBtn: "Отправить",
      deleteBtn: "Удалить",
      flagBtn: "Пожаловаться",
      noComments: "Никаких комментариев пока нет. Будьте первыми!",
      minutesAgo: "мин назад",
      justNow: "только что",
    },
    report: {
      infoBox: "Ваша жалоба поможет другим пассажирам! Пожалуйста, выбирайте корректный тип и пишите подробности. Она будет видна 2 часа.",
      labelType: "Тип предупреждения",
      labelDesc: "Описание (детали)",
      descPlaceholder: "Пример: стоят контролеры у турникетов на выход, 4 человека.",
      cooldownWait: "Пожалуйста подождите",
      submitBtn: "Отправить предупреждение",
      success: "Успешно отправлено!",
      error: "Ошибка при отправке.",
    },
    controls: {
      gossos: {
        label: "👮 Gossos (Собаки)",
        desc: "Инспекторы метрополитена проводят рейды с обученными служебными собаками для выявления нарушителей.",
      },
      mosquits: {
        label: "📛 Mosquits (В гражданском)",
        desc: "Билетные контролеры без форменной одежды. Работают скрытно в поездах и на платформах под видом обычных пассажиров.",
      },
      pregunta: {
        label: "❔ Pregunta (Опрос/Контроль)",
        desc: "Информационная проверка билетов или опрос пассажиров на входе перед турникетами или на пересадках.",
      },
      gorilles: {
        label: "🦺 Goril·les (Охрана)",
        desc: "Сотрудники частной охранной службы (Securitas и др.) в жилетах. Стоят на выходах или патрулируют станцию.",
      },
      lliure: {
        label: "💚 Lliure (Свободно)",
        desc: "Станция полностью чиста. Никаких проверок билетов, охраны или задержек не обнаружено.",
      },
    },
    profile: {
      title: "Мой профиль",
      sub: "Управление профилем и статистика активности.",
      username: "Имя пользователя",
      created: "В приложении с",
      deviceId: "ID Вашего Устройства",
      stats: "Ваша статистика",
      statsReports: "Отчеты",
      statsComments: "Комментарии",
      langTitle: "Язык приложения",
      tgTitle: "Интеграция с Telegram",
      tgText: "Наше приложение поддерживает автоматический парсинг сообщений из Telegram-чата. Бот считывает текст и наносит точки на карту.",
      tgHow: "Как настроить: подключите бота к вебхуку по адресу:",
    },
  },
  en: {
    tabs: {
      map: "Map",
      list: "List",
      favorites: "Favorites",
      profile: "Profile",
    },
    common: {
      all: "All",
      metro: "Ⓜ️ Metro",
      rodalies: "🟠 Rodalies",
      alerts: "⚠️ Warnings",
      search: "Search stations...",
      empty: "List is empty",
      save: "Save",
      loading: "Loading...",
      yes: "Available",
      no: "Not available",
      cancel: "Cancel",
      close: "Close",
    },
    station: {
      about: "About Station",
      accessibility: "Elevator access",
      escalators: "Escalators",
      transfers: "Transfers",
      noAlerts: "No active ticket checks or delays here. All clear!",
      favoriteBtn: "Add to favorites",
      activeAlerts: "Active Warnings",
      commentsCount: "Community",
      addCommentPlaceholder: "Write a comment about this station...",
      commentBtn: "Post",
      deleteBtn: "Delete",
      flagBtn: "Report spam",
      noComments: "No comments yet. Be the first to share!",
      minutesAgo: "m ago",
      justNow: "just now",
    },
    report: {
      infoBox: "Your report helps other passengers! Please select the correct warning type and add details. It will be visible for 2 hours.",
      labelType: "Warning Type",
      labelDesc: "Description (details)",
      descPlaceholder: "Example: 4 controllers in plain clothes checking at L2 exit gates.",
      cooldownWait: "Please wait",
      submitBtn: "Submit Warning",
      success: "Report submitted successfully!",
      error: "Error submitting report.",
    },
    controls: {
      gossos: {
        label: "👮 Gossos (Dogs)",
        desc: "Metro inspectors carrying out ticket check raids accompanied by trained guard dogs.",
      },
      mosquits: {
        label: "📛 Mosquits (Plainclothes)",
        desc: "Ticket controllers disguised in plain clothes (no uniforms). They check tickets in trains and near exits.",
      },
      pregunta: {
        label: "❔ Pregunta (Check/Inquiry)",
        desc: "Active ticket control check or user inquiries at the entrance gates or interchange halls.",
      },
      gorilles: {
        label: "🦺 Goril·les (Security)",
        desc: "Private security guards (Securitas, etc.) wearing high-vis vests stationed at gates or patrolling platforms.",
      },
      lliure: {
        label: "💚 Lliure (Clear)",
        desc: "The station is completely clear. No ticket inspectors, security, or train delays present.",
      },
    },
    profile: {
      title: "My Profile",
      sub: "Manage profile settings and view contribution stats.",
      username: "Username",
      created: "Joined on",
      deviceId: "Your Device ID",
      stats: "Your Contribution Stats",
      statsReports: "Reports",
      statsComments: "Comments",
      langTitle: "App Language",
      tgTitle: "Telegram Integration",
      tgText: "Our app supports automatic warning parsing from Telegram chats. The bot reads message texts and plots alerts on the map.",
      tgHow: "How to setup: connect your Telegram bot webhook to this URL:",
    },
  },
  es: {
    tabs: {
      map: "Mapa",
      list: "Lista",
      favorites: "Favoritos",
      profile: "Perfil",
    },
    common: {
      all: "Todos",
      metro: "Ⓜ️ Metro",
      rodalies: "🟠 Rodalies",
      alerts: "⚠️ Controles",
      search: "Buscar estaciones...",
      empty: "La lista está vacía",
      save: "Guardar",
      loading: "Cargando...",
      yes: "Disponible",
      no: "No disponible",
      cancel: "Cancelar",
      close: "Cerrar",
    },
    station: {
      about: "Sobre la estación",
      accessibility: "Ascensores / Rampas",
      escalators: "Escaleras mecánicas",
      transfers: "Transbordos",
      noAlerts: "No hay controles ni retrasos activos aquí. ¡Todo despejado!",
      favoriteBtn: "Añadir a favoritos",
      activeAlerts: "Alertas activas",
      commentsCount: "Comunidad",
      addCommentPlaceholder: "Escribe un comentario sobre esta estación...",
      commentBtn: "Publicar",
      deleteBtn: "Eliminar",
      flagBtn: "Reportar spam",
      noComments: "No hay comentarios aún. ¡Sé el primero en escribir!",
      minutesAgo: "min antes",
      justNow: "ahora mismo",
    },
    report: {
      infoBox: "¡Tu reporte ayuda a otros pasajeros! Elige el tipo de control correcto y añade detalles. Será visible durante 2 horas.",
      labelType: "Tipo de alerta",
      labelDesc: "Descripción (detalles)",
      descPlaceholder: "Ejemplo: hay 4 revisores de paisano controlando en la salida de L2.",
      cooldownWait: "Por favor espera",
      submitBtn: "Enviar alerta",
      success: "¡Alerta enviada correctamente!",
      error: "Error al enviar la alerta.",
    },
    controls: {
      gossos: {
        label: "👮 Gossos (Perros)",
        desc: "Inspectores del metro realizando redadas de control acompañados por perros adiestrados.",
      },
      mosquits: {
        label: "📛 Mosquits (De paisano)",
        desc: "Revisores de billetes vestidos de civil (sin uniforme). Actúan de incógnito en los trenes y andenes.",
      },
      pregunta: {
        label: "❔ Pregunta (Control/Consulta)",
        desc: "Control de billetes en los accesos de entrada o consultas informativas a pasajeros en transbordos.",
      },
      gorilles: {
        label: "🦺 Goril·les (Seguridad)",
        desc: "Vigilantes de seguridad privada (Securitas, etc.) con chalecos de alta visibilidad en tornos o andenes.",
      },
      lliure: {
        label: "💚 Lliure (Limpio)",
        desc: "La estación está totalmente limpia. No hay revisores, seguridad ni retrasos de trenes.",
      },
    },
    profile: {
      title: "Mi Perfil",
      sub: "Gestiona tu configuración y consulta estadísticas de contribución.",
      username: "Nombre de usuario",
      created: "En la app desde",
      deviceId: "ID de tu dispositivo",
      stats: "Tus estadísticas",
      statsReports: "Reportes",
      statsComments: "Comentarios",
      langTitle: "Idioma de la app",
      tgTitle: "Integración con Telegram",
      tgText: "Nuestra app admite el análisis automático de alertas desde chats de Telegram. El bot lee textos y añade puntos al mapa.",
      tgHow: "Cómo configurar: conecta el webhook de tu bot de Telegram a esta URL:",
    },
  },
  fr: {
    tabs: {
      map: "Carte",
      list: "Liste",
      favorites: "Favoris",
      profile: "Profil",
    },
    common: {
      all: "Tout",
      metro: "Ⓜ️ Métro",
      rodalies: "🟠 Rodalies",
      alerts: "⚠️ Contrôles",
      search: "Rechercher...",
      empty: "La liste est vide",
      save: "Enregistrer",
      loading: "Chargement...",
      yes: "Disponible",
      no: "Indisponible",
      cancel: "Annuler",
      close: "Fermer",
    },
    station: {
      about: "À propos de la station",
      accessibility: "Ascenseurs / Rampes",
      escalators: "Escaliers mécaniques",
      transfers: "Correspondances",
      noAlerts: "Pas de contrôle ni de retard signalé ici. Tout est calme !",
      favoriteBtn: "Ajouter aux favoris",
      activeAlerts: "Alertes actives",
      commentsCount: "Communauté",
      addCommentPlaceholder: "Écrire un commentaire sur cette station...",
      commentBtn: "Publier",
      deleteBtn: "Supprimer",
      flagBtn: "Signaler spam",
      noComments: "Aucun commentaire pour l'instant. Soyez le premier !",
      minutesAgo: "min avant",
      justNow: "à l'instant",
    },
    report: {
      infoBox: "Votre signalement aide les autres voyageurs ! Veuillez choisir le bon type d'alerte et donner des détails. Visible pendant 2 heures.",
      labelType: "Type de signalement",
      labelDesc: "Description (détails)",
      descPlaceholder: "Exemple: 4 contrôleurs en civil à la sortie de la ligne L2.",
      cooldownWait: "Veuillez patienter",
      submitBtn: "Envoyer l'alerte",
      success: "Alerte envoyée avec succès !",
      error: "Erreur lors de l'envoi de l'alerte.",
    },
    controls: {
      gossos: {
        label: "👮 Gossos (Chiens)",
        desc: "Inspecteurs de métro effectuant des contrôles accompagnés de chiens de garde dressés.",
      },
      mosquits: {
        label: "📛 Mosquits (En civil)",
        desc: "Contrôleurs de billets en civil (sans uniforme). Ils opèrent discrètement dans les rames et près des sorties.",
      },
      pregunta: {
        label: "❔ Pregunta (Contrôle/Enquête)",
        desc: "Contrôle des billets ou enquête menée auprès des passagers devant les portiques ou dans les couloirs.",
      },
      gorilles: {
        label: "🦺 Goril·les (Sécurité)",
        desc: "Gardiens de sécurité privée (Securitas, etc.) équipés de gilets de sécurité aux accès ou sur les quais.",
      },
      lliure: {
        label: "💚 Lliure (Libre)",
        desc: "La station est complètement dégagée. Pas de contrôleurs, de vigiles ni de retards de train.",
      },
    },
    profile: {
      title: "Mon Profil",
      sub: "Gérez vos paramètres et consultez vos statistiques de contribution.",
      username: "Nom d'utilisateur",
      created: "Inscrit le",
      deviceId: "ID de votre appareil",
      stats: "Vos statistiques",
      statsReports: "Signalements",
      statsComments: "Commentaires",
      langTitle: "Langue de l'application",
      tgTitle: "Intégration Telegram",
      tgText: "Notre application prend en charge l'analyse automatique des alertes depuis les salons Telegram. Le bot lit les textes et affiche les points sur la carte.",
      tgHow: "Comment configurer: connectez le webhook de votre bot Telegram à cette URL:",
    },
  },
};
