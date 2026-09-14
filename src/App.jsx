import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import {
  ArrowRight, ArrowUpRight, Brain, ChartLineUp, ChatCircleDots, Check,
  Compass, Heart, Leaf, Lightbulb, List, Pulse, Sparkle, Strategy, BookOpen,
  UsersThree, X,
} from "@phosphor-icons/react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import "./styles.css";

const dimensions = [
  {
    name: "Vision",
    value: 72,
    icon: Compass,
    accent: "vision",
    text: "Shared direction that acts as a structural force.",
    signal: "Direction is present, but it may not yet guide every decision under pressure.",
    affects: ["Prioritization", "Decision speed", "Cultural alignment"],
    question: "Do people know what matters most when no leader is in the room?",
  },
  {
    name: "Leadership",
    value: 58,
    icon: UsersThree,
    accent: "leadership",
    text: "The quality of decisions, presence, and alignment between what leaders say and how the organization moves.",
    signal: "Leadership energy is visible, but the system may be receiving mixed signals.",
    affects: ["Ownership", "Trust", "Escalation patterns"],
    question: "Where are people waiting for permission instead of moving with clarity?",
  },
  {
    name: "Strategy",
    value: 65,
    icon: Strategy,
    accent: "strategy",
    text: "The degree to which priorities are clear, shared, and connected to day-to-day execution.",
    signal: "Strategic intent is active, but daily work may still be pulling attention in too many directions.",
    affects: ["Focus", "Execution rhythm", "Resource allocation"],
    question: "Which priority is absorbing energy without moving the system forward?",
  },
  {
    name: "Collaboration",
    value: 48,
    icon: Sparkle,
    accent: "collaboration",
    text: "How well teams communicate, coordinate, and build trust across roles and levels.",
    signal: "The strongest friction is relational: information may be arriving late, softened, or fragmented.",
    affects: ["Feedback loops", "Cross-team trust", "Rework"],
    question: "What truth is the organization learning too late?",
  },
  {
    name: "Well-Being",
    value: 67,
    icon: Heart,
    accent: "wellbeing",
    text: "The structural conditions that allow people to perform sustainably without depleting capacity.",
    signal: "Capacity is holding, but the system may be relying on personal resilience more than healthy structure.",
    affects: ["Burnout risk", "Retention", "Sustainable performance"],
    question: "Where is performance being maintained by exhaustion?",
  },
];

const radarData = dimensions.map((item) => ({
  subject: item.name,
  value: item.value,
  fullMark: 100,
}));

const dashboardInsights = {
  Vision: {
    title: "Vision is present, but not yet guiding every decision.",
    text: "GiA is seeing moments where priorities may still depend on leadership interpretation instead of shared direction.",
  },
  Leadership: {
    title: "Leadership signals are active, but alignment may be uneven.",
    text: "GiA suggests reviewing where ownership, permission, and decision rights are slowing the system down.",
  },
  Strategy: {
    title: "Strategy has momentum, but focus may be spreading too thin.",
    text: "GiA is detecting a gap between strategic intent and what teams are actually protecting day to day.",
  },
  Collaboration: {
    title: "Collaboration is limiting the system's evolutionary potential.",
    text: "People are holding back with managers. Review collaboration and leadership together.",
  },
  "Well-Being": {
    title: "Well-Being is holding, but capacity may depend on personal resilience.",
    text: "GiA recommends checking whether sustainable performance is designed into the system or carried by individuals.",
  },
};

const fitQuestions = [
  {
    prompt: "When something goes wrong, people in my organization know instinctively what the right call is, without needing to ask me.",
    dimension: "Vision",
  },
  {
    prompt: "My leadership team has the difficult conversations about what isn't working, not just about what is.",
    dimension: "Leadership",
  },
  {
    prompt: "The priorities we agreed on three months ago still reflect what people are actually working on today.",
    dimension: "Strategy",
  },
  {
    prompt: "People in my organization speak up when they see something going wrong, even when it's uncomfortable to do so.",
    dimension: "Collaboration",
  },
  {
    prompt: "My highest performers are also the most sustainable in how they work, I'm not worried about losing them.",
    dimension: "Well-Being",
  },
];

const chatQuickPrompts = [
  "Could COIREA help us?",
  "What does the platform do?",
  "Who is GiA?",
  "Can I talk to someone?",
];

const chatFollowUpPrompts = [
  "How does the first step work?",
  "What should I ask a Steward?",
  "Show me something to read",
];

function normalizeChatInput(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpanishInput(value = "") {
  return /\b(que|como|para|nosotros|empresa|organizacion|liderazgo|bienestar|estrategia|colaboracion|vision|precio|agenda|postular|conversacion|funciona|sirve|hola)\b/.test(normalizeChatInput(value));
}

function chatAnswer(text = "") {
  const normalized = normalizeChatInput(text);
  const spanish = isSpanishPath() || isSpanishInput(text);
  const includes = (...words) => words.some((word) => normalized.includes(word));
  const actionApply = { label: spanish ? "Hablar con un Steward" : "Book a conversation", href: "/conversation" };
  const actionInsights = { label: spanish ? "Ver insights" : "Explore insights", href: "/insights" };
  const actionAbout = { label: spanish ? "Conocer la historia" : "Meet COIREA", href: "/about" };

  if (includes("hello", "hi", "hola")) {
    return {
      text: spanish
        ? "Hola, soy GiA. Estoy aqui para ayudarte a entender COIREA sin hacerlo complicado. Puedo aclarar dudas, orientarte por la plataforma y, si sientes que esto toca algo real en tu organizacion, ayudarte a abrir una conversacion con un Steward."
        : "Hi, I’m GiA. I’m here to make COIREA easier to understand, not to overwhelm you. I can clarify doubts, guide you through the platform, and if something feels relevant, point you toward a real conversation with a Steward.",
      prompts: chatQuickPrompts,
    };
  }

  if (includes("right for us", "fit", "for us", "sirve", "aplica", "adecuado", "para nosotros", "could coirea help")) {
    return {
      text: spanish
        ? "Puede ser. COIREA suele ayudar cuando hay una sensacion de: “algo en el sistema no esta fluyendo, pero no sabemos exactamente donde mirar”. Puede ser direccion poco clara, liderazgo cansado, estrategia que no aterriza, comunicacion entrecortada o equipos sosteniendo demasiado. Yo puedo ayudarte a orientarlo, pero la conversacion importante la tiene un Steward contigo."
        : "It might. COIREA tends to help when there’s a feeling of: “something in the system isn’t flowing, but we’re not sure where to look.” That might be unclear direction, tired leadership, strategy not landing, communication gaps, or teams carrying too much. I can help you name the shape of it, but the real next step is a human conversation with a Steward.",
      actions: [actionApply],
      prompts: ["What friction should we look for?", "What happens in the first conversation?"],
    };
  }

  if (includes("friction", "look for", "tension", "problem", "pain", "bloqueo", "friccion", "tension", "problema")) {
    return {
      text: spanish
        ? "Buena pregunta. Muchas veces la friccion se muestra en cosas pequeñas que se repiten: decisiones que vuelven a la misma mesa, conversaciones que nadie quiere abrir, equipos que trabajan mucho pero no avanzan juntos, o personas clave que empiezan a apagarse. Si algo de eso suena familiar, puede valer la pena conversarlo con alguien de COIREA."
        : "Good question. Friction often shows up in small things that repeat: decisions coming back to the same table, conversations people avoid, teams working hard but not moving together, or key people starting to fade. If any of that feels familiar, it may be worth talking it through with someone from COIREA.",
      actions: [actionApply],
      prompts: ["What are the five dimensions?", "Could COIREA help us?", "How does the first step work?"],
    };
  }

  if (includes("platform", "plataforma", "how does it work", "what does the platform do", "funciona", "dashboard", "soil")) {
    return {
      text: spanish
        ? "La plataforma funciona como un espejo del sistema. Recoge señales, las organiza en dimensiones y ayuda a ver patrones que normalmente aparecen tarde: cansancio, falta de alineacion, tensiones entre equipos o estrategia que se queda en palabras. Yo ayudo a traducir esas señales en preguntas mas claras."
        : "The platform works like a mirror for the system. It gathers signals, organizes them across dimensions, and helps reveal patterns leaders often notice too late: fatigue, misalignment, team tension, or strategy staying as words. My job is to help translate those signals into clearer questions.",
      prompts: ["What is OVI?", "Who is GiA?", "Can I talk to someone?"],
    };
  }

  if (includes("ovi", "assessment", "diagnostic", "score", "evaluacion", "diagnostico", "indice", "vitality")) {
    return {
      text: spanish
        ? "OVI es el pulso inicial. No es una nota para juzgar a la organizacion; es una forma de ver donde hay vitalidad, donde hay tension y donde conviene mirar primero. Despues, un Steward ayuda a interpretar lo que aparece con contexto humano."
        : "OVI is the first pulse check. It is not a score to judge the organization; it is a way to see where there is vitality, where there is tension, and where it may be useful to look first. Then a Steward helps interpret what shows up with human context.",
      prompts: ["What are the five dimensions?", "What happens in the first conversation?"],
    };
  }

  if (includes("gia", "who is gia", "ai", "artificial", "intelligence", "ia", "inteligencia")) {
    return {
      text: spanish
        ? "Soy GiA: Guided Intelligence for Alignment. Piensame como una guia ligera dentro de COIREA. No reemplazo a una persona, y no pretendo tener toda la respuesta. Ayudo a ordenar señales, explicar conceptos y acercarte al momento correcto para hablar con un Steward."
        : "I’m GiA: Guided Intelligence for Alignment. Think of me as a light guide inside COIREA. I do not replace a person, and I’m not here to pretend I have the whole answer. I help organize signals, explain concepts, and guide you toward the right moment to speak with a Steward.",
      prompts: ["Give me an example", "Can I talk to someone?"],
    };
  }

  if (includes("example", "ejemplo")) {
    return {
      text: spanish
        ? "Claro. Si varias personas dicen que les cuesta hablar con sus managers, yo no lo leo como “quejas sueltas”. Lo miro como una señal: quizas hay algo fragile entre liderazgo y colaboracion. Entonces la pregunta no seria “quien tiene la culpa?”, sino “que entorno permitiria que la verdad aparezca antes?”"
        : "Of course. If several people say it is hard to speak up with managers, I would not frame that as “random complaints.” I would treat it as a signal: maybe something is fragile between leadership and collaboration. The question becomes less “who is wrong?” and more “what environment would let the truth appear earlier?”",
      prompts: ["What should I ask a Steward?", "Can I talk to someone?"],
    };
  }

  if (includes("dimension", "pillar", "vision", "leadership", "strategy", "collaboration", "well being", "wellbeing", "pilar", "liderazgo", "estrategia", "colaboracion", "bienestar")) {
    return {
      text: spanish
        ? "COIREA mira cinco puertas de entrada al sistema: Vision, Leadership, Strategy, Collaboration y Well-Being. A veces una tension se siente como “problema de personas”, pero al mirarla por dimensiones aparece algo mas claro: falta de direccion, decisiones trabadas, baja confianza o ritmo poco sostenible."
        : "COIREA looks at five doorways into the system: Vision, Leadership, Strategy, Collaboration, and Well-Being. Sometimes a tension feels like a “people problem,” but through the dimensions it becomes clearer: unclear direction, stuck decisions, low trust, or an unsustainable rhythm.",
      prompts: ["Which dimension matters most?", "What should I ask a Steward?"],
    };
  }

  if (includes("platform or consultancy", "platform and consultancy", "software or consultancy", "plataforma o consultoria", "software o consultoria")) {
    return {
      text: spanish
        ? "Es las dos cosas, pero con una idea muy clara: la plataforma muestra el patron, y el acompaniamiento humano ayuda a trabajarlo. COIREA no quiere dejarte solo frente a un dashboard bonito. El valor esta en convertir lo visible en una conversacion y luego en movimiento."
        : "It is both, with a very clear idea: the platform reveals the pattern, and the human accompaniment helps work with it. COIREA does not want to leave you alone with a beautiful dashboard. The value is turning what becomes visible into a conversation, and then into movement.",
      actions: [actionApply],
      prompts: ["What does the platform do?", "Can I talk to someone?"],
    };
  }

  if (includes("steward", "stewards", "human", "acompan", "facilitador")) {
    return {
      text: spanish
        ? "Un Steward es la persona que acompaña el proceso. Yo puedo ayudarte a entender las piezas; un Steward puede escuchar tu contexto, hacer mejores preguntas y ver contigo si COIREA tiene sentido para tu organizacion."
        : "A Steward is the person who accompanies the process. I can help you understand the pieces; a Steward can listen to your context, ask better questions, and explore with you whether COIREA makes sense for your organization.",
      actions: [actionAbout],
      prompts: ["Can I talk to someone?", "What happens in the first conversation?"],
    };
  }

  if (includes("apply", "book", "conversation", "contact", "email", "postular", "agenda", "reunion", "conversacion", "contacto", "talk to someone", "specialist", "especialista", "steward")) {
    return {
      text: spanish
        ? "Si quieres hablar con alguien, ese es probablemente el mejor siguiente paso. Yo puedo aclarar dudas aqui, pero una persona de COIREA puede escuchar el contexto real de tu organizacion. Puedes dejar la solicitud y un Steward la revisa personalmente."
        : "If you want to talk to someone, that is probably the best next step. I can clarify things here, but someone from COIREA can listen to the real context of your organization. You can leave a request and a Steward will review it personally.",
      actions: [actionApply],
      prompts: ["What should I ask a Steward?", "Could COIREA help us?"],
    };
  }

  if (includes("after we apply", "after applying", "what happens after", "first conversation", "first step", "prepare", "preparar", "despues de aplicar", "despues de postular", "primer paso")) {
    return {
      text: spanish
        ? "El primer paso no tiene que ser perfecto. Basta con contar donde sienten friccion y que les gustaria entender mejor. Si hay encaje, un Steward puede continuar la conversacion y ayudar a ver si COIREA es el contenedor correcto."
        : "The first step does not need to be perfect. It is enough to share where you are sensing friction and what you would like to understand more clearly. If there is a fit, a Steward can continue the conversation and help see whether COIREA is the right container.",
      actions: [actionApply],
      prompts: ["What friction should we look for?", "Can I talk to someone?"],
    };
  }

  if (includes("price", "pricing", "cost", "cuanto", "precio", "costo", "vale")) {
    return {
      text: spanish
        ? "Buena pregunta, y aqui prefiero no inventar. COIREA no se presenta como una compra generica de software; depende del contexto, tamaño y tipo de acompañamiento. Lo mas honesto es conversarlo con una persona de COIREA."
        : "Good question, and I’d rather not invent an answer here. COIREA is not presented as a generic software purchase; it depends on context, size, and the kind of accompaniment needed. The most honest next step is to talk it through with someone from COIREA.",
      actions: [actionApply],
      prompts: ["Can I talk to someone?", "What happens in the first conversation?"],
    };
  }

  if (includes("blog", "insight", "article", "resources", "recurso", "articulo")) {
    return {
      text: spanish
        ? "Si quieres sentir mejor el pensamiento de COIREA antes de hablar con alguien, los insights son un buen lugar. Hay textos sobre liderazgo consciente, bienestar, cultura, sistemas organizacionales y nuevas formas de trabajar."
        : "If you want to feel the thinking behind COIREA before talking to someone, the insights are a good place to wander. They cover conscious leadership, well-being, culture, organizational systems, and new ways of working.",
      actions: [actionInsights],
      prompts: ["What is a People Operating System?", "Could COIREA help us?"],
    };
  }

  if (includes("people operating system", "operating system", "sistema operativo", "sistema humano")) {
    return {
      text: spanish
        ? "Un People Operating System es la forma real en que una organizacion decide, colabora, ejecuta y cuida su energia. No siempre esta escrito en un documento, pero se siente todos los dias. COIREA ayuda a hacerlo visible para que el proposito no dependa solo de esfuerzo individual."
        : "A People Operating System is the real way an organization decides, collaborates, executes, and protects its energy. It is not always written in a document, but people feel it every day. COIREA helps make it visible so purpose does not depend only on individual effort.",
      prompts: ["What are the five dimensions?", "What does the platform do?"],
    };
  }

  if (includes("which dimension", "matters most", "most important", "dimension importa", "mas importante")) {
    return {
      text: spanish
        ? "Depende del momento del sistema. A veces parece estrategia, pero el nudo esta en liderazgo. A veces parece bienestar, pero nace en colaboracion o falta de direccion compartida. Por eso COIREA mira el sistema completo antes de saltar a soluciones."
        : "It depends on the system’s moment. Sometimes it looks like strategy, but the knot is in leadership. Sometimes it looks like well-being, but it comes from collaboration or unclear direction. That is why COIREA looks at the whole system before jumping into solutions.",
      prompts: ["What should I ask a Steward?", "Can I talk to someone?"],
    };
  }

  if (includes("what should i ask", "ask a steward", "preguntar", "que pregunto")) {
    return {
      text: spanish
        ? "Podrias preguntarle: “Que patron creen que estamos repitiendo?”, “Que señales deberiamos mirar primero?”, “Como sabremos si COIREA es buen fit?” y “Que tipo de acompañamiento necesita una organizacion en nuestro momento?”. Son preguntas simples, pero abren bastante."
        : "You could ask: “What pattern do you think we may be repeating?”, “Which signals should we look at first?”, “How will we know if COIREA is a good fit?”, and “What kind of support does an organization at our stage usually need?” Simple questions, but they open the right door.",
      actions: [actionApply],
      prompts: ["What friction should we look for?", "Show me something to read"],
    };
  }

  return {
    text: spanish
      ? "Te sigo. Para ayudarte mejor, cuentame si quieres entender la plataforma, explorar si COIREA podria servirles, leer algun insight o hablar con una persona. Yo puedo orientarte, y si hace sentido te llevo hacia un Steward."
      : "I’m with you. To help better, tell me if you want to understand the platform, explore whether COIREA could help, read an insight, or talk with a person. I can guide you here, and if it makes sense I’ll point you toward a Steward.",
    prompts: chatQuickPrompts,
  };
}

const applicationFrictionOptions = [
  "Our direction isn't as shared as it needs to be",
  "Leadership doesn't always move as one",
  "Our strategy doesn't translate into how we actually work day to day",
  "There are communication gaps between teams or levels",
  "The pace we're working at isn't sustainable",
];

const teamSizeOptions = ["5-20", "21-50", "51-100", "101-300", "300+"];

const impactSignals = [
  {
    before: "The same decision, postponed again.",
    after: "Leadership aligned on the same signal.",
  },
  {
    before: "The same meeting, every other week.",
    after: "Issues visible before they become crises.",
  },
  {
    before: "Good people who quietly disengage.",
    after: "Teams that move without constant realignment.",
  },
];

const frictionSignals = ["The same decision, postponed again", "The same meeting, every other week", "Good people who quietly disengage"];
const harmonySignals = ["Shared visibility", "Aligned decisions", "Focused execution", "Sustained capacity", "Early signals"];

const platformJourney = [
  {
    stage: "Signal detected",
    title: "Difficulty speaking up with managers appears across multiple responses.",
    text: "The organization is already talking. COIREA listens for the signals leaders usually hear too late.",
    outcome: "The hidden tension becomes visible.",
    icon: Pulse,
  },
  {
    stage: "Insight",
    title: "Psychological safety is fragile at the leadership interface.",
    text: "GiA connects the signal across collaboration and leadership, separating isolated comments from a real system pattern.",
    outcome: "The symptom becomes a pattern.",
    icon: Lightbulb,
  },
  {
    stage: "Next action",
    title: "Review collaboration and leadership together with a Steward.",
    text: "The platform turns the pattern into a focused next move, supported by human judgment and measurable follow-through.",
    outcome: "Leaders hear the truth earlier.",
    icon: Check,
  },
];

const platformBenefits = [
  {
    icon: Pulse,
    title: "Listen before friction becomes visible",
    text: "Surveys, reflection, behavior, and context reveal what leaders usually hear too late.",
  },
  {
    icon: Brain,
    title: "See the pattern beneath the symptom",
    text: "GiA connects signals across vision, leadership, strategy, collaboration, and well-being.",
  },
  {
    icon: UsersThree,
    title: "Move with human stewardship",
    text: "A Steward helps leaders interpret the signal and choose the right next move.",
  },
  {
    icon: ChartLineUp,
    title: "Measure whether the system is changing",
    text: "OVI shows whether alignment, trust, and execution are improving over time.",
  },
];

const aiSeoFaqs = [
  [
    "What is COIREA?",
    "COIREA is a People Operating System for organizations that care. It helps leaders measure and strengthen the human system behind performance across Vision, Leadership, Strategy, Collaboration, and Well-Being.",
  ],
  [
    "What is a People Operating System?",
    "A People Operating System is the living structure behind how people make decisions, collaborate, execute strategy, and sustain performance. It makes the invisible patterns of an organization visible enough to improve.",
  ],
  [
    "Is COIREA a platform or a consultancy?",
    "COIREA is both a platform and a strategic support system. The platform measures organizational health, while stewardship helps leaders interpret signals and turn insight into action.",
  ],
  [
    "What does COIREA measure?",
    "COIREA measures organizational health through five pillars: Vision, Leadership, Strategy, Collaboration, and Well-Being. Together, these pillars show whether the organization is coherent, aligned, and able to perform sustainably.",
  ],
  [
    "What is OVI?",
    "OVI means Organizational Vitality Index. It is COIREA's diagnostic view of how healthy and coherent an organization is across the five pillars of its People Operating System.",
  ],
  [
    "What is GiA?",
    "GiA means Guided Intelligence for Alignment. It is COIREA's intelligence layer that turns organizational signals into questions, insights, and suggested next actions for leaders.",
  ],
];

const peopleOperatingSystemArticle = {
  title: "What Is a People Operating System?",
  updated: "Last updated: July 2026",
  author: "Maria Jose Figueroa",
  intro:
    "A People Operating System is the living structure behind how people make decisions, collaborate, execute strategy, and sustain performance. It is not a motivational idea or a survey score. It is the real operating layer of the organization.",
  sections: [
    {
      heading: "Why organizations need a People Operating System",
      body:
        "Most organizations already have tools for finance, sales, operations, and delivery. Far fewer have a clear way to see the human system that makes those functions work. When that system is invisible, leaders often treat symptoms as isolated problems: a slow decision, a tense meeting, a burned-out team, or a strategy that keeps stalling.",
    },
    {
      heading: "What a People Operating System makes visible",
      body:
        "A People Operating System makes visible the patterns that shape performance: whether people share direction, whether leadership behavior matches stated values, whether strategy is understood, whether collaboration is healthy, and whether people can perform without depletion.",
    },
    {
      heading: "How COIREA defines organizational health",
      body:
        "COIREA maps organizational health through five pillars: Vision, Leadership, Strategy, Collaboration, and Well-Being. These pillars help leaders understand where the system is coherent, where friction is building, and which part of the organization needs attention first.",
    },
    {
      heading: "How COIREA uses OVI and GiA",
      body:
        "The OVI, Organizational Vitality Index, gives leaders a diagnostic view of the system. GiA, Guided Intelligence for Alignment, converts signals into reflection questions and next actions. Together, they help leaders move from intuition to evidence without losing the human nuance of the work.",
    },
  ],
};

const migratedBlogClusters = [
  "All",
  "Workplace Evolution",
  "Leadership Consciousness",
  "People Operating System",
  "Stories",
];

const spanishClusterLabels = {
  All: "Todos",
  "Workplace Evolution": "Evolución del trabajo",
  "Leadership Consciousness": "Liderazgo consciente",
  "People Operating System": "People Operating System",
  Stories: "Historias",
};

const spanishPostFallbacks = {
  "coirea-evolution": {
    title: "De lo lineal a lo regenerativo: el camino detrás de COIREA",
    preview: "Una mirada al origen de COIREA y al cambio de paradigma que invita a ver las organizaciones como sistemas vivos, no como máquinas.",
    body: `<article>
      <p>COIREA nace de una intuición muy simple: las organizaciones no son máquinas. Son sistemas vivos. Cuando se las gestiona solo desde control, velocidad y eficiencia, empiezan a aparecer señales conocidas: desconexión, agotamiento, decisiones lentas y equipos que trabajan mucho pero pierden coherencia.</p>
      <p>El paso de una organización lineal a una organización regenerativa no ocurre agregando más herramientas. Ocurre cuando el sistema aprende a observarse, a escuchar sus señales y a transformar la tensión en aprendizaje.</p>
      <h2>De control a coherencia</h2>
      <p>La lógica lineal busca predecir, controlar y corregir. La lógica regenerativa busca entender relaciones, ritmos y condiciones. En lugar de preguntar únicamente “qué está fallando”, pregunta “qué está intentando mostrar el sistema”.</p>
      <h2>La evolución de COIREA</h2>
      <p>COIREA fue creada para hacer visible esa capa humana del rendimiento: propósito, liderazgo, estrategia, colaboración y bienestar. Su trabajo no es reemplazar la intuición humana, sino darle estructura, evidencia y acompañamiento.</p>
      <p>Por eso COIREA combina plataforma, inteligencia guiada y Stewards humanos. La tecnología ayuda a leer patrones; las personas ayudan a interpretarlos con contexto, cuidado y criterio.</p>
    </article>`,
  },
  "five-pillars-regenerative-business": {
    title: "El sistema operativo de COIREA: los cinco pilares de las organizaciones regenerativas",
    preview: "Una guía práctica sobre los cinco pilares que sostienen la salud organizacional: propósito, liderazgo, colaboración, bienestar y estructura.",
    body: `<article>
      <p>En un contexto de cambio constante, el éxito ya no puede medirse solo por crecimiento, eficiencia o resultados trimestrales. También depende de la resiliencia, la coherencia y la vitalidad del sistema humano que sostiene la organización.</p>
      <p>En COIREA observamos cada empresa como un sistema vivo. Como cualquier ecosistema, su salud depende de la relación entre sus partes fundamentales.</p>
      <h2>Los cinco pilares</h2>
      <ul>
        <li><strong>Cultura y propósito:</strong> el suelo donde las decisiones toman raíz.</li>
        <li><strong>Liderazgo:</strong> la energía que da forma al comportamiento del sistema.</li>
        <li><strong>Colaboración:</strong> la capacidad de coordinarse con confianza y claridad.</li>
        <li><strong>Bienestar:</strong> la condición que permite sostener rendimiento sin agotamiento.</li>
        <li><strong>Estructura organizacional:</strong> el ritmo que ordena roles, decisiones y ejecución.</li>
      </ul>
      <h2>Por qué no se trabajan por separado</h2>
      <p>Una tensión en colaboración puede tener raíz en liderazgo. Un problema de bienestar puede venir de una estructura confusa. Una estrategia clara puede fallar si la cultura no la encarna. Por eso COIREA mira el sistema completo.</p>
      <p>El futuro del trabajo no se trata de más control. Se trata de más coherencia: estructuras más humanas, decisiones más claras y crecimiento que no destruya la capacidad de las personas.</p>
    </article>`,
  },
  "businesses-need-renewal": {
    title: "Por qué las empresas necesitan ciclos de renovación, no solo crecimiento lineal",
    preview: "Las organizaciones vivas no crecen siempre en línea recta. Necesitan pausas, lectura del sistema y ciclos de renovación para sostener su evolución.",
    body: `<article>
      <p>Muchas empresas operan como si crecer significara avanzar siempre más rápido. Pero los sistemas vivos no funcionan así. Crecen, descansan, integran, se adaptan y vuelven a moverse con nueva energía.</p>
      <p>Cuando una organización ignora sus ciclos de renovación, el rendimiento puede continuar por un tiempo, pero empieza a depender de desgaste acumulado.</p>
      <h2>Las señales de un sistema sin renovación</h2>
      <ul>
        <li>Decisiones que se repiten sin resolverse.</li>
        <li>Equipos que trabajan más pero avanzan menos.</li>
        <li>Liderazgos que contienen demasiada tensión.</li>
        <li>Estrategias que pierden conexión con la experiencia diaria.</li>
      </ul>
      <h2>Renovar no es detenerse</h2>
      <p>Renovar es recuperar claridad. Es mirar qué está drenando energía, qué necesita cambiar de forma y qué capacidades deben fortalecerse antes de seguir escalando.</p>
      <p>COIREA ayuda a leer esos momentos para que el crecimiento construya capacidad en lugar de consumirla.</p>
    </article>`,
  },
  "cultural-reset": {
    title: "Señales de que tu empresa necesita un reinicio cultural y cómo empezar",
    preview: "Un reinicio cultural no empieza con un manifiesto nuevo. Empieza cuando la organización se atreve a mirar lo que está repitiendo.",
    body: `<article>
      <p>La cultura no es lo que una organización declara. Es lo que las personas hacen cuando nadie está mirando, especialmente bajo presión.</p>
      <p>Un reinicio cultural se vuelve necesario cuando los comportamientos reales ya no sostienen el propósito, la estrategia o el bienestar del sistema.</p>
      <h2>Señales frecuentes</h2>
      <ul>
        <li>Valores que se nombran, pero no guían decisiones.</li>
        <li>Conversaciones difíciles que se evitan.</li>
        <li>Equipos que se protegen en silos.</li>
        <li>Confianza erosionada por incoherencias repetidas.</li>
      </ul>
      <h2>Cómo empezar</h2>
      <p>El primer paso no es imponer una nueva cultura. Es escuchar la cultura que ya existe. ¿Qué premia? ¿Qué castiga? ¿Qué permite? ¿Qué silencios mantiene?</p>
      <p>COIREA convierte esas señales en un mapa para que líderes y equipos puedan trabajar la cultura desde evidencia, no desde intuiciones aisladas.</p>
    </article>`,
  },
  "tealorganizations": {
    title: "El futuro del trabajo es teal: por qué las organizaciones con propósito llegaron para quedarse",
    preview: "Las organizaciones teal invitan a repensar liderazgo, autonomía y propósito desde una mirada más viva y distribuida.",
    body: `<article>
      <p>Las organizaciones teal proponen una forma distinta de entender el trabajo: menos control jerárquico, más propósito vivo, más autonomía responsable y mayor conciencia del sistema completo.</p>
      <p>No se trata de eliminar estructura. Se trata de diseñar una estructura que permita que la inteligencia distribuida aparezca.</p>
      <h2>Qué cambia en una organización teal</h2>
      <ul>
        <li>El liderazgo se vuelve más distribuido.</li>
        <li>Las decisiones se acercan al lugar donde vive la información.</li>
        <li>El propósito guía más que el control.</li>
        <li>La confianza deja de ser un valor decorativo y se vuelve diseño organizacional.</li>
      </ul>
      <h2>El desafío real</h2>
      <p>La autogestión sin claridad puede convertirse en confusión. La libertad sin acuerdos puede generar desgaste. Por eso las organizaciones teal necesitan un sistema operativo humano que haga visible la coherencia, las tensiones y la capacidad real.</p>
      <p>COIREA acompaña esa transición mirando el sistema vivo detrás de la estructura.</p>
    </article>`,
  },
  "delegation-without-burnout": {
    title: "Delegar sin quemarse: prácticas holacráticas para el liderazgo moderno",
    preview: "Delegar no es soltar tareas al azar. Es diseñar claridad, autoridad y confianza para que el trabajo pueda moverse sin depender de una sola persona.",
    body: `<article>
      <p>Muchos líderes quieren delegar, pero terminan sosteniendo el sistema desde el centro. Revisan todo, desbloquean todo y cargan con decisiones que podrían vivir en otros lugares.</p>
      <p>La delegación saludable necesita más que buena intención. Necesita roles claros, límites, acuerdos y confianza operativa.</p>
      <h2>Delegar no es desaparecer</h2>
      <p>Delegar significa crear condiciones para que otras personas puedan decidir con contexto. Requiere claridad sobre propósito, autoridad, expectativas y mecanismos de feedback.</p>
      <h2>Prácticas útiles</h2>
      <ul>
        <li>Definir roles por responsabilidad, no solo por cargo.</li>
        <li>Nombrar decisiones que pueden tomarse sin aprobación.</li>
        <li>Crear ritmos de revisión sin microgestión.</li>
        <li>Hacer visible cuándo una decisión vuelve innecesariamente al centro.</li>
      </ul>
      <p>COIREA ayuda a identificar dónde la delegación está bloqueada y qué dimensión del sistema necesita fortalecerse para distribuir liderazgo sin aumentar el caos.</p>
    </article>`,
  },
  "culture-is-what-you-do-when-no-one-s-watching": {
    title: "La cultura es lo que haces cuando nadie está mirando",
    preview: "La cultura real aparece en las decisiones pequeñas, en los silencios, en lo que se tolera y en lo que se repite bajo presión.",
    body: `<article>
      <p>La cultura no vive en una presentación. Vive en el calendario, en las conversaciones, en los criterios invisibles de decisión y en la forma en que las personas se tratan cuando hay presión.</p>
      <p>Por eso una organización puede declarar colaboración, pero operar desde silos. Puede declarar bienestar, pero premiar el agotamiento. Puede declarar propósito, pero decidir solo desde urgencia.</p>
      <h2>Mirar la cultura real</h2>
      <p>Para transformar la cultura, primero hay que verla sin maquillaje. ¿Qué comportamientos se repiten? ¿Qué conversaciones se evitan? ¿Qué señales dan los líderes, incluso sin querer?</p>
      <h2>De valores a comportamiento</h2>
      <p>Los valores solo importan cuando se vuelven criterios de acción. COIREA ayuda a conectar lo declarado con lo vivido para que la cultura deje de ser aspiracional y se convierta en estructura.</p>
    </article>`,
  },
  "company-as-a-body-safety-nervous-system": {
    title: "Si tu empresa fuera un cuerpo, ¿se sentiría segura?",
    preview: "Una organización también tiene sistema nervioso: señales de amenaza, protección, tensión, regulación y confianza.",
    body: `<article>
      <p>Si una empresa fuera un cuerpo, podríamos preguntarnos: ¿respira? ¿descansa? ¿se tensa frente a ciertas conversaciones? ¿se protege demasiado? ¿puede decir la verdad temprano?</p>
      <p>Las organizaciones tienen patrones parecidos a un sistema nervioso. Cuando no hay seguridad psicológica, las personas se adaptan: callan, suavizan, evitan, esperan permiso o se desconectan.</p>
      <h2>La seguridad como condición de rendimiento</h2>
      <p>La seguridad no significa comodidad permanente. Significa que el sistema puede procesar información difícil sin colapsar, castigar o negar lo que aparece.</p>
      <h2>Qué observa COIREA</h2>
      <p>COIREA lee señales de colaboración, liderazgo y bienestar para entender si la organización puede sostener conversaciones honestas. Porque una verdad que llega tarde suele costar mucho más que una verdad escuchada a tiempo.</p>
    </article>`,
  },
  "what-s-missing-in-company-culture-today": {
    title: "Qué falta hoy en la cultura de las empresas",
    preview: "A muchas culturas organizacionales no les falta inspiración. Les falta coherencia entre lo que dicen, lo que miden y lo que sostienen.",
    body: `<article>
      <p>Hoy muchas empresas hablan de cultura, propósito y bienestar. Pero las personas sienten rápidamente cuándo esas palabras no están conectadas con la experiencia diaria.</p>
      <p>Lo que suele faltar no es más lenguaje. Es coherencia.</p>
      <h2>La brecha cultural</h2>
      <p>La brecha aparece cuando una organización dice valorar la colaboración, pero recompensa la competencia interna; dice valorar la innovación, pero castiga el error; dice cuidar a las personas, pero diseña ritmos imposibles de sostener.</p>
      <h2>La cultura como sistema</h2>
      <p>La cultura se fortalece cuando propósito, liderazgo, estructura y bienestar se alinean. COIREA ayuda a ver dónde esa alineación se rompe y qué patrón conviene trabajar primero.</p>
    </article>`,
  },
  "conscious-companies-and-leaders-keys-to-sustainable-success": {
    title: "Empresas y líderes conscientes: claves para un éxito sostenible",
    preview: "El liderazgo consciente no es suavidad. Es presencia, responsabilidad y capacidad de leer el impacto que las decisiones tienen en todo el sistema.",
    body: `<article>
      <p>Una empresa consciente entiende que rendimiento y humanidad no son fuerzas opuestas. El éxito sostenible aparece cuando la organización puede crecer sin desconectarse de las personas que la hacen posible.</p>
      <h2>Qué distingue a un liderazgo consciente</h2>
      <ul>
        <li>Observa su impacto en el sistema.</li>
        <li>Toma decisiones con claridad y responsabilidad.</li>
        <li>Puede sostener conversaciones difíciles sin perder presencia.</li>
        <li>Diseña condiciones para que otros también lideren.</li>
      </ul>
      <h2>Sostenibilidad humana</h2>
      <p>El liderazgo consciente no busca hacer más con menos hasta agotar el sistema. Busca crear coherencia: dirección clara, confianza suficiente, estrategia aterrizada y capacidad sostenible.</p>
      <p>COIREA convierte estas dimensiones en señales visibles para que los líderes puedan actuar antes de que la tensión se transforme en crisis.</p>
    </article>`,
  },
  "10-well-being-programs": {
    title: "Programas de bienestar laboral: 10 ejemplos clave para tu empresa",
    preview: "El bienestar no debería ser un beneficio aislado. Debe integrarse al diseño real del trabajo, los ritmos y la cultura.",
    body: `<article>
      <p>El bienestar organizacional no se resuelve solo con actividades puntuales. Un programa de bienestar funciona cuando toca la forma en que el trabajo está diseñado.</p>
      <h2>Ejemplos de prácticas útiles</h2>
      <ul>
        <li>Pulsos de energía y carga de trabajo.</li>
        <li>Rituales de cierre y recuperación después de proyectos intensos.</li>
        <li>Revisión de reuniones y foco.</li>
        <li>Espacios de conversación segura.</li>
        <li>Prácticas de regulación antes de decisiones complejas.</li>
        <li>Claridad de prioridades para reducir urgencia artificial.</li>
        <li>Diseño de roles que evite sobrecarga invisible.</li>
        <li>Medición de riesgo de burnout.</li>
        <li>Feedback temprano sobre tensiones del sistema.</li>
        <li>Acompañamiento de liderazgo para sostener cambios.</li>
      </ul>
      <p>COIREA mira el bienestar como una dimensión estructural del rendimiento, no como un accesorio.</p>
    </article>`,
  },
  "strategic-leadership-retreats-": {
    title: "Retiros estratégicos de liderazgo: un catalizador para la transformación",
    preview: "Un retiro bien diseñado no es una pausa decorativa. Puede ser el espacio donde el sistema logra verse y decidir distinto.",
    body: `<article>
      <p>Los equipos de liderazgo suelen estar tan dentro de la operación que pierden perspectiva del sistema completo. Un retiro estratégico crea distancia suficiente para observar patrones, tensiones y decisiones que la urgencia diaria tapa.</p>
      <h2>Qué hace poderoso a un retiro</h2>
      <ul>
        <li>Claridad sobre las preguntas que importan.</li>
        <li>Seguridad para nombrar tensiones reales.</li>
        <li>Datos y señales que eviten conversaciones abstractas.</li>
        <li>Acuerdos concretos para volver a la operación con nuevo ritmo.</li>
      </ul>
      <h2>De inspiración a acción</h2>
      <p>El valor no está solo en el encuentro, sino en lo que cambia después. COIREA puede preparar el terreno leyendo señales del sistema antes del retiro y ayudando a convertir la claridad en seguimiento.</p>
    </article>`,
  },
  "regenerative-business-restoring-planet-and-society": {
    title: "Negocios regenerativos: restaurar planeta, sociedad y organizaciones",
    preview: "Lo regenerativo no es solo impacto externo. También implica diseñar organizaciones que restauren capacidad humana y relacional.",
    body: `<article>
      <p>Un negocio regenerativo no se conforma con reducir daño. Busca restaurar capacidad: en el planeta, en las comunidades y también dentro de la propia organización.</p>
      <p>Muchas empresas con propósito cuidan su impacto externo mientras internamente sostienen ritmos que agotan a las personas. Esa contradicción termina debilitando la misión.</p>
      <h2>Regenerar desde dentro</h2>
      <p>La regeneración empieza por mirar cómo se toman decisiones, cómo se distribuye la carga, cómo se cuida la energía y cómo se sostiene la colaboración.</p>
      <h2>El rol de COIREA</h2>
      <p>COIREA ayuda a organizaciones con propósito a medir y fortalecer las condiciones internas que permiten que el impacto sea sostenible en el tiempo.</p>
    </article>`,
  },
  "ancient-tools-modern-performance": {
    title: "Bienestar en el trabajo: herramientas antiguas para equipos modernos",
    preview: "Respiración, pausa, presencia y escucha no son prácticas blandas. Son capacidades operativas para sistemas bajo presión.",
    body: `<article>
      <p>En un mundo de trabajo acelerado, algunas herramientas antiguas vuelven a tener sentido: respiración, pausa, silencio, presencia, escucha profunda y regulación del cuerpo.</p>
      <p>No son prácticas decorativas. Ayudan a que las personas tomen mejores decisiones, escuchen señales tempranas y respondan con más claridad bajo presión.</p>
      <h2>Rendimiento y regulación</h2>
      <p>Un sistema desregulado se vuelve reactivo. Interpreta tensión como amenaza, evita conversaciones difíciles y consume energía en protección. La regulación permite abrir espacio entre estímulo y respuesta.</p>
      <h2>Integrar sin forzar</h2>
      <p>El bienestar real no exige convertir la empresa en un retiro espiritual. Requiere insertar pequeñas prácticas en momentos clave del trabajo: antes de reuniones difíciles, después de cierres intensos y durante ciclos de alta exigencia.</p>
    </article>`,
  },
  "conscious-leadership-practice": {
    title: "Liderazgo consciente en la práctica",
    preview: "El liderazgo consciente se demuestra en cómo una persona decide, escucha, regula su energía y sostiene conversaciones difíciles.",
    body: `<article>
      <p>El liderazgo consciente no es una identidad. Es una práctica. Aparece en momentos pequeños y repetidos: cuando algo sale mal, cuando alguien desafía una decisión, cuando el sistema necesita verdad y no solo tranquilidad.</p>
      <h2>Prácticas concretas</h2>
      <ul>
        <li>Pausar antes de responder desde reactividad.</li>
        <li>Preguntar qué señal trae una tensión antes de cerrarla.</li>
        <li>Nombrar expectativas con claridad.</li>
        <li>Escuchar cómo las decisiones impactan al sistema completo.</li>
        <li>Revisar incoherencias entre discurso y comportamiento.</li>
      </ul>
      <p>COIREA ayuda a líderes y equipos a hacer visibles esas dinámicas para que el liderazgo deje de depender solo de intención y se vuelva una capacidad del sistema.</p>
    </article>`,
  },
};

function sortBlogPosts(posts = []) {
  return [...posts].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

let blogPostsCache = null;
let blogPostsPromise = null;

async function loadBlogPosts() {
  if (blogPostsCache) return blogPostsCache;
  if (!blogPostsPromise) {
    blogPostsPromise = import("./data/migratedPosts.json").then((module) => {
      blogPostsCache = sortBlogPosts(module.default || []);
      return blogPostsCache;
    });
  }
  return blogPostsPromise;
}

function normalizeAuthor(author) {
  return author?.trim() || "María José Figueroa";
}

function formatPostDate(dateString, withDay = false, locale = "en-US") {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    ...(withDay ? { day: "numeric" } : {}),
  });
}

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadingTime(html = "") {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function extractFirstImage(html = "") {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || "";
}

function sanitizeBlogHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\shref=["']javascript:[^"']*["']/gi, "")
    .replace(/\ssrc=["']javascript:[^"']*["']/gi, "");
}

function displayCluster(cluster = "", title = "") {
  const normalized = `${cluster} ${title}`.toLowerCase();
  if (normalized.includes("conscious")) return "Leadership Consciousness";
  if (normalized.includes("stories")) return "Stories";
  if (normalized.includes("business pillars") || normalized.includes("operating system") || normalized.includes("well-being")) return "People Operating System";
  return "Workplace Evolution";
}

function localizedCluster(cluster = "", title = "", spanish = isSpanishPath()) {
  const label = displayCluster(cluster, title);
  return spanish ? spanishClusterLabels[label] || label : label;
}

function localizedPost(post, spanish = isSpanishPath()) {
  if (!post) return post;
  if (!spanish) return post;
  const fallback = spanishPostFallbacks[post.slug] || {};
  const title = post.title_es || fallback.title || translateSpanishText(post.title);
  const preview = post.preview_snippet_es || fallback.preview || translateSpanishText(post.preview_snippet);
  const body = post.body_content_es || post.body_content;
  const directAnswer = post.direct_answer_es || "";
  return {
    ...post,
    title,
    preview_snippet: preview,
    body_content: body,
    direct_answer: directAnswer,
    seo_title: post.seo_title_es || (title ? `${title} | COIREA Insights` : post.seo_title),
    meta_description: post.meta_description_es || preview || post.meta_description,
    tags: (post.tags_es || post.tags || []).map((tag) => translateSpanishText(tag)),
  };
}

function localizedPosts(posts = [], spanish = isSpanishPath()) {
  return posts.map((post) => localizedPost(post, spanish));
}

function clusterClass(cluster = "") {
  const normalized = cluster.toLowerCase();
  if (normalized.includes("leadership")) return "category-tag--leadership-consciousness";
  if (normalized.includes("workplace")) return "category-tag--workplace-evolution";
  if (normalized.includes("stories")) return "category-tag--stories";
  if (normalized.includes("people")) return "category-tag--people-operating-system";
  return "category-tag--workplace-evolution";
}

function getArticleConceptLinks(post) {
  if (!post) return [];
  const searchable = `${post.title} ${post.cluster} ${(post.tags || []).join(" ")} ${post.preview_snippet} ${stripHtml(post.body_content)}`.toLowerCase();
  const links = [
    {
      label: "People Operating System",
      href: "/insights/what-is-a-people-operating-system",
      text: "The core COIREA concept behind organizational coherence.",
    },
    {
      label: "Book a Conversation",
      href: "/conversation",
      text: "Apply to explore whether COIREA is the right fit.",
    },
  ];

  if (/ovi|vitality|diagnostic|measure|score|scanner|health/.test(searchable)) {
    links.splice(1, 0, {
      label: "OVI",
      href: "/answer-engine.md",
      text: "The Organizational Vitality Index across COIREA's five dimensions.",
    });
  }

  if (/gia|ai|artificial intelligence|signal|insight|intelligence|platform/.test(searchable)) {
    links.splice(1, 0, {
      label: "GiA",
      href: "/answer-engine.md",
      text: "Guided Intelligence for Alignment turns signals into next actions.",
    });
  }

  if (/well-being|burnout|resilience|sustainable|regenerative|culture|leadership|collaboration/.test(searchable)) {
    links.splice(1, 0, {
      label: "COIREA Insights",
      href: "/insights",
      text: "More essays on leadership, culture, and organizational evolution.",
    });
  }

  return links.slice(0, 5);
}

function useMigratedBlogPosts() {
  const [state, setState] = useState({
    posts: blogPostsCache || [],
    loading: !blogPostsCache,
    error: "",
  });

  useEffect(() => {
    let active = true;
    loadBlogPosts()
      .then((posts) => {
        if (active) setState({ posts, loading: false, error: "" });
      })
      .catch(() => {
        if (active) setState({ posts: [], loading: false, error: "Insights could not be loaded right now." });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

function useMigratedBlogPost(slug) {
  const [state, setState] = useState({
    post: blogPostsCache?.find((item) => item.slug === slug) || null,
    posts: blogPostsCache || [],
    loading: !blogPostsCache,
    error: "",
  });

  useEffect(() => {
    let active = true;
    loadBlogPosts()
      .then((posts) => {
        if (!active) return;
        const post = posts.find((item) => item.slug === slug) || null;
        setState({ post, posts, loading: false, error: post ? "" : "This post was not found." });
      })
      .catch(() => {
        if (active) setState({ post: null, posts: [], loading: false, error: "This post could not be loaded right now." });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

function upsertJsonLd(id, data) {
  if (typeof document === "undefined") return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.remove();
}

const platformPillars = [
  ["Vision", "Clarity and Direction", "Anchors decisions in shared direction, reducing drift and internal friction."],
  ["Leadership", "Ownership and Accountability", "Clarifies roles, decision rights, and responsibility so authority is distributed with trust."],
  ["Collaboration", "Trust and Coordination", "Reduces silos and strengthens feedback, communication, and collective intelligence."],
  ["Well-Being", "Energy and Sustainability", "Makes capacity, burnout signals, and resilience visible before they affect performance."],
  ["Strategy & Execution", "Structure and Momentum", "Connects long-term vision to quarterly priorities, ownership, and measurable progress."],
];

const platformFeatures = [
  ["Organizational Health Dashboard", "Real-time visibility into culture, engagement, and team dynamics across the organization."],
  ["AI-Powered Insights", "Analysis that surfaces what matters most and recommends evidence-based actions."],
  ["Culture & Leadership Metrics", "Track leadership effectiveness and cultural alignment with validated indicators."],
  ["Well-Being Signals", "Monitor team health and identify burnout risks before they impact performance and retention."],
  ["Collaboration Network", "Visualize how teams work together and where connections need strengthening."],
  ["SDGs Reporting", "Measure how organizational improvements translate into positive social impact."],
];

const ecosystemTypes = ["NGOs", "Impact Startups", "Regenerative Organizations", "Ecosystems & Networks", "Future of Work", "Educational Organizations"];

const stewardCompass = [
  ["Diagnose", "Read the organizational state with clarity and without judgment."],
  ["Map the system", "Identify invisible patterns and dynamics beneath the surface."],
  ["Challenge", "Name what the team is collectively avoiding."],
  ["Hold presence", "Remain the steady human anchor through transformation."],
];

const stewardNames = ["Juan Carlos", "Gabriela", "Tanya", "Marcela"];

const stewardProfiles = [
  ["Juan Carlos", "Systemic vision", "Accompanying organizations to see what the system already knows about itself before touching anything."],
  ["Gabriela", "Natural intelligence", "A biologist who reads organizations as ecosystems, from the inside out."],
  ["Tanya", "Systemic trust", "Holding collective processes with care, especially when something can no longer continue as before."],
  ["Marcela", "Coherence", "Accompanying leaders and teams back to alignment when doing has outpaced being."],
];

const foundingStewards = [
  {
    name: "Juan Carlos",
    role: "Systemic vision",
    contribution: "Systemic gaze",
    location: "Ecuador",
    photo: "/assets/stewards/juan_carlos.png",
    description: "Accompanying organizations to see what the system already knows about itself before touching anything.",
    bio: [
      "From the middle of the world, I have spent more than two decades weaving networks among territories, organizations, and institutions. My work has always been the same, though it has taken different forms: accompanying companies, communities, and leaders to build regenerative models that are not imposed on the territory, but emerge from it.",
      "I have collaborated with international organizations including UNESCO, the European Union, the Presencing Institute, and the World Bank. From public service, I have designed territorial, agricultural, and educational policy in highly complex contexts.",
      "What moves me, always, is the same question: what does this system want to do with its own intelligence? In COIREA I found a body where that question has a home.",
    ],
  },
  {
    name: "Tanya",
    role: "Systemic trust",
    contribution: "Systemic trust",
    location: "Chile",
    photo: "/assets/stewards/tanya.jpeg",
    description: "Holding collective processes with care, especially when something can no longer continue as before.",
    bio: [
      "From Valparaíso, with global reach, I have spent more than fifteen years accompanying organizations in their transition processes. My work lives in the territories that systems usually avoid: ambiguity, difficult conversations, and necessary closures.",
      "I dedicate myself to organizational social regeneration. I actively drive diversity and inclusion processes, accompanying women's networks and affinity groups from Conscious Relational Leadership.",
      "I believe systems do not change only by strategy. They transform when care allows people to collaborate and dissent without losing themselves in the attempt. Through Systemic Trust, I facilitate the network that sustains organizations when everything else is in transition.",
    ],
  },
  {
    name: "Gabriela",
    role: "Natural systems intelligence",
    contribution: "Natural intelligence",
    location: "Peru",
    photo: "/assets/stewards/gabriela.jpg",
    description: "A biologist who reads organizations as ecosystems, from the inside out.",
    bio: [
      "My path began at the root, deciphering life from biology, and then expanded toward environmental management, sustainability, and circular economy. Today, that sap nourishes my vocation for personal and organizational regeneration.",
      "Walking alongside diverse public and private organizations, I discovered a silent truth in work ecosystems: the internal disconnection we inhabit is the same crack that separates us from collective purpose.",
      "Inspired by the vital link between mental health and reconnection with the natural, I have learned to observe from stillness. My compass is simple: remember that we are nature.",
    ],
  },
  {
    name: "Marcela",
    role: "Coherence",
    contribution: "Coherence",
    location: "Argentina",
    photo: "/assets/stewards/marcela.jpeg",
    description: "Accompanying leaders and teams back to alignment when doing has outpaced being.",
    bio: [
      "With my gaze on the present and on the speed at which the world evolves, I build network. Today, alongside COIREA, I accompany people, leaders, and companies to walk through life models with a unique perspective: integrating who we are into each of our roles.",
      "For two decades I grew, learned, and developed in the world of Latin American organizations, especially in the financial sector, from the perspective of business growth and the implementation of technology to simplify and make organizations profitable.",
      "Today I walk with my eyes set on accompanying this historic moment in which everything will take a new course alongside AI and new technologies. COIREA brings a new way to walk hand in hand with transformation, in a simpler and more guided way.",
    ],
  },
];

const visionValues = [
  ["Clarity of Purpose", "Design from the inside out, anchored in strategic vision and long-term direction."],
  ["Coherence at Every Level", "Align purpose, leadership, culture, teams, and decisions across the system."],
  ["Human-Centered Systems", "People are not separate from performance. They are the system."],
  ["Reciprocity as Strategy", "Regeneration begins with how we relate to ourselves, to others, and to the system."],
];

const regenerativeSteps = [
  {
    title: "SOIL",
    subtitle: "Sense the System",
    text: "COIREA begins with structured reflection. The platform measures organizational health across five pillars and surfaces hidden tensions using trained AI pattern recognition.",
    bullets: ["Organizational Vitality Index", "Cross-pillar signals", "Early risk indicators"],
    closing: "This is where the organization pauses long enough to see itself clearly.",
  },
  {
    title: "GROW",
    subtitle: "Align & Execute",
    text: "Insights convert into structured governance and execution. Execution becomes aligned, not reactive.",
    bullets: ["Clear ownership", "Quarterly priorities", "Strategic drift detection", "Leadership accountability"],
    closing: "This is where clarity becomes structure.",
  },
  {
    title: "FLOURISH",
    subtitle: "Learn & Regenerate",
    text: "The system integrates feedback and strengthens capacity over time. Growth builds resilience instead of depletion.",
    bullets: ["Well-being pulses", "Innovation map", "Learning loops", "Regenerative capacity signals"],
    closing: "This is evolutionary and regenerative growth.",
  },
];

const giaQuestions = [
  ["Direction Coherence", "Is our daily work moving in the direction we say matters most?"],
  ["System Capacity", "Does our system have the energy and space to deliver what we have committed to?"],
  ["Role Clarity", "Are responsibilities held in ways that allow people to contribute at their best?"],
  ["Project Contribution", "How are current initiatives strengthening the evolution of the organization?"],
  ["System Tensions", "Where is the system asking for attention or adaptation?"],
  ["Next Evolution", "What small structural changes could restore greater coherence?"],
];

const toolFaqs = [
  ["What is the Organizational Health Scanner?", "A focused diagnostic that evaluates the organization across purpose, collaboration, leadership, well-being, strategy, and interconnectivity."],
  ["How long does it take?", "The real scanner is designed to take approximately 5–7 minutes."],
  ["What do leaders receive?", "An OVI score, pillar breakdown, strongest signal, challenge area, and personalized insights."],
  ["Is information confidential?", "The current COIREA promise is that assessment responses and results are treated as confidential."],
];

const visionFaqs = [
  ["What is COIREA?", "An organizational intelligence platform that helps purpose-driven organizations measure systemic health and align execution across five pillars."],
  ["What is OVI?", "The Organizational Vitality Index is a 0–100 composite score that maps the organization into coherence, alignment, fragility, or structural risk."],
  ["What is GiA?", "Guided Intelligence for Alignment, COIREA’s trained organizational pattern-recognition layer."],
  ["What does COIREA do with our data?", "COIREA’s stated position is that intelligence is generated from inside your own system, not monetized or used for default cross-organization benchmarking."],
];

const aboutFaqs = [
  ["What is COIREA?", "COIREA is a People Operating System, an organizational intelligence platform that helps purpose-driven organizations measure systemic health and align execution across five pillars: Vision, Leadership, Strategy, Collaboration, and Well-Being."],
  ["What is OVI?", "The Organizational Vitality Index is a 0-100 composite score that maps your organization's state: Systemic Coherence (80-100), Emerging Alignment (60-79), Fragile Stability (40-59), or Structural Risk (0-39). It updates continuously as your organization evolves."],
  ["What is GiA?", "GiA stands for Guided Intelligence for Alignment, COIREA's trained organizational AI. Unlike generic tools, GiA learns from your organization's own signals and surfaces them in a Signal, Insight, Question format, built for reflection and action, not just reporting."],
  ["What does COIREA do with our data?", "Intelligence is generated from inside your own system. Your data is not shared, sold, or used for cross-organization benchmarking by default. Your organization's signals belong to your organization."],
  ["Who is COIREA built for?", "COIREA works best with founder-led or mission-driven organizations between 15 and 300 people, typically navigating growth complexity, team misalignment, or a leadership transition. If you're not sure whether it's a fit, the first step is a short, honest conversation."],
  ["How does the SOIL assessment work?", "SOIL is COIREA's entry phase. It starts with a diagnostic conversation and an OVI measurement across all five pillars. Within 30 days, you have a clear picture of where your system is strong and where it's leaking energy, and a specific roadmap for what to strengthen first."],
];

const founderTags = ["Systems thinking", "Organizational design", "Regenerative business", "Latam"];

const naturePrinciples = [
  ["Living systems", "Nature does not separate intelligence from relationship. COIREA reads organizations the same way: as connected systems where each signal affects the whole."],
  ["Regeneration", "A healthy organization is not only efficient. It renews energy, trust, clarity, and capacity as it grows."],
  ["Distributed intelligence", "Like a forest, an organization already holds information everywhere. COIREA helps leaders listen to it without reducing people to data points."],
];

function getCurrentPathname() {
  return typeof window === "undefined" ? "/" : window.location.pathname || "/";
}

function isSpanishPath(pathname = getCurrentPathname()) {
  return pathname === "/es" || pathname.startsWith("/es/");
}

function routeFromPath(pathname = getCurrentPathname()) {
  const path = pathname || "/";
  if (path === "/es") return "/";
  return path.replace(/^\/es(?=\/)/, "") || "/";
}

const spanishTextMap = {
  "Home": "Inicio",
  "Insights": "Insights",
  "About Us": "Sobre COIREA",
  "Book a Conversation": "Agendar una conversación",
  "Book a conversation": "Agendar una conversación",
  "Book a call to see it live": "Agenda una llamada para verlo en vivo",
  "See how it works": "Ver cómo funciona",
  "See the system": "Ver el sistema",
  "The People Operating System": "El People Operating System",
  "COIREA · The People Operating System": "COIREA · El People Operating System",
  "The People Operating System for organizations that care.": "El People Operating System para organizaciones que cuidan.",
  "COIREA helps organizations build cohesive teams, because growth should\n            increase coherence, not deplete capacity. When the People System is aligned,\n            organizations do not just perform better, they regenerate.": "COIREA ayuda a las organizaciones a construir equipos cohesionados, porque el crecimiento deberia aumentar la coherencia, no agotar la capacidad. Cuando el sistema humano esta alineado, las organizaciones no solo rinden mejor: se regeneran.",
  "AI + Human Wisdom. Grounded in systemic thinking.": "IA + sabiduria humana. Basado en pensamiento sistemico.",
  "Live system view": "Vista viva del sistema",
  "People Operating System": "People Operating System",
  "Updated now": "Actualizado ahora",
  "system score": "puntaje del sistema",
  "Scores shown are illustrative. In your live platform, these update continuously.": "Los puntajes son ilustrativos. En la plataforma real se actualizan continuamente.",
  "GiA insight": "Insight de GiA",
  "View insight": "Ver insight",
  "Vision": "Vision",
  "Leadership": "Liderazgo",
  "Strategy": "Estrategia",
  "Collaboration": "Colaboracion",
  "Well-Being": "Bienestar",
  "The methodology": "La metodologia",
  "Five dimensions that determine if your organization can grow without breaking.": "Cinco dimensiones que determinan si tu organizacion puede crecer sin romperse.",
  "The People Operating System is not a framework to read. It is a living structure to measure, align, and strengthen over time.": "El People Operating System no es un marco para leer. Es una estructura viva para medir, alinear y fortalecer con el tiempo.",
  "Explore the system": "Explora el sistema",
  "Watch the system move, or select a dimension to explore.": "Observa como se mueve el sistema o selecciona una dimension para explorar.",
  "Explore": "Explorar",
  "signal": "señal",
  "What this affects": "Lo que afecta",
  "Reflection question": "Pregunta de reflexion",
  "Scores are illustrative. In the live platform, they update as the organization evolves.": "Los puntajes son ilustrativos. En la plataforma real se actualizan a medida que la organizacion evoluciona.",
  "The platform": "La plataforma",
  "A platform that reads the signals your organization is already sending.": "Una plataforma que lee las señales que tu organizacion ya esta enviando.",
  "Real scores. Real patterns. Real action. COIREA follows the path from what people feel, to what the system is signaling, to what leaders can do next.": "Puntajes reales. Patrones reales. Accion real. COIREA acompaña el camino desde lo que las personas sienten, hacia lo que el sistema esta señalando, y hacia lo que los lideres pueden hacer despues.",
  "Listen before friction becomes visible": "Escuchar antes de que la friccion se vuelva visible",
  "Surveys, reflection, behavior, and context reveal what leaders usually hear too late.": "Encuestas, reflexion, comportamiento y contexto revelan lo que los lideres suelen escuchar demasiado tarde.",
  "See the pattern beneath the symptom": "Ver el patron debajo del sintoma",
  "GiA connects signals across vision, leadership, strategy, collaboration, and well-being.": "GiA conecta señales entre vision, liderazgo, estrategia, colaboracion y bienestar.",
  "Move with human stewardship": "Avanzar con acompañamiento humano",
  "A Steward helps leaders interpret the signal and choose the right next move.": "Un Steward ayuda a los lideres a interpretar la señal y elegir el siguiente movimiento correcto.",
  "Measure whether the system is changing": "Medir si el sistema esta cambiando",
  "OVI shows whether alignment, trust, and execution are improving over time.": "El OVI muestra si la alineacion, la confianza y la ejecucion mejoran con el tiempo.",
  "COIREA system tour": "Tour del sistema COIREA",
  "20 sec loop": "Loop de 20 seg",
  "Sense": "Sentir",
  "Survey signals arrive": "Llegan señales de encuestas",
  "Read": "Leer",
  "GiA detects patterns": "GiA detecta patrones",
  "Act": "Actuar",
  "Leaders align next moves": "Los lideres alinean los proximos pasos",
  "SOIL": "SOIL",
  "Real platform preview": "Vista real de la plataforma",
  "Preview the dashboard flow: OVI score, pillar signals, and GiA prompts moving from signal to insight to action.": "Vista previa del flujo del dashboard: puntaje OVI, señales por pilar y prompts de GiA que avanzan de señal a insight y accion.",
  "Signal detected": "Señal detectada",
  "Difficulty speaking up with managers appears across multiple responses.": "La dificultad para hablar con managers aparece en multiples respuestas.",
  "The organization is already talking. COIREA listens for the signals leaders usually hear too late.": "La organizacion ya esta hablando. COIREA escucha las señales que los lideres suelen oir demasiado tarde.",
  "The hidden tension becomes visible.": "La tension oculta se vuelve visible.",
  "Insight": "Insight",
  "Psychological safety is fragile at the leadership interface.": "La seguridad psicologica esta fragil en la interfaz de liderazgo.",
  "GiA connects the signal across collaboration and leadership, separating isolated comments from a real system pattern.": "GiA conecta la señal entre colaboracion y liderazgo, separando comentarios aislados de un patron real del sistema.",
  "The symptom becomes a pattern.": "El sintoma se convierte en patron.",
  "Next action": "Siguiente accion",
  "Review collaboration and leadership together with a Steward.": "Revisar colaboracion y liderazgo junto a un Steward.",
  "The platform turns the pattern into a focused next move, supported by human judgment and measurable follow-through.": "La plataforma convierte el patron en un siguiente paso enfocado, apoyado por criterio humano y seguimiento medible.",
  "Leaders hear the truth earlier.": "Los lideres escuchan la verdad antes.",
  "View full analysis": "Ver analisis completo",
  "High": "Alto",
  "Medium": "Medio",
  "Low": "Bajo",
  "Suggested actions": "Acciones sugeridas",
  "Manager listening ritual": "Ritual de escucha con managers",
  "Leadership calibration": "Calibracion de liderazgo",
  "Team norms reset": "Reset de acuerdos del equipo",
  "High impact": "Alto impacto",
  "Medium impact": "Impacto medio",
  "The business impact": "El impacto en el negocio",
  "Turn hidden friction into visible momentum.": "Convierte friccion oculta en momentum visible.",
  "Before COIREA, the company may still be moving, but energy leaks through miscommunication, rework, bottlenecks, and invisible capacity strain. COIREA makes those patterns visible, then helps leaders convert them into aligned action.": "Antes de COIREA, la empresa puede seguir moviendose, pero pierde energia en mala comunicacion, retrabajo, cuellos de botella y desgaste invisible. COIREA hace visibles esos patrones y ayuda a los lideres a convertirlos en accion alineada.",
  "Before COIREA": "Antes de COIREA",
  "The system is working, but leaking energy.": "El sistema funciona, pero pierde energia.",
  "unclear center": "centro poco claro",
  "The same decision, postponed again": "La misma decision, postergada otra vez",
  "The same meeting, every other week": "La misma reunion, semana por medio",
  "Good people who quietly disengage": "Buenas personas que se desconectan en silencio",
  "With COIREA": "Con COIREA",
  "The system connects and starts moving in rhythm.": "El sistema se conecta y empieza a moverse en ritmo.",
  "living signal": "señal viva",
  "Shared visibility": "Visibilidad compartida",
  "Aligned decisions": "Decisiones alineadas",
  "Focused execution": "Ejecucion enfocada",
  "Sustained capacity": "Capacidad sostenible",
  "Early signals": "Señales tempranas",
  "Leadership aligned on the same signal": "Liderazgo alineado sobre la misma señal",
  "Issues visible before they become crises": "Problemas visibles antes de convertirse en crisis",
  "Teams that move without constant realignment": "Equipos que avanzan sin realineacion constante",
  "sees itself": "se ve a si mismo",
  "The system": "El sistema",
  "How COIREA works": "Como funciona COIREA",
  "From signal to aligned action.": "De señal a accion alineada.",
  "COIREA does not start by adding more pressure. It starts by helping the organization see itself clearly, then translates that clarity into a rhythm of action, learning, and regeneration.": "COIREA no empieza agregando mas presion. Empieza ayudando a la organizacion a verse con claridad y luego traduce esa claridad en un ritmo de accion, aprendizaje y regeneracion.",
  "GiA does not give generic answers. It reads your organization and helps you reflect.": "GiA no entrega respuestas genericas. Lee tu organizacion y ayuda a reflexionar.",
  "GiA means Guided Intelligence for Alignment. Instead of external models, it learns from your organization's own signals and turns them into specific, contextual guidance.": "GiA significa Guided Intelligence for Alignment. En lugar de modelos externos, aprende de las señales de tu propia organizacion y las convierte en orientacion especifica y contextual.",
  "AI + Human Wisdom": "IA + sabiduria humana",
  "Question": "Pregunta",
  "What environment could you create so people feel safe enough to tell the truth early?": "Que entorno podrias crear para que las personas se sientan lo suficientemente seguras para decir la verdad antes?",
  "Is COIREA for you?": "Es COIREA para ti?",
  "Start with a signal, not a sales pitch.": "Empieza con una señal, no con un discurso de venta.",
  "Answer three prompts and see which part of your People Operating System may be asking for attention.": "Responde tres preguntas y mira que parte de tu People Operating System podria estar pidiendo atencion.",
  "Starting signal": "Señal inicial",
  "Apply to work with COIREA": "Postular para trabajar con COIREA",
  "Try again": "Intentar de nuevo",
  "Ready for next step": "Listo para el siguiente paso",
  "Keep going": "Sigue avanzando",
  "Questions leaders ask": "Preguntas que hacen los lideres",
  "Clear answers about COIREA and the People Operating System.": "Respuestas claras sobre COIREA y el People Operating System.",
  "These answers are written for leaders evaluating COIREA, and structured clearly so search engines and AI assistants can understand the concept without guessing.": "Estas respuestas estan escritas para lideres que evaluan COIREA y estructuradas para que buscadores y asistentes de IA entiendan el concepto sin adivinar.",
  "Read the full People Operating System article": "Leer el articulo completo sobre People Operating System",
  "Is Your Organization Ready to See Itself Clearly?": "Esta tu organizacion lista para verse con claridad?",
  "COIREA is not for every organization. It is for the ones that sense something needs to shift, and are ready to look at it honestly, with the right support alongside them.": "COIREA no es para todas las organizaciones. Es para aquellas que sienten que algo necesita moverse y estan listas para mirarlo honestamente, con el apoyo correcto a su lado.",
  "Every organization enters with a Steward. This is not a software subscription. It is an accompanied transformation. Applications are reviewed personally.": "Cada organizacion entra con un Steward. Esto no es una suscripcion de software. Es una transformacion acompañada. Las solicitudes se revisan personalmente.",
  "Start with fit, not pressure.": "Empieza con encaje, no con presion.",
  "COIREA is for organizations that sense something needs to shift, and are ready to look at it honestly with the right support alongside them.": "COIREA es para organizaciones que sienten que algo necesita cambiar y estan listas para mirarlo honestamente con el apoyo correcto.",
  "Complete the application below. If there is a genuine fit, COIREA will reach out within 5 business days.": "Completa la solicitud abajo. Si hay un encaje real, COIREA se pondra en contacto dentro de 5 dias habiles.",
  "Who you are": "Quien eres",
  "Your name": "Tu nombre",
  "Email address": "Correo electronico",
  "Organization name": "Nombre de la organizacion",
  "Your role": "Tu rol",
  "Your system": "Tu sistema",
  "Where does your organization feel the most friction right now? Select what resonates.": "Donde siente mas friccion tu organizacion ahora? Selecciona lo que resuene.",
  "Our direction isn't as shared as it needs to be": "Nuestra direccion no esta tan compartida como deberia",
  "Leadership doesn't always move as one": "El liderazgo no siempre se mueve como uno",
  "Our strategy doesn't translate into how we actually work day to day": "Nuestra estrategia no se traduce en como trabajamos dia a dia",
  "There are communication gaps between teams or levels": "Hay brechas de comunicacion entre equipos o niveles",
  "The pace we're working at isn't sustainable": "El ritmo al que estamos trabajando no es sostenible",
  "What would shift in your organization if this changed?": "Que cambiaria en tu organizacion si esto se moviera?",
  "2-3 sentences is enough": "2-3 frases son suficientes",
  "Context": "Contexto",
  "Team size": "Tamaño del equipo",
  "Send my application": "Enviar mi solicitud",
  "Sending...": "Enviando...",
  "A Steward reads every application personally. If there is a genuine fit, we will reach out within 5 business days.": "Un Steward lee cada solicitud personalmente. Si hay un encaje real, responderemos dentro de 5 dias habiles.",
  "About": "Sobre COIREA",
  "Organizations don't fail from lack of strategy. They fail when people can't sustain it.": "Las organizaciones no fallan por falta de estrategia. Fallan cuando las personas no pueden sostenerla.",
  "COIREA was founded to close the gap between how organizations are designed and how people actually experience them. Not through restructuring. Through coherence.": "COIREA nace para cerrar la brecha entre como se diseñan las organizaciones y como las personas realmente las viven. No a traves de reestructuracion. A traves de coherencia.",
  "Inspired by nature": "Inspirado en la naturaleza",
  "COIREA is inspired by the intelligence of living systems.": "COIREA se inspira en la inteligencia de los sistemas vivos.",
  "Forests, mycelium, rivers, and ecosystems show us that resilience is relational. Nothing evolves alone. The same is true inside organizations.": "Bosques, micelio, rios y ecosistemas nos muestran que la resiliencia es relacional. Nada evoluciona solo. Lo mismo ocurre dentro de las organizaciones.",
  "Living systems": "Sistemas vivos",
  "Regeneration": "Regeneracion",
  "Distributed intelligence": "Inteligencia distribuida",
  "Why we exist": "Por que existimos",
  "Organizations are living systems. When they're well-designed, people don't just work, they grow.": "Las organizaciones son sistemas vivos. Cuando estan bien diseñadas, las personas no solo trabajan: crecen.",
  "Our mission is to help purpose-driven organizations measure and strengthen the conditions that allow both business and people to regenerate. We call this the People Operating System, five pillars that determine whether an organization can grow without breaking.": "Nuestra mision es ayudar a organizaciones con proposito a medir y fortalecer las condiciones que permiten que el negocio y las personas se regeneren. A esto le llamamos People Operating System: cinco pilares que determinan si una organizacion puede crecer sin romperse.",
  "What we believe": "Lo que creemos",
  "Frequently asked questions": "Preguntas frecuentes",
  "The concepts behind COIREA, clarified.": "Los conceptos detras de COIREA, aclarados.",
  "Every organization enters with a Steward. Applications are reviewed personally so the first conversation begins with context, care, and honesty.": "Cada organizacion entra con un Steward. Las solicitudes se revisan personalmente para que la primera conversacion comience con contexto, cuidado y honestidad.",
  "A Steward reads every application personally.": "Un Steward lee cada solicitud personalmente.",
  "If there is a genuine fit, COIREA will reach out within 5 business days.": "Si hay un encaje real, COIREA respondera dentro de 5 dias habiles.",
  "Thinking for organizations ready to evolve.": "Ideas para organizaciones listas para evolucionar.",
  "Featured": "Destacado",
  "The Five Pillars of the People Operating System": "Los cinco pilares del People Operating System",
  "A guide to the five dimensions that determine how well your organization functions as a living system, and what to strengthen first.": "Una guia sobre las cinco dimensiones que determinan que tan bien funciona tu organizacion como sistema vivo, y que fortalecer primero.",
  "Read more": "Leer mas",
  "Explore by theme": "Explorar por tema",
  "Search insights...": "Buscar insights...",
  "Loading posts...": "Cargando posts...",
  "insights available.": "insights disponibles.",
  "No insights match that search yet. Try another theme or keyword.": "Todavia no hay insights que coincidan. Prueba otro tema o palabra clave.",
  "Load more insights": "Cargar mas insights",
  "Organizational intelligence for growth that builds capacity.": "Inteligencia organizacional para un crecimiento que construye capacidad.",
  "Concept prototype. Selected claims and data are illustrative pending owner confirmation.": "Prototipo conceptual. Algunas afirmaciones y datos son ilustrativos hasta confirmacion de la dueña.",
  "Ask GiA": "Preguntale a GiA",
  "Questions, clarity, or a human next step": "Preguntas, claridad o un siguiente paso humano",
  "Friendly guide, not a replacement for a human": "Guia cercana, no reemplazo de una persona",
  "Ask about COIREA, OVI, GiA...": "Pregunta sobre COIREA, OVI, GiA...",
  "Hi, I'm GiA. Think of me as a friendly guide inside COIREA. I can clarify doubts, help you explore what your organization may be sensing, and point you toward a Steward when a real conversation would be better.": "Hola, soy GiA. Piensame como una guia cercana dentro de COIREA. Puedo aclarar dudas, ayudarte a explorar lo que tu organizacion podria estar sintiendo y orientarte hacia un Steward cuando una conversacion humana sea mejor.",
  "Could COIREA help us?": "Podria COIREA ayudarnos?",
  "What does the platform do?": "Que hace la plataforma?",
  "Who is GiA?": "Quien es GiA?",
  "Can I talk to someone?": "Puedo hablar con alguien?",
  "How does the first step work?": "Como funciona el primer paso?",
  "What should I ask a Steward?": "Que deberia preguntarle a un Steward?",
  "Show me something to read": "Muestrame algo para leer",
  "Shared direction that acts as a structural force.": "Direccion compartida que actua como una fuerza estructural.",
  "Direction is present, but it may not yet guide every decision under pressure.": "La direccion esta presente, pero quizas todavia no guia cada decision bajo presion.",
  "Prioritization": "Priorizacion",
  "Decision speed": "Velocidad de decision",
  "Cultural alignment": "Alineacion cultural",
  "Do people know what matters most when no leader is in the room?": "Las personas saben que es lo mas importante cuando ningun lider esta en la sala?",
  "The quality of decisions, presence, and alignment between what leaders say and how the organization moves.": "La calidad de las decisiones, la presencia y la alineacion entre lo que los lideres dicen y como se mueve la organizacion.",
  "Leadership energy is visible, but the system may be receiving mixed signals.": "La energia de liderazgo es visible, pero el sistema podria estar recibiendo señales mixtas.",
  "Ownership": "Responsabilidad",
  "Trust": "Confianza",
  "Escalation patterns": "Patrones de escalamiento",
  "Where are people waiting for permission instead of moving with clarity?": "Donde estan las personas esperando permiso en vez de moverse con claridad?",
  "The degree to which priorities are clear, shared, and connected to day-to-day execution.": "El grado en que las prioridades son claras, compartidas y conectadas con la ejecucion diaria.",
  "Strategic intent is active, but daily work may still be pulling attention in too many directions.": "La intencion estrategica esta activa, pero el trabajo diario puede estar dispersando la atencion en demasiadas direcciones.",
  "Focus": "Foco",
  "Execution rhythm": "Ritmo de ejecucion",
  "Resource allocation": "Asignacion de recursos",
  "Which priority is absorbing energy without moving the system forward?": "Que prioridad esta absorbiendo energia sin mover el sistema hacia adelante?",
  "How well teams communicate, coordinate, and build trust across roles and levels.": "Que tan bien los equipos se comunican, coordinan y construyen confianza entre roles y niveles.",
  "The strongest friction is relational: information may be arriving late, softened, or fragmented.": "La friccion mas fuerte es relacional: la informacion puede estar llegando tarde, suavizada o fragmentada.",
  "Feedback loops": "Ciclos de feedback",
  "Cross-team trust": "Confianza entre equipos",
  "Rework": "Retrabajo",
  "What truth is the organization learning too late?": "Que verdad esta aprendiendo la organizacion demasiado tarde?",
  "The structural conditions that allow people to perform sustainably without depleting capacity.": "Las condiciones estructurales que permiten rendir de forma sostenible sin agotar capacidad.",
  "Capacity is holding, but the system may be relying on personal resilience more than healthy structure.": "La capacidad se sostiene, pero el sistema podria estar dependiendo mas de resiliencia personal que de una estructura sana.",
  "Burnout risk": "Riesgo de burnout",
  "Retention": "Retencion",
  "Sustainable performance": "Rendimiento sostenible",
  "Where is performance being maintained by exhaustion?": "Donde se esta sosteniendo el rendimiento a costa del agotamiento?",
  "Vision is present, but not yet guiding every decision.": "La vision esta presente, pero aun no guia cada decision.",
  "GiA is seeing moments where priorities may still depend on leadership interpretation instead of shared direction.": "GiA observa momentos donde las prioridades todavia pueden depender de la interpretacion del liderazgo en vez de una direccion compartida.",
  "Leadership signals are active, but alignment may be uneven.": "Las señales de liderazgo estan activas, pero la alineacion puede ser desigual.",
  "GiA suggests reviewing where ownership, permission, and decision rights are slowing the system down.": "GiA sugiere revisar donde la responsabilidad, el permiso y los derechos de decision estan ralentizando el sistema.",
  "Strategy has momentum, but focus may be spreading too thin.": "La estrategia tiene momentum, pero el foco puede estar demasiado disperso.",
  "GiA is detecting a gap between strategic intent and what teams are actually protecting day to day.": "GiA detecta una brecha entre la intencion estrategica y lo que los equipos realmente protegen dia a dia.",
  "Collaboration is limiting the system's evolutionary potential.": "La colaboracion esta limitando el potencial evolutivo del sistema.",
  "People are holding back with managers. Review collaboration and leadership together.": "Las personas se estan guardando cosas con sus managers. Revisa colaboracion y liderazgo en conjunto.",
  "Well-Being is holding, but capacity may depend on personal resilience.": "El bienestar se sostiene, pero la capacidad puede depender de resiliencia personal.",
  "GiA recommends checking whether sustainable performance is designed into the system or carried by individuals.": "GiA recomienda revisar si el rendimiento sostenible esta diseñado en el sistema o si lo cargan las personas.",
  "When something goes wrong, people in my organization know instinctively what the right call is, without needing to ask me.": "Cuando algo sale mal, las personas en mi organizacion saben instintivamente cual es la decision correcta, sin tener que preguntarme.",
  "My leadership team has the difficult conversations about what isn't working, not just about what is.": "Mi equipo de liderazgo tiene conversaciones dificiles sobre lo que no esta funcionando, no solo sobre lo que si funciona.",
  "The priorities we agreed on three months ago still reflect what people are actually working on today.": "Las prioridades que acordamos hace tres meses todavia reflejan lo que las personas realmente estan trabajando hoy.",
  "People in my organization speak up when they see something going wrong, even when it's uncomfortable to do so.": "Las personas en mi organizacion hablan cuando ven que algo va mal, incluso cuando hacerlo es incomodo.",
  "My highest performers are also the most sustainable in how they work, I'm not worried about losing them.": "Mis personas de mayor rendimiento tambien trabajan de forma sostenible; no me preocupa perderlas.",
  "60-second system signal check": "Chequeo de señales del sistema en 60 segundos",
  "Answer honestly. This is not a scorecard. It is a first signal of how your organization behaves under pressure.": "Responde con honestidad. Esto no es una evaluacion final. Es una primera señal de como se comporta tu organizacion bajo presion.",
  "Five dimensions": "Cinco dimensiones",
  "One starting signal": "Una señal inicial",
  "Clear next step": "Siguiente paso claro",
  "OVI tiers": "Niveles OVI",
  "Systemic Coherence": "Coherencia sistemica",
  "Emerging Alignment": "Alineacion emergente",
  "Fragile Stability": "Estabilidad fragil",
  "Structural Risk": "Riesgo estructural",
  "OVI scoring tiers": "Niveles de puntaje OVI",
  "Diagnostic progress": "Progreso del diagnostico",
  "Choose the number that feels most true today.": "Elige el numero que se sienta mas verdadero hoy.",
  "Rate from strongly disagree to strongly agree": "Califica desde muy en desacuerdo hasta muy de acuerdo",
  "Signal captured": "Señal capturada",
  "Strongly disagree": "Muy en desacuerdo",
  "Strongly agree": "Muy de acuerdo",
  "Starting system signal": "Señal inicial del sistema",
  "Pattern emerging": "Patron emergente",
  "Early signal": "Señal temprana",
  "Awaiting first signal": "Esperando la primera señal",
  "Your system may be carrying hidden friction.": "Tu sistema podria estar cargando friccion oculta.",
  "A full COIREA diagnostic would help identify where energy is leaking and which dimension needs attention first.": "Un diagnostico completo de COIREA ayudaria a identificar donde se esta filtrando energia y que dimension necesita atencion primero.",
  "Your system shows potential, but alignment may be inconsistent.": "Tu sistema muestra potencial, pero la alineacion puede ser inconsistente.",
  "There are useful signals here. COIREA can help connect them across the five dimensions before friction becomes structural.": "Hay señales utiles aqui. COIREA puede ayudar a conectarlas entre las cinco dimensiones antes de que la friccion se vuelva estructural.",
  "Your system may already have strong coherence.": "Tu sistema podria tener una coherencia fuerte.",
  "COIREA can help protect that coherence as the organization grows, adds complexity, or enters a new strategic phase.": "COIREA puede ayudar a proteger esa coherencia mientras la organizacion crece, suma complejidad o entra en una nueva etapa estrategica.",
  "What is COIREA?": "Que es COIREA?",
  "COIREA is a People Operating System for organizations that care. It helps leaders measure and strengthen the human system behind performance across Vision, Leadership, Strategy, Collaboration, and Well-Being.": "COIREA es un People Operating System para organizaciones que cuidan. Ayuda a los lideres a medir y fortalecer el sistema humano detras del rendimiento en Vision, Liderazgo, Estrategia, Colaboracion y Bienestar.",
  "What is a People Operating System?": "Que es un People Operating System?",
  "A People Operating System is the living structure behind how people make decisions, collaborate, execute strategy, and sustain performance. It makes the invisible patterns of an organization visible enough to improve.": "Un People Operating System es la estructura viva detras de como las personas deciden, colaboran, ejecutan estrategia y sostienen rendimiento. Hace visibles los patrones invisibles de una organizacion para poder mejorarlos.",
  "Is COIREA a platform or a consultancy?": "COIREA es una plataforma o una consultoria?",
  "COIREA is both a platform and a strategic support system. The platform measures organizational health, while stewardship helps leaders interpret signals and turn insight into action.": "COIREA es una plataforma y tambien un sistema de acompañamiento estrategico. La plataforma mide salud organizacional, mientras el stewardship ayuda a interpretar señales y convertir insight en accion.",
  "What does COIREA measure?": "Que mide COIREA?",
  "COIREA measures organizational health through five pillars: Vision, Leadership, Strategy, Collaboration, and Well-Being. Together, these pillars show whether the organization is coherent, aligned, and able to perform sustainably.": "COIREA mide la salud organizacional a traves de cinco pilares: Vision, Liderazgo, Estrategia, Colaboracion y Bienestar. Juntos muestran si la organizacion esta coherente, alineada y puede rendir de forma sostenible.",
  "What is OVI?": "Que es OVI?",
  "OVI means Organizational Vitality Index. It is COIREA's diagnostic view of how healthy and coherent an organization is across the five pillars of its People Operating System.": "OVI significa Organizational Vitality Index. Es la mirada diagnostica de COIREA sobre que tan sana y coherente esta una organizacion en los cinco pilares de su People Operating System.",
  "What is GiA?": "Que es GiA?",
  "GiA means Guided Intelligence for Alignment. It is COIREA's intelligence layer that turns organizational signals into questions, insights, and suggested next actions for leaders.": "GiA significa Guided Intelligence for Alignment. Es la capa de inteligencia de COIREA que convierte señales organizacionales en preguntas, insights y siguientes acciones sugeridas para lideres.",
  "Show more insights": "Mostrar mas insights",
  "min read": "min de lectura",
  "By": "Por",
  "Direct answer": "Respuesta directa",
  "COIREA context": "Contexto COIREA",
  "Connect this insight to the system": "Conecta este insight con el sistema",
  "Keep reading": "Seguir leyendo",
  "Related insights": "Insights relacionados",
  "Back to Insights": "Volver a Insights",
  "Loading article...": "Cargando articulo...",
  "Preparing this COIREA insight.": "Preparando este insight de COIREA.",
  "Loading the article...": "Cargando el articulo...",
  "Post not found": "Articulo no encontrado",
  "This article could not be found.": "Este articulo no se pudo encontrar.",
  "The post may have moved or may not be published.": "El articulo puede haber cambiado de lugar o no estar publicado.",
  "COIREA insight": "Insight COIREA",
  "Select one": "Selecciona una opcion",
  "Thank you. Your application was sent to COIREA. A Steward will review it personally.": "Gracias. Tu solicitud fue enviada a COIREA. Un Steward la revisara personalmente.",
  "The application form is ready, but the email service still needs to be connected. Please email hello@coirea.com directly for now.": "El formulario esta listo, pero el servicio de email todavia necesita conectarse. Por ahora, escribe directamente a hello@coirea.com.",
  "Something went wrong. Please try again.": "Algo salio mal. Intentalo nuevamente.",
  "Something went wrong. Please email hello@coirea.com directly.": "Algo salio mal. Por favor escribe directamente a hello@coirea.com.",
  "The core COIREA concept behind organizational coherence.": "El concepto central de COIREA detras de la coherencia organizacional.",
  "Apply to explore whether COIREA is the right fit.": "Postula para explorar si COIREA es el encaje correcto.",
  "The Organizational Vitality Index across COIREA's five dimensions.": "El Organizational Vitality Index a traves de las cinco dimensiones de COIREA.",
  "Guided Intelligence for Alignment turns signals into next actions.": "Guided Intelligence for Alignment convierte señales en siguientes acciones.",
  "More essays on leadership, culture, and organizational evolution.": "Mas ensayos sobre liderazgo, cultura y evolucion organizacional."
};

function translateSpanishText(text = "") {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return text;
  if (spanishTextMap[text]) return spanishTextMap[text];
  if (spanishTextMap[compact]) return spanishTextMap[compact];
  let translated = compact;
  Object.entries(spanishTextMap).forEach(([source, target]) => {
    const sourceCompact = source.replace(/\s+/g, " ").trim();
    if (sourceCompact && translated.includes(sourceCompact)) {
      translated = translated.split(sourceCompact).join(target);
    }
  });
  return translated === compact ? text : translated;
}

function t(text = "", spanish = isSpanishPath()) {
  return spanish ? translateSpanishText(text) : text;
}

function SpanishCopyLayer() {
  useEffect(() => {
    if (!isSpanishPath()) return undefined;

    const translateNode = (node) => {
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"].includes(parent.tagName)) return;
      if (parent.closest(".legacy-article-content")) return;
      const next = translateSpanishText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    };

    const translateAttributes = (root = document.body) => {
      root.querySelectorAll("[placeholder], [aria-label], [alt], [title]").forEach((element) => {
        ["placeholder", "aria-label", "alt", "title"].forEach((attr) => {
          const value = element.getAttribute(attr);
          if (!value) return;
          const next = translateSpanishText(value);
          if (next !== value) element.setAttribute(attr, next);
        });
      });
    };

    const translateAll = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(translateNode);
      translateAttributes();
      document.documentElement.lang = "es";
    };

    translateAll();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateNode(node);
          if (node.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(translateNode);
            translateAttributes(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

function localizedPath(path, isEs = isSpanishPath()) {
  if (!path || path === "#") return path || "/";
  if (/^(https?:|mailto:|tel:)/i.test(path)) return path;
  const cleanPath = routeFromPath(path);
  if (cleanPath === "/") return isEs ? "/es" : "/";
  return isEs ? `/es${cleanPath}` : cleanPath;
}

function alternateLanguagePath(pathname = getCurrentPathname()) {
  const isEs = isSpanishPath(pathname);
  return localizedPath(routeFromPath(pathname), !isEs);
}

function BrandMark({ compact = false, isEs = isSpanishPath() }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href={localizedPath("/", isEs)} aria-label="COIREA home">
      <img src="/assets/coirea-logo.png" alt="COIREA" />
    </a>
  );
}

function Reveal({ children, className = "", delay = 0, amount = 0.15 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 34, filter: "blur(10px)" }}
      whileInView={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.78, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.2 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

const seoByRoute = {
  "/": {
    title: "COIREA - The People Operating System for Organizations That Care",
    description:
      "COIREA is the People Operating System for organizations that care, helping leaders measure organizational health and turn hidden signals into aligned action.",
  },
  "/about": {
    title: "About COIREA - People Operating System and Founder Story",
    description:
      "Learn why COIREA exists, meet founder María José Figueroa, and understand the living-systems principles behind the People Operating System.",
  },
  "/insights": {
    title: "Insights - COIREA",
    description:
      "Thinking for organizations ready to evolve, with essays on workplace evolution, leadership consciousness, and the People Operating System.",
  },
  "/conversation": {
    title: "Book a Conversation - COIREA",
    description:
      "Apply to work with COIREA. Share where your organization feels friction and request a conversation with a COIREA Steward.",
  },
  "/insights/what-is-a-people-operating-system": {
    title: "What Is a People Operating System? - COIREA",
    description:
      "A People Operating System is the human infrastructure behind how organizations make decisions, collaborate, execute strategy, and sustain performance.",
  },
};

const spanishSeoByRoute = {
  "/": {
    title: "COIREA - El People Operating System para organizaciones que cuidan",
    description:
      "COIREA ayuda a lideres a medir la salud organizacional y convertir señales invisibles en accion alineada.",
  },
  "/about": {
    title: "Sobre COIREA - People Operating System e historia fundadora",
    description:
      "Conoce por que existe COIREA y los principios de sistemas vivos detras del People Operating System.",
  },
  "/insights": {
    title: "Insights - COIREA",
    description:
      "Ideas para organizaciones listas para evolucionar: liderazgo consciente, cultura, bienestar y sistemas organizacionales.",
  },
  "/conversation": {
    title: "Agendar una conversacion - COIREA",
    description:
      "Comparte donde tu organizacion siente friccion y solicita una conversacion con un Steward de COIREA.",
  },
  "/insights/what-is-a-people-operating-system": {
    title: "Que es un People Operating System? - COIREA",
    description:
      "Un People Operating System es la infraestructura humana detras de como una organizacion decide, colabora, ejecuta estrategia y sostiene energia.",
  },
};

const defaultShareImage = "https://www.coirea.com/assets/coirea-social-card.png";

function absolutePublicUrl(url = defaultShareImage) {
  if (!url) return defaultShareImage;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `https://www.coirea.com${url}`;
  return `https://www.coirea.com/${url}`;
}

function ensureMeta(selector, createAttrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    Object.entries(createAttrs).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  return node;
}

function SEOManager() {
  useEffect(() => {
    const path = getCurrentPathname();
    const isEs = isSpanishPath(path);
    const route = routeFromPath(path);
    const seo = isEs ? (spanishSeoByRoute[route] || spanishSeoByRoute["/"]) : (seoByRoute[route] || seoByRoute["/"]);
    const canonicalPath = isEs ? path : route;
    const canonicalHref = `https://www.coirea.com${canonicalPath === "/" ? "/" : canonicalPath}`;

    document.title = seo.title;
    ensureMeta('meta[name="description"]', { name: "description" }).setAttribute("content", seo.description);
    ensureMeta('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", seo.title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", seo.description);
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", canonicalHref);
    ensureMeta('meta[property="og:image"]', { property: "og:image" }).setAttribute("content", defaultShareImage);
    ensureMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url" }).setAttribute("content", defaultShareImage);
    ensureMeta('meta[property="og:image:type"]', { property: "og:image:type" }).setAttribute("content", "image/png");
    ensureMeta('meta[property="og:image:width"]', { property: "og:image:width" }).setAttribute("content", "1200");
    ensureMeta('meta[property="og:image:height"]', { property: "og:image:height" }).setAttribute("content", "630");
    ensureMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }).setAttribute("content", "COIREA - The people system behind performance.");
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }).setAttribute("content", seo.title);
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }).setAttribute("content", seo.description);
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" }).setAttribute("content", defaultShareImage);
    ensureMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }).setAttribute("content", "COIREA - The people system behind performance.");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalHref);
  }, []);

  return null;
}

function AnimatedNumber({ value, delay = 0, className = "", replayKey = "", play = true }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView) return undefined;
    if (!play) {
      setDisplay(value);
      return undefined;
    }
    if (reduced) {
      setDisplay(value);
      return undefined;
    }

    let controls;
    const timeout = window.setTimeout(() => {
      controls = animate(0, value, {
        duration: 1.15,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => setDisplay(Math.round(latest)),
      });
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeout);
      controls?.stop();
    };
  }, [delay, inView, play, reduced, replayKey, value]);

  return <strong ref={ref} className={className}>{display}</strong>;
}

function AnimatedBar({ value, delay = 0, replayKey = "", play = true }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <div className="mini-track" ref={ref}>
      <motion.span
        style={{ width: `${value}%`, transformOrigin: "0 50%" }}
        initial={reduced || !play ? { scaleX: 1 } : { scaleX: 0 }}
        animate={inView || reduced || !play ? { scaleX: 1 } : { scaleX: 0 }}
        key={replayKey}
        transition={{ duration: 1.05, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

function AnimatedFocusBar({ value, delay = 0, active = true }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const shouldAnimate = active && (inView || reduced);

  return (
    <div ref={ref}>
      <motion.i
        style={{ width: `${value}%`, transformOrigin: "0 50%" }}
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={shouldAnimate ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

function RadarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="radar-tooltip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActiveRadarDot(props) {
  const { cx, cy, index, activeIndex } = props;
  if (index !== activeIndex || cx == null || cy == null) return null;

  return (
    <g className="radar-active-dot-svg">
      <circle cx={cx} cy={cy} r="9" className="radar-active-dot-svg__halo" />
      <circle cx={cx} cy={cy} r="5.5" className="radar-active-dot-svg__ring" />
      <circle cx={cx} cy={cy} r="3.2" className="radar-active-dot-svg__core" />
    </g>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const currentPath = getCurrentPathname();
  const isEs = isSpanishPath(currentPath);
  const languageHref = alternateLanguagePath(currentPath);
  const closeAll = () => {
    setOpen(false);
  };
  return (
    <header className="site-header">
      <ScrollProgress />
      <BrandMark isEs={isEs} />
      <nav className={open ? "nav nav--open" : "nav"} aria-label="Primary navigation">
        <a href={localizedPath("/", isEs)} onClick={closeAll}>Home</a>
        <a href={localizedPath("/insights", isEs)} onClick={closeAll}>Insights</a>
        <a href={localizedPath("/about", isEs)} onClick={closeAll}>About Us</a>
        <a className="language-link" href={languageHref} hrefLang={isEs ? "en" : "es"} onClick={closeAll}>{isEs ? "EN" : "ES"}</a>
      </nav>
      <a className="button button--outline header-cta" href={localizedPath("/conversation", isEs)}>
        Book a Conversation
      </a>
      <button
        className="menu-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        {open ? <X size={22} /> : <List size={22} />}
      </button>
    </header>
  );
}

function HealthDashboard() {
  const reduced = useReducedMotion();
  const spanish = isSpanishPath();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDimension = dimensions[activeIndex];
  const activeInsight = dashboardInsights[activeDimension.name];
  const localizedRadarData = useMemo(() => radarData.map((item) => ({
    ...item,
    subject: t(item.subject, spanish),
  })), [spanish]);

  useEffect(() => {
    if (reduced) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % dimensions.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [reduced]);

  return (
    <motion.div
      className="health-dashboard"
      initial={reduced ? false : { opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="dashboard-topline">
        <div>
          <span className="eyebrow">{t("Live system view", spanish)}</span>
          <h2>{t("People Operating System", spanish)}</h2>
        </div>
        <div className="live-status"><span /> {t("Updated now", spanish)}</div>
      </div>
      <div className="dashboard-grid">
        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height="100%" minWidth={220} minHeight={260}>
            <RadarChart data={localizedRadarData} outerRadius="70%">
              <PolarGrid stroke="rgba(245,241,229,.22)" radialLines={false} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#f4f0e5", fontSize: 11, fontFamily: "Manrope" }}
              />
              <Radar
                key={activeDimension.name}
                dataKey="value"
                stroke="#B56D4E"
                fill="#9BA987"
                fillOpacity={0.58}
                strokeWidth={2}
                dot={(props) => <ActiveRadarDot {...props} activeIndex={activeIndex} />}
                isAnimationActive={!reduced}
              />
              <Tooltip
                content={<RadarTooltip />}
                cursor={false}
                wrapperStyle={{ zIndex: 8, pointerEvents: "none" }}
                position={{ x: 18, y: 18 }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="health-score">
            <strong>62</strong>
            <span>{t("system score", spanish)}</span>
          </div>
          <div key={activeDimension.name} className="radar-tooltip radar-tooltip--auto">
            <span>{t(activeDimension.name, spanish)}</span>
            <AnimatedNumber
              value={activeDimension.value}
              replayKey={`active-tooltip-${activeDimension.name}-${activeIndex}`}
            />
          </div>
        </div>
        <div className="dimension-list">
          {dimensions.map(({ name, value, icon: Icon }, index) => (
            <div className={`dimension-row ${activeIndex === index ? "dimension-row--active" : ""}`} key={name}>
              <Icon size={18} weight="light" />
              <span>{t(name, spanish)}</span>
              <AnimatedBar value={value} delay={0} replayKey={`${name}-${activeIndex}`} play={activeIndex === index} />
              <AnimatedNumber value={value} delay={0} replayKey={`${name}-${activeIndex}`} play={activeIndex === index} />
            </div>
          ))}
        </div>
      </div>
      <p className="score-disclaimer">{t("Scores shown are illustrative. In your live platform, these update continuously.", spanish)}</p>
      <div className="gia-insight">
        <div className="gia-badge"><Brain size={18} /> {t("GiA insight", spanish)}</div>
        <div key={activeDimension.name} className="gia-insight-copy">
          <strong>{t(activeInsight.title, spanish)}</strong>
          <p>{t(activeInsight.text, spanish)}</p>
        </div>
        <button type="button">{t("View insight", spanish)} <ArrowUpRight size={16} /></button>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-image" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-content">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.55 }}>COIREA · The People Operating System</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.74, ease: [0.16, 1, 0.3, 1] }}>The People Operating System for organizations that care.</motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}>
            COIREA helps organizations build cohesive teams, because growth should
            increase coherence, not deplete capacity. When the People System is aligned,
            organizations do not just perform better, they regenerate.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.62 }}>
            <a className="button button--primary" href="/conversation">
              Book a conversation <ArrowRight size={18} />
            </a>
            <a className="button button--light" href="#platform">
              See how it works
            </a>
          </motion.div>
          <motion.div className="trust-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52, duration: 0.6 }}><Leaf size={17} /> AI + Human Wisdom. Grounded in systemic thinking.</motion.div>
        </motion.div>
        <HealthDashboard />
      </div>
      <a className="scroll-cue" href="#methodology" aria-label="Scroll to the COIREA methodology">
        <span>See the system</span>
        <ArrowRight size={16} />
      </a>
    </section>
  );
}

function Methodology() {
  const [active, setActive] = useState(dimensions[0]);
  const [hasUserSelectedPillar, setHasUserSelectedPillar] = useState(false);
  const ActiveIcon = active.icon;
  const spanish = isSpanishPath();

  useEffect(() => {
    if (hasUserSelectedPillar) return undefined;

    const interval = window.setInterval(() => {
      setActive((current) => {
        const currentIndex = dimensions.findIndex((item) => item.name === current.name);
        const nextIndex = (currentIndex + 1) % dimensions.length;
        return dimensions[nextIndex];
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [hasUserSelectedPillar]);

  const handlePillarSelect = (index) => {
    setHasUserSelectedPillar(true);
    setActive(dimensions[index]);
  };

  return (
    <section className="methodology section" id="methodology">
      <Reveal className="methodology-copy">
        <span className="eyebrow">{t("The methodology", spanish)}</span>
        <h2>{t("Five dimensions that determine if your organization can grow without breaking.", spanish)}</h2>
        <p>{t("The People Operating System is not a framework to read. It is a living structure to measure, align, and strengthen over time.", spanish)}</p>
      </Reveal>
      <Reveal className="pillar-system" delay={0.1}>
        <div className="pillar-orbit">
          <div className="pillar-instruction">
            <span>{t("Explore the system", spanish)}</span>
            <small>{t("Watch the system move, or select a dimension to explore.", spanish)}</small>
          </div>
          {dimensions.map(({ name, accent }, index) => (
            <button
              className={`pillar-node pillar-node--${accent} ${active.name === name ? "pillar-node--active" : ""}`}
              key={name}
              onClick={() => handlePillarSelect(index)}
              aria-pressed={active.name === name}
              type="button"
              style={{ "--i": index }}
            >
              <span>{t(name, spanish)}</span>
              <small>{t("Explore", spanish)}</small>
            </button>
          ))}
          <div className="core-pulse"><Leaf size={30} weight="light" /><span>{t("People", spanish)}<br />Operating<br />System</span></div>
        </div>
        <div className="pillar-detail">
          <AnimatePresence mode="wait">
            <motion.div
              className="pillar-detail-content"
              key={active.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <ActiveIcon size={34} weight="light" />
              <span>{t(active.name, spanish)} {t("signal", spanish)}</span>
              <AnimatedNumber key={active.name} value={active.value} className="pillar-score" />
              <p>{t(active.signal, spanish)}</p>
              <div className="pillar-symptoms">
                <small>{t("What this affects", spanish)}</small>
                <div>
                  {active.affects.map((item) => <b key={item}>{t(item, spanish)}</b>)}
                </div>
              </div>
              <div className="pillar-question">
                <small>{t("Reflection question", spanish)}</small>
                <p>{t(active.question, spanish)}</p>
              </div>
              <em>{t("Scores are illustrative. In the live platform, they update as the organization evolves.", spanish)}</em>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

function Platform() {
  const platformRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const maxPlatformProgressRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showPlatformDetails, setShowPlatformDetails] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setActiveStep(2);
      setShowPlatformDetails(true);
      return undefined;
    }

    let frame = 0;
    const updatePlatformState = () => {
      frame = 0;
      const node = platformRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const isScrollingDown = currentScrollY >= lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (rect.top > viewport * 0.16) {
        maxPlatformProgressRef.current = 0;
        setActiveStep(0);
        setShowPlatformDetails(false);
        return;
      }

      const scrollable = Math.max(1, rect.height - viewport * 0.4);
      const progress = Math.min(1, Math.max(0, (viewport * 0.16 - rect.top) / scrollable));

      if (isScrollingDown) {
        maxPlatformProgressRef.current = Math.max(maxPlatformProgressRef.current, progress);
      }

      const lockedProgress = maxPlatformProgressRef.current;
      const nextStep = lockedProgress < 0.3 ? 0 : lockedProgress < 0.58 ? 1 : 2;
      setActiveStep((current) => (current === nextStep ? current : nextStep));
      setShowPlatformDetails(lockedProgress >= 0.78);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePlatformState);
    };

    updatePlatformState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reduced]);

  return (
    <section className="platform section" id="platform" ref={platformRef}>
      <Reveal className="platform-copy">
        <span className="eyebrow">The platform</span>
        <h2>A platform that reads the signals your organization is already sending.</h2>
        <p>Real scores. Real patterns. Real action. COIREA follows the path from what people feel, to what the system is signaling, to what leaders can do next.</p>
        <a className="button button--outline" href="/conversation">Book a call to see it live <ArrowRight /></a>
        <ul className="benefit-list">
          {platformBenefits.map(({ icon: Icon, title, text }, index) => (
            <motion.li
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.42, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              key={title}
              className={activeStep === index ? "is-active" : activeStep > index ? "is-complete" : ""}
            >
              <Icon />
              <strong>{title}</strong>
              <span>{text}</span>
            </motion.li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="signal-board" delay={0.08}>
        <div className="signal-board-inner">
          <DashboardTour activeStep={activeStep} />
          <div className="signal-flow signal-flow--animated">
            {platformJourney.map(({ stage, title, text, outcome, icon: Icon }, index) => (
              <Fragment key={stage}>
                <motion.div
                  className={`flow-step flow-step--story flow-step--${index === 0 ? "signal" : index === 1 ? "insight" : "action"} ${activeStep === index ? "flow-step--active" : ""} ${activeStep > index ? "flow-step--complete" : ""}`}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flow-icon"><Icon size={21} /></div>
                  <span>{stage}</span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                  <small>{outcome}</small>
                </motion.div>
                {index < platformJourney.length - 1 && (
                  <motion.div className={`flow-arrow-wrap ${activeStep > index ? "flow-arrow-wrap--lit" : ""}`} aria-hidden="true">
                    <ArrowRight className="flow-arrow" />
                  </motion.div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
        <motion.div
          className={`focus-board platform-details ${showPlatformDetails ? "is-visible" : ""}`}
          initial={false}
          animate={showPlatformDetails ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!showPlatformDetails}
        >
          <div className="platform-details-content">
            <div className="focus-header">
              <div><Brain size={20} /> <strong>GiA</strong></div>
              <button type="button">View full analysis <ArrowRight /></button>
            </div>
            {[
              ["Collaboration", 54, "High"], ["Leadership", 63, "Medium"],
              ["Well-Being", 58, "Medium"], ["Strategy", 64, "Low"], ["Vision", 72, "Low"],
            ].map(([label, value, impact], index) => (
              <div className={`focus-row ${showPlatformDetails && index < 2 ? "is-reading" : ""}`} key={label}>
                <span>{label}</span>
                <AnimatedFocusBar value={value} delay={showPlatformDetails ? 0.15 + index * 0.08 : 0} active={showPlatformDetails} />
                <small className={`impact impact--${impact.toLowerCase()}`}>{impact}</small>
              </div>
            ))}
            <div className={`actions-board ${showPlatformDetails ? "is-active" : ""}`}>
              <span>Suggested actions</span>
              <div><Check /> Manager listening ritual <b>High impact</b></div>
              <div><Check /> Leadership calibration <b>Medium impact</b></div>
              <div><Check /> Team norms reset <b>Medium impact</b></div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}

function DashboardTour({ activeStep = 0 }) {
  const tourSteps = [
    ["01", "Sense", "Survey signals arrive"],
    ["02", "Read", "GiA detects patterns"],
    ["03", "Act", "Leaders align next moves"],
  ];

  return (
    <div className="dashboard-tour" aria-label="Twenty second dashboard tour concept">
      <div className="tour-frame">
        <div className="tour-topbar">
          <span />
          <strong>COIREA system tour</strong>
          <small>20 sec loop</small>
        </div>
        <div className="tour-body">
          <div className={`tour-screenshot tour-screenshot--step-${activeStep}`}>
            <img src="/assets/coirea-platform-soil-preview.jpeg" alt="COIREA platform dashboard showing SOIL organizational health, OVI evaluation, and GiA qualitative insights" />
            <span className="tour-scanline" />
            <span className="tour-hotspot tour-hotspot--signal" />
            <span className="tour-hotspot tour-hotspot--insight" />
            <span className="tour-hotspot tour-hotspot--action" />
            <div className="tour-screenshot-badge">
              <strong>SOIL</strong>
              <small>Real platform preview</small>
            </div>
          </div>
          <div className="tour-panel">
            {tourSteps.map(([number, title, text], index) => (
              <div
                key={title}
                className={activeStep === index ? "is-active" : activeStep > index ? "is-complete" : ""}
                style={{ "--delay": `${index * 1.2}s` }}
              >
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p>Preview the dashboard flow: OVI score, pillar signals, and GiA prompts moving from signal to insight to action.</p>
    </div>
  );
}

function ImpactShift() {
  const reduced = useReducedMotion();
  return (
    <section className="impact-shift section" id="impact">
      <Reveal className="impact-heading">
        <span className="eyebrow">The business impact</span>
        <h2>Turn hidden friction into visible momentum.</h2>
        <p>Before COIREA, the company may still be moving, but energy leaks through miscommunication, rework, bottlenecks, and invisible capacity strain. COIREA makes those patterns visible, then helps leaders convert them into aligned action.</p>
      </Reveal>

      <Reveal className="transformation-board" delay={0.08}>
        <div className="state-panel state-panel--before">
          <span className="state-label">Before COIREA</span>
          <h3>The system is working, but leaking energy.</h3>
          <div className="fragment-map" aria-hidden="true">
            <div className="broken-hub">
              <strong>?</strong>
              <small>unclear center</small>
            </div>
            {frictionSignals.map((item, index) => (
              <motion.i
                key={item}
                className={`fragment fragment--${index + 1}`}
                initial={reduced ? false : { opacity: 0, scale: 0.88 }}
                whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.48, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {item}
              </motion.i>
            ))}
            <span className="fault-line fault-line--1" />
            <span className="fault-line fault-line--2" />
            <span className="fault-line fault-line--3" />
          </div>
          <ul>
            <li>The same decision, postponed again</li>
            <li>The same meeting, every other week</li>
            <li>Good people who quietly disengage</li>
          </ul>
        </div>

        <div className="coirea-bridge" aria-hidden="true">
          <motion.div
            initial={reduced ? false : { scale: 0.82, opacity: 0 }}
            whileInView={reduced ? {} : { scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <Leaf size={26} weight="light" />
            <span>The system</span>
            <small>sees itself</small>
          </motion.div>
        </div>

        <div className="state-panel state-panel--after">
          <span className="state-label">With COIREA</span>
          <h3>The system connects and starts moving in rhythm.</h3>
          <div className="coherence-map" aria-hidden="true">
            <div className="coherence-core">
              <strong>OVI</strong>
              <small>living signal</small>
            </div>
            <div className="coherence-orbit">
              {harmonySignals.map((item, index) => (
                <motion.i
                  key={item}
                  className={`coherence-node coherence-node--${index + 1}`}
                  initial={reduced ? false : { opacity: 0 }}
                  whileInView={reduced ? {} : { opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.48, delay: 0.35 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="coherence-node__pill">{item}</span>
                </motion.i>
              ))}
            </div>
          </div>
          <ul>
            <li>Leadership aligned on the same signal</li>
            <li>Issues visible before they become crises</li>
            <li>Teams that move without constant realignment</li>
          </ul>
        </div>
      </Reveal>

      <div className="impact-evidence">
        {impactSignals.map((item, index) => (
          <Reveal className="impact-row" delay={index * 0.08} key={item.before}>
            <span>0{index + 1}</span>
            <p>{item.before}</p>
            <ArrowRight size={18} />
            <strong>{item.after}</strong>
          </Reveal>
        ))}
      </div>

      {false && (
      <Reveal className="testimonial-section" delay={0.12}>
        <div className="testimonial-intro">
          <span className="eyebrow">Testimonials paused</span>
          <p>Verified client quotes will be added when provided.</p>
        </div>
        <div className="testimonial-grid">
          {[].map((item, index) => (
            <motion.figure
              key={item.quote}
              className="testimonial-card"
              whileHover={{ y: -7 }}
              transition={{ duration: 0.22 }}
            >
              <blockquote>“{item.quote}”</blockquote>
              <figcaption>{item.role} 0{index + 1}</figcaption>
            </motion.figure>
          ))}
        </div>
      </Reveal>
      )}
    </section>
  );
}

function Approach() {
  const stages = [
    { number: "01", name: "Consultation", title: "Diagnose", text: "The OVI maps the current state of your People Operating System across all five pillars. This is the SOIL phase, where GiA surfaces the first signals and tensions.", icon: Pulse },
    { number: "02", name: "Grow", title: "Align and execute", text: "The five pillars are implemented step by step. A certified Steward accompanies the work.", icon: Lightbulb },
    { number: "03", name: "Flourish", title: "Evolve and regenerate", text: "The organization keeps learning. Capacity grows alongside performance.", icon: Leaf },
  ];
  return (
    <section className="approach section" id="approach">
      <Reveal className="section-heading">
        <span className="eyebrow">The process</span>
        <h2>Three phases. One continuous system.</h2>
      </Reveal>
      <div className="stage-line" aria-hidden="true" />
      <div className="stages">
        {stages.map(({ number, name, title, text, icon: Icon }, index) => (
          <Reveal className="stage" delay={index * 0.12} key={name}>
            <motion.div className="stage-icon" whileHover={{ rotate: 4, scale: 1.04 }} transition={{ duration: 0.25 }}>
              <Icon size={34} weight="light" />
            </motion.div>
            <div className="stage-number">{number}</div>
            <h3>{name}</h3>
            <strong>{title}</strong>
            <p>{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function GiaSection() {
  const giaExampleSteps = [
    ["Signal", "Difficulty speaking up with managers is appearing across multiple responses."],
    ["Insight", "Psychological safety is fragile at the leadership interface. This is a structural gap, not a personal issue."],
    ["Question", "What environment could you create so people feel safe enough to tell the truth early?"],
  ];

  return (
    <section className="gia-section section" id="gia">
      <Reveal className="gia-card-large">
        <div className="gia-card-header">
          <div className="gia-avatar"><Leaf size={20} weight="fill" /></div>
          <div><strong>GiA</strong><span>AI + Human Wisdom</span></div>
        </div>
        <h2>GiA does not give generic answers. It reads your organization and helps you reflect.</h2>
        <p>GiA means Guided Intelligence for Alignment. Instead of external models, it learns from your organization's own signals and turns them into specific, contextual guidance.</p>
      </Reveal>
      <Reveal className="gia-example" delay={0.1}>
        {giaExampleSteps.map(([label, text], index) => (
          <motion.div
            className={`gia-example-step gia-example-step--${index + 1}`}
            key={label}
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            whileHover={{ x: 8 }}
            transition={{ duration: 0.54, delay: index * 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <i>0{index + 1}</i>
            <span>{label}</span>
            <p>{text}</p>
          </motion.div>
        ))}
      </Reveal>
    </section>
  );
}

function FitCheck() {
  const spanish = isSpanishPath();
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const score = useMemo(() => {
    if (!answers.length) return 68;
    return Math.round((answers.reduce((sum, item) => sum + item, 0) / answers.length) * 10 + 48);
  }, [answers]);
  const current = fitQuestions[question];
  const complete = question >= fitQuestions.length;
  const signalScore = Math.min(score, 92);
  const journeyState = complete
    ? t("Starting system signal", spanish)
    : answers.length >= 3
      ? t("Pattern emerging", spanish)
      : answers.length > 0
        ? t("Early signal", spanish)
        : t("Awaiting first signal", spanish);
  const result = signalScore < 60
      ? {
        title: t("Your system may be carrying hidden friction.", spanish),
        text: t("A full COIREA diagnostic would help identify where energy is leaking and which dimension needs attention first.", spanish),
      }
    : signalScore < 80
      ? {
          title: t("Your system shows potential, but alignment may be inconsistent.", spanish),
          text: t("There are useful signals here. COIREA can help connect them across the five dimensions before friction becomes structural.", spanish),
        }
      : {
          title: t("Your system may already have strong coherence.", spanish),
          text: t("COIREA can help protect that coherence as the organization grows, adds complexity, or enters a new strategic phase.", spanish),
        };

  const choose = (value) => {
    if (selectedValue !== null || complete) return;
    setSelectedValue(value);
    setAnswers((items) => [...items, value]);
    window.setTimeout(() => {
      setQuestion((index) => index + 1);
      setSelectedValue(null);
    }, 320);
  };

  const restart = () => {
    setAnswers([]);
    setQuestion(0);
    setSelectedValue(null);
  };

  return (
    <section className="diagnostic diagnostic--journey section" id="diagnostic">
      <Reveal className="diagnostic-intro">
        <span className="eyebrow">{t("60-second system signal check", spanish)}</span>
        <h2>{t("Is COIREA for you?", spanish)}</h2>
        <p>{t("Answer honestly. This is not a scorecard. It is a first signal of how your organization behaves under pressure.", spanish)}</p>
        <div className="diagnostic-guide">
          <span><Check size={15} weight="bold" /> {t("Five dimensions", spanish)}</span>
          <span><Check size={15} weight="bold" /> {t("One starting signal", spanish)}</span>
          <span><Check size={15} weight="bold" /> {t("Clear next step", spanish)}</span>
        </div>
        <div className="ovi-tiers" aria-label={t("OVI scoring tiers", spanish)}>
          <span>{t("OVI tiers", spanish)}</span>
          <small>80-100 {t("Systemic Coherence", spanish)}</small>
          <small>60-79 {t("Emerging Alignment", spanish)}</small>
          <small>40-59 {t("Fragile Stability", spanish)}</small>
          <small>0-39 {t("Structural Risk", spanish)}</small>
        </div>
      </Reveal>
      <Reveal className="diagnostic-panel" delay={0.1}>
        <div className="diagnostic-steps" aria-label={t("Diagnostic progress", spanish)}>
          {fitQuestions.map((item, index) => (
            <span
              className={`${index < answers.length ? "is-complete" : ""} ${index === question && !complete ? "is-current" : ""}`}
              key={item.dimension}
            >
              {t(item.dimension, spanish)}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {!complete ? (
            <motion.div
              key={question}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24 }}
            >
              <div className="question-meta">
                <span>{t("Question", spanish)} {question + 1} {spanish ? "de" : "of"} {fitQuestions.length}</span>
                <strong>{t(current.dimension, spanish)}</strong>
              </div>
              <h3>{t(current.prompt, spanish)}</h3>
              <p className="question-helper">{t("Choose the number that feels most true today.", spanish)}</p>
              <div className="rating-row" role="group" aria-label={t("Rate from strongly disagree to strongly agree", spanish)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    className={selectedValue === value ? "is-selected" : ""}
                    disabled={selectedValue !== null}
                    key={value}
                    onClick={() => choose(value)}
                    type="button"
                  >
                    {value}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {selectedValue !== null && (
                  <motion.div
                    className="signal-captured"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Check size={15} weight="bold" /> {t("Signal captured", spanish)}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="rating-labels"><span>{t("Strongly disagree", spanish)}</span><span>{t("Strongly agree", spanish)}</span></div>
              <div className="progress-track"><span style={{ width: `${(answers.length / fitQuestions.length) * 100}%` }} /></div>
            </motion.div>
          ) : (
            <motion.div
              className="result-state"
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="result-check"><Check size={25} weight="bold" /></div>
              <span className="eyebrow">{t("Starting signal", spanish)}</span>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              <div className="result-actions">
                <a className="button button--primary" href={localizedPath("/conversation", spanish)}>{t("Apply to work with COIREA", spanish)} <ArrowRight size={17} /></a>
                <button className="text-button" onClick={restart} type="button">{t("Try again", spanish)} <ArrowRight /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
      <Reveal className="score-orbit" delay={0.2}>
        <span>{journeyState}</span>
        <AnimatedNumber value={signalScore} />
        <small>{complete ? t("Ready for next step", spanish) : t("Keep going", spanish)}</small>
      </Reveal>
    </section>
  );
}

function AnswerEngineFaq() {
  const spanish = isSpanishPath();
  useEffect(() => {
    upsertJsonLd("coirea-faqpage", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://www.coirea.com/#faq",
      mainEntity: aiSeoFaqs.map(([question, answer]) => ({
        "@type": "Question",
        name: t(question, spanish),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(answer, spanish),
        },
      })),
    });
    return () => removeJsonLd("coirea-faqpage");
  }, [spanish]);

  return (
    <section className="answer-faq section" id="faq">
      <Reveal className="answer-faq-intro">
        <span className="eyebrow">{t("Questions leaders ask", spanish)}</span>
        <h2>{t("Clear answers about COIREA and the People Operating System.", spanish)}</h2>
        <p>{t("These answers are written for leaders evaluating COIREA, and structured clearly so search engines and AI assistants can understand the concept without guessing.", spanish)}</p>
      </Reveal>
      <div className="answer-faq-grid">
        {aiSeoFaqs.map(([question, answer], index) => (
          <Reveal className="answer-faq-card" delay={index * 0.05} key={question}>
            <h3>{t(question, spanish)}</h3>
            <p>{t(answer, spanish)}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="answer-faq-link" delay={0.12}>
        <a className="text-button" href={localizedPath("/insights/what-is-a-people-operating-system", spanish)}>
          {t("Read the full People Operating System article", spanish)} <ArrowRight />
        </a>
      </Reveal>
    </section>
  );
}

function Closing() {
  return (
    <section className="closing conversation-cta" id="conversation">
      <span className="anchor-target" id="about" aria-hidden="true" />
      <div className="closing-image" aria-hidden="true" />
      <Reveal className="conversation-cta-copy">
        <span className="eyebrow">Apply to work with COIREA</span>
        <h2>Is Your Organization Ready to See Itself Clearly?</h2>
        <p>COIREA is not for every organization. It is for the ones that sense something needs to shift, and are ready to look at it honestly, with the right support alongside them.</p>
        <a className="button button--primary" href="/conversation">Book a conversation <ArrowRight size={17} /></a>
      </Reveal>
    </section>
  );
}

function ApplicationForm() {
  const spanish = isSpanishPath();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      organization: formData.get("organization")?.toString().trim(),
      role: formData.get("role")?.toString().trim(),
      friction: formData.getAll("friction").map((item) => item.toString()),
      desired_shift: formData.get("desired_shift")?.toString().trim(),
      team_size: formData.get("team_size")?.toString(),
      website: formData.get("website")?.toString(),
    };

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = result.error === "Email service is not configured yet."
          ? t("The application form is ready, but the email service still needs to be connected. Please email hello@coirea.com directly for now.", spanish)
          : t(result.error || "Something went wrong. Please try again.", spanish);
        throw new Error(errorMessage);
      }
      form.reset();
      setStatus("success");
      setMessage(t("Thank you. Your application was sent to COIREA. A Steward will review it personally.", spanish));
    } catch (error) {
      setStatus("error");
      setMessage(error.message || t("Something went wrong. Please email hello@coirea.com directly.", spanish));
    }
  };

  return (
    <Reveal className="application-form" delay={0.1}>
      <form onSubmit={handleSubmit}>
        <label className="application-honeypot" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <fieldset>
          <legend>{t("Who you are", spanish)}</legend>
          <div className="application-field-grid">
            <label>
              <span>{t("Your name", spanish)}</span>
              <input name="name" type="text" required />
            </label>
            <label>
              <span>{t("Email address", spanish)}</span>
              <input name="email" type="email" required />
            </label>
            <label>
              <span>{t("Organization name", spanish)}</span>
              <input name="organization" type="text" required />
            </label>
            <label>
              <span>{t("Your role", spanish)}</span>
              <input name="role" type="text" required />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>{t("Your system", spanish)}</legend>
          <p className="field-help">{t("Where does your organization feel the most friction right now? Select what resonates.", spanish)}</p>
          <div className="friction-options">
            {applicationFrictionOptions.map((option) => (
              <label className="choice-card" key={option}>
                <input name="friction" type="checkbox" value={option} />
                <span>{t(option, spanish)}</span>
              </label>
            ))}
          </div>
          <label className="contact-message">
            <span>{t("What would shift in your organization if this changed?", spanish)}</span>
            <textarea name="desired_shift" rows={4} placeholder={t("2-3 sentences is enough", spanish)} required />
          </label>
        </fieldset>

        <fieldset>
          <legend>{t("Context", spanish)}</legend>
          <label>
            <span>{t("Team size", spanish)}</span>
            <select name="team_size" required defaultValue="">
              <option value="" disabled>{t("Select one", spanish)}</option>
              {teamSizeOptions.map((size) => <option value={size} key={size}>{size}</option>)}
            </select>
          </label>
        </fieldset>

        <button className="button button--primary" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t("Sending...", spanish) : t("Send my application", spanish)} <ArrowRight size={17} />
        </button>
        {message && <p className={`application-status application-status--${status}`}>{message}</p>}
        <p className="application-note">{t("A Steward reads every application personally. If there is a genuine fit, we will reach out within 5 business days.", spanish)}</p>
      </form>
    </Reveal>
  );
}

function ConversationPage() {
  return (
    <main>
      <PageHero
        eyebrow="Book a conversation"
        title="Is Your Organization Ready to See Itself Clearly?"
        text="Every organization enters with a Steward. This is not a software subscription. It is an accompanied transformation. Applications are reviewed personally."
        variant="conversation"
      />
      <section className="application-section application-section--page section">
        <Reveal className="application-copy">
          <span className="eyebrow">Apply to work with COIREA</span>
          <h2>Start with fit, not pressure.</h2>
          <p>COIREA is for organizations that sense something needs to shift, and are ready to look at it honestly with the right support alongside them.</p>
          <p>Complete the application below. If there is a genuine fit, COIREA will reach out within 5 business days.</p>
        </Reveal>
        <ApplicationForm />
      </section>
    </main>
  );
}

function PageHero({ eyebrow, title, text, variant = "" }) {
  return (
    <section className={`subpage-hero ${variant ? `subpage-hero--${variant}` : ""}`}>
      <div className="hero-image" aria-hidden="true" />
      <div className="subpage-scrim" aria-hidden="true" />
      <Reveal className="subpage-hero-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </Reveal>
    </section>
  );
}

function PlatformPage() {
  return (
    <main>
      <PageHero
        eyebrow="Platform"
        title="The Organizational Intelligence Platform."
        text="COIREA replaces fragmented management tools with one integrated system for execution clarity. It measures organizational health across five pillars, detects misalignment early, and translates signals into clear ownership and strategic focus."
      />
      <section className="process-cycle section">
        <Reveal className="section-heading">
          <span className="eyebrow">The regenerative execution cycle</span>
          <h2>How COIREA Works.</h2>
          <p>COIREA helps organizations achieve strategic goals while increasing systemic coherence and long-term capacity.</p>
        </Reveal>
        <div className="cycle-grid">
          {regenerativeSteps.map((step, index) => (
            <Reveal className="cycle-card" delay={index * 0.1} key={step.title}>
              <span>0{index + 1}</span>
              <h3>{step.title}</h3>
              <strong>{step.subtitle}</strong>
              <p>{step.text}</p>
              <ul>
                {step.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <small>{step.closing}</small>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="detail-page section">
        <Reveal className="detail-intro">
          <span className="eyebrow">What COIREA measures</span>
          <h2>The five pillars of organizational intelligence.</h2>
          <p>All captured in one system, interpreted by GiA, and supported by Stewards when the organization needs human accompaniment.</p>
        </Reveal>
        <div className="detail-grid detail-grid--five">
          {platformPillars.map(([title, subtitle, text], index) => (
            <Reveal className="detail-card" delay={index * 0.06} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <strong>{subtitle}</strong>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="platform section page-product-panel">
        <Reveal className="platform-copy">
          <span className="eyebrow">Evolution Dashboard</span>
          <h2>System-level clarity in one dashboard.</h2>
          <p>COIREA centralizes signals across vision, culture, leadership, collaboration, well-being, and strategy, then uses trained Organizational AI to interpret how those dimensions affect your goals.</p>
        </Reveal>
        <Reveal className="signal-board" delay={0.08}>
          <div className="dashboard-reel" aria-label="Animated platform demo"><span /><span /><span /><p>OVI + GiA live preview</p></div>
          <div className="focus-board">
            <div className="focus-header"><div><Brain size={20} /> <strong>GiA</strong></div><button type="button">System intelligence <ArrowRight /></button></div>
            {[
              ["Execution drift", 62, "High"], ["Ownership unclear", 58, "Medium"],
              ["Capacity thinning", 54, "High"], ["Alignment strengthening", 72, "Low"],
            ].map(([label, value, impact], index) => (
              <div className="focus-row" key={label}>
                <span>{label}</span>
                <AnimatedFocusBar value={value} delay={0.15 + index * 0.08} />
                <small className={`impact impact--${impact.toLowerCase()}`}>{impact}</small>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="gia-questions section">
        <Reveal className="section-heading">
          <span className="eyebrow">Meet GiA</span>
          <h2>What GiA makes visible.</h2>
          <p>GiA is not a generic chatbot. It interprets patterns within your organization’s own data and turns them into contextual questions.</p>
        </Reveal>
        <div className="question-grid">
          {giaQuestions.map(([title, question], index) => (
            <Reveal className="question-card" delay={index * 0.06} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{question}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="detail-page section">
        <Reveal className="detail-intro">
          <span className="eyebrow">Platform features</span>
          <h2>Everything needed to understand and transform the organization.</h2>
          <p>The original Platform page contains a broader feature layer. This section brings those product promises into the new design format.</p>
        </Reveal>
        <div className="detail-grid">
          {platformFeatures.map(([title, text], index) => (
            <Reveal className="detail-card" delay={index * 0.05} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      {false && (
      <section className="about-system section" hidden>
        <Reveal className="gia-card-large">
          <div className="gia-card-header">
            <div className="gia-avatar"><UsersThree size={20} weight="fill" /></div>
            <div><strong>The human layer</strong><span>Platform + Steward</span></div>
          </div>
          <h2>The system works because people hold it.</h2>
          <p>COIREA is not a self-service tool. Every organization that enters the system is accompanied by a Steward, a trained facilitator who reads what data alone cannot tell you and stays present through the moments that matter most.</p>
        </Reveal>
        <Reveal className="steward-panel" delay={0.1}>
          <span className="eyebrow">Responsible AI</span>
          <h3>Not a disclaimer. A design choice.</h3>
          <p>GiA is used deliberately, in service of reflection, and only where it adds something a human alone could not see as easily. The rest of the system is designed around people, presence, relationships, and response.</p>
        </Reveal>
      </section>
      )}
      <Closing />
    </main>
  );
}

function EcosystemPage() {
  return (
    <main>
      <PageHero
        eyebrow="Ecosystem"
        title="Built for organizations driven by purpose."
        text="COIREA helps mission-driven organizations align their systems, strengthen execution, and scale impact without burning out their people or losing coherence."
      />
      <section className="detail-page section">
        <Reveal className="detail-intro">
          <span className="eyebrow">Who this is for</span>
          <h2>Different missions. Same structural challenge.</h2>
          <p>Mission-driven organizations rarely struggle with purpose. They struggle with the systems designed to carry it.</p>
        </Reveal>
        <div className="detail-grid">
          {ecosystemTypes.map((type, index) => (
            <Reveal className="detail-card" delay={index * 0.06} key={type}>
              <span>0{index + 1}</span>
              <h3>{type}</h3>
              <p>Purpose-led teams navigating growth, complexity, coordination, and the need for healthier execution.</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-story section">
        <Reveal className="about-manifesto">
          <span className="eyebrow">The real problem</span>
          <h2>The challenge is not purpose. It is building a system that can sustain it.</h2>
        </Reveal>
        <Reveal className="about-principles" delay={0.1}>
          {[
            ["Intention without structure", "Strong values exist, but the operational architecture to sustain them does not."],
            ["People over systems", "Organizations depend on individual energy instead of structural coherence."],
            ["Execution drift", "Daily work disconnects from strategic mission as complexity grows."],
            ["Invisible burnout", "Unclear ownership and slow governance erode well-being silently."],
          ].map(([title, text], index) => (
            <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
          ))}
        </Reveal>
      </section>
      <section className="ecosystem-response section">
        <Reveal className="section-heading">
          <span className="eyebrow">COIREA response</span>
          <h2>Regenerative execution starts with system intelligence.</h2>
        </Reveal>
        <div className="detail-grid">
          {[
            ["Align Mission & Execution", "Connect mission, strategy, and daily execution into one coherent system."],
            ["Detect System Tension", "Identify structural misalignment before it becomes breakdown or burnout."],
            ["Protect Team Capacity", "Safeguard energy and capacity while scaling impact."],
            ["Structure with Humanity", "Build governance and ownership structures without losing the human element."],
          ].map(([title, text], index) => (
            <Reveal className="detail-card" delay={index * 0.07} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="diagnostic section">
        <Reveal className="diagnostic-intro">
          <span className="eyebrow">Start here</span>
          <h2>How healthy is your organization?</h2>
          <p>Before transformation, leaders need to understand where the system stands. COIREA’s diagnostic tools give immediate clarity on health, leadership coherence, and structural alignment.</p>
        </Reveal>
        <Reveal className="diagnostic-panel" delay={0.1}>
          <div className="result-state">
            <div className="result-check"><Check size={25} weight="bold" /></div>
            <span className="eyebrow">Free diagnostic tools</span>
            <h3>Organizational Health Score, Conscious Leadership Assessment, and Health Scanner.</h3>
            <p>This section preserves the original Ecosystem pathway into the tools and assessment experience.</p>
          </div>
        </Reveal>
      </section>
      <section className="gia-section section">
        <Reveal className="gia-card-large">
          <div className="gia-card-header">
            <div className="gia-avatar"><Brain size={20} weight="fill" /></div>
            <div><strong>GiA</strong><span>Intelligence that understands your system</span></div>
          </div>
          <h2>No generic benchmarks. Only insight grounded in your reality.</h2>
          <p>For mission-driven organizations, GiA helps leaders see where the system is misaligned, overloaded, fragmented, or ready to evolve.</p>
        </Reveal>
        <Reveal className="gia-example" delay={0.1}>
          {["Misaligned", "Overloaded", "Fragmented", "Ready to evolve"].map((item) => (
            <motion.div key={item} whileHover={{ x: 8 }} transition={{ duration: 0.22 }}>
              <span>System state</span>
              <p>{item}</p>
            </motion.div>
          ))}
        </Reveal>
      </section>
      <section className="ecosystem-response section">
        <Reveal className="section-heading">
          <span className="eyebrow">Regenerative impact</span>
          <h2>From organizational coherence to regenerative impact.</h2>
          <p>Organizations shape systems. Systems shape outcomes. When organizations operate coherently, without extraction, they create the conditions for regenerative impact at scale.</p>
        </Reveal>
      </section>
      <Closing />
    </main>
  );
}

function StewardsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Stewards"
        title="The human presence behind the COIREA system."
        text="Stewards do not simply apply a method. They hold a living process, walking alongside organizations through moments of tension, reflection, and transformation."
      />
      <section className="detail-page section">
        <Reveal className="detail-intro">
          <span className="eyebrow">What a Steward does</span>
          <h2>They help the system see what it already knows.</h2>
          <p>Stewards accompany leaders and teams through the implementation of the organizational OS, translating insight into presence, rhythm, and action.</p>
        </Reveal>
        <div className="detail-grid">
          {stewardCompass.map(([title, text], index) => (
            <Reveal className="detail-card" delay={index * 0.08} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="stewards-strip section">
        <Reveal className="section-heading">
          <span className="eyebrow">Meet the Stewards</span>
          <h2>The people holding the system.</h2>
        </Reveal>
        <div className="steward-grid">
          {stewardProfiles.map(([name, role, text], index) => (
            <Reveal className="steward-tile" delay={index * 0.08} key={name}>
              <span>Founding Steward</span>
              <h3>{name}</h3>
              <strong>{role}</strong>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-story section">
        <Reveal className="about-manifesto">
          <span className="eyebrow">The container</span>
          <h2>COIREA was conceived as a container to trust.</h2>
          <p>A space where reflection precedes intervention, where patterns are named without assigning blame, and where organizational intelligence is allowed to emerge from within.</p>
        </Reveal>
        <Reveal className="about-principles" delay={0.1}>
          {[
            ["Not answers", "A Steward asks the questions the system needs to hear."],
            ["Presence", "They stay in the room when those questions land."],
            ["Practice", "Each Steward brings their own purpose, background, and inner practice to the work."],
          ].map(([title, text], index) => (
            <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
          ))}
        </Reveal>
      </section>
      <section className="steward-apply section">
        <Reveal className="section-heading">
          <span className="eyebrow">For facilitators & coaches</span>
          <h2>Do you feel the call to become a Steward?</h2>
          <p>COIREA Stewards are not hired, they are recognized. The original page invites practitioners with real accompaniment experience and personal practice to apply.</p>
        </Reveal>
        <div className="apply-criteria">
          {[
            "Real experience accompanying human or organizational processes",
            "An active personal practice: coaching, meditation, somatic work, or similar",
            "A desire to operate from a system that integrates purpose, structure, and well-being",
          ].map((item, index) => (
            <Reveal className="impact-row" delay={index * 0.08} key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
            </Reveal>
          ))}
        </div>
      </section>
      <Closing />
    </main>
  );
}

function InsightsPage() {
  const { posts, loading, error } = useMigratedBlogPosts();
  const spanish = isSpanishPath();
  const visiblePosts = useMemo(() => localizedPosts(posts, spanish), [posts, spanish]);
  const [activeCluster, setActiveCluster] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredPosts = useMemo(() => {
    return visiblePosts.filter((post) => {
      const visibleCluster = displayCluster(post.cluster, post.title);
      const matchesCluster = activeCluster === "All" || visibleCluster === activeCluster;
      const search = searchTerm.trim().toLowerCase();
      if (!search) return matchesCluster;
      const haystack = `${post.title} ${post.preview_snippet} ${visibleCluster} ${post.cluster} ${(post.tags || []).join(" ")}`.toLowerCase();
      return matchesCluster && haystack.includes(search);
    });
  }, [activeCluster, searchTerm, visiblePosts]);

  useEffect(() => {
    setVisibleCount(9);
  }, [activeCluster, searchTerm]);

  const cardPosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = filteredPosts.length > visibleCount;

  useEffect(() => {
    if (loading || error || visiblePosts.length === 0) {
      removeJsonLd("coirea-insights-itemlist");
      return;
    }
    upsertJsonLd("coirea-insights-itemlist", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: spanish ? "COIREA Insights en español" : "COIREA Insights",
      url: spanish ? "https://www.coirea.com/es/insights" : "https://www.coirea.com/insights",
      numberOfItems: visiblePosts.length,
      itemListElement: visiblePosts.slice(0, 25).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.coirea.com${localizedPath(`/insights/${post.slug}`, spanish)}`,
        name: post.title,
      })),
    });
    return () => removeJsonLd("coirea-insights-itemlist");
  }, [error, loading, spanish, visiblePosts]);

  return (
    <main>
      <PageHero
        eyebrow={t("Insights", spanish)}
        title={t("Insights", spanish)}
        text={t("Thinking for organizations ready to evolve.", spanish)}
        variant="insights"
      />
      <section className="insights-page section">
        <Reveal className="featured-insight">
          <div className="featured-insight-copy">
            <span className="eyebrow">{t("Featured", spanish)}</span>
            <div className="article-meta">
              <span className="category-tag category-tag--people-operating-system">{t("People Operating System", spanish)}</span>
              <small>Mar&iacute;a Jos&eacute; Figueroa</small>
            </div>
            <h2>{spanish ? spanishPostFallbacks["five-pillars-regenerative-business"].title : "The Five Pillars of the People Operating System"}</h2>
            <p>{spanish ? spanishPostFallbacks["five-pillars-regenerative-business"].preview : "A guide to the five dimensions that determine how well your organization functions as a living system, and what to strengthen first."}</p>
            <a className="text-button" href={localizedPath("/insights/five-pillars-regenerative-business", spanish)}>{t("Read more", spanish)} <ArrowRight /></a>
          </div>
          <a className="featured-insight-image" href={localizedPath("/insights/five-pillars-regenerative-business", spanish)} aria-label={`${t("Read more", spanish)} ${spanish ? spanishPostFallbacks["five-pillars-regenerative-business"].title : "The Five Pillars of the People Operating System"}`}>
            <img src="/assets/insights/five-pillars-regenerative-business.svg" alt="" />
          </a>
        </Reveal>
        <div className="insight-grid">
          <Reveal className="resource-filter">
            <span className="eyebrow">{t("Explore by theme", spanish)}</span>
            <label className="search-shell search-shell--active">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("Search insights...", spanish)}
                aria-label={t("Search insights", spanish)}
              />
            </label>
            <div>
              {migratedBlogClusters.map((item) => (
                <button
                  className={activeCluster === item ? "is-active" : ""}
                  type="button"
                  key={item}
                  onClick={() => setActiveCluster(item)}
                >
                  {spanish ? spanishClusterLabels[item] || item : item}
                </button>
              ))}
            </div>
            <p>{loading ? t("Loading posts...", spanish) : `${filteredPosts.length} ${t("insights available.", spanish)}`}</p>
          </Reveal>
          {error && (
            <Reveal className="insights-status">
              <p>{error}</p>
            </Reveal>
          )}
          {loading && Array.from({ length: 6 }).map((_, index) => (
            <Reveal className="insight-card-wrap" delay={index * 0.04} key={`insight-skeleton-${index}`}>
              <div className="insight-card insight-card--loading" aria-hidden="true">
                <span className="insight-card-image insight-card-image--placeholder">
                  <i />
                  <i />
                  <i />
                </span>
                <span />
                <h3 />
                <p />
                <div className="card-footer"><small /></div>
              </div>
            </Reveal>
          ))}
          {!loading && !error && filteredPosts.length === 0 && (
            <Reveal className="insights-status">
              <p>{t("No insights match that search yet. Try another theme or keyword.", spanish)}</p>
            </Reveal>
          )}
          {!loading && !error && cardPosts.map((item, index) => {
            const image = item.featured_image || extractFirstImage(item.body_content);
            return (
              <Reveal className="insight-card-wrap" delay={(index % 9) * 0.04} key={item.id}>
                <a className="insight-card" href={localizedPath(`/insights/${item.slug}`, spanish)} aria-label={`${t("Read more", spanish)} ${item.title}`}>
                  {image ? (
                    <span className="insight-card-image">
                      <img src={image} alt="" loading="lazy" />
                    </span>
                  ) : (
                    <span className="insight-card-image insight-card-image--placeholder" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  <span className={`category-tag ${clusterClass(displayCluster(item.cluster, item.title))}`}>{localizedCluster(item.cluster, item.title, spanish)}</span>
                  <h3>{item.title}</h3>
                  <p>{item.preview_snippet}</p>
                  <div className="card-footer">
                    <small><span>{formatPostDate(item.created_at, false, spanish ? "es-ES" : "en-US")}</span><span>{estimateReadingTime(item.body_content)} {t("min read", spanish)}</span></small>
                    <span className="card-read-more">{t("Read more", spanish)} <ArrowRight size={14} /></span>
                  </div>
                </a>
              </Reveal>
            );
          })}
          {hasMorePosts && (
            <Reveal className="insights-load-more">
              <button className="button button--outline" type="button" onClick={() => setVisibleCount((count) => count + 9)}>
                {t("Show more insights", spanish)} <ArrowRight />
              </button>
            </Reveal>
          )}
        </div>
      </section>
      <Closing />
    </main>
  );
}

function InsightArticlePage() {
  useEffect(() => {
    upsertJsonLd("coirea-guide-article", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: peopleOperatingSystemArticle.title,
      description: peopleOperatingSystemArticle.intro,
      author: {
        "@type": "Person",
        name: peopleOperatingSystemArticle.author,
      },
      publisher: {
        "@type": "Organization",
        name: "COIREA",
        logo: {
          "@type": "ImageObject",
          url: "https://www.coirea.com/assets/coirea-logo.png",
        },
      },
      dateModified: "2026-07-01",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://www.coirea.com/insights/what-is-a-people-operating-system",
      },
      articleSection: "People Operating System",
    });
    return () => removeJsonLd("coirea-guide-article");
  }, []);

  return (
    <main>
      <PageHero
        eyebrow="Insight"
        title={peopleOperatingSystemArticle.title}
        text="A practical definition for leaders who want to understand the human system behind performance."
        variant="insights"
      />
      <article className="article-page section">
        <Reveal className="article-shell">
          <div className="article-kicker">
            <span className="category-tag category-tag--people-operating-system">People Operating System</span>
            <small>{peopleOperatingSystemArticle.updated}</small>
          </div>
          <p className="article-lede">{peopleOperatingSystemArticle.intro}</p>
          <div className="article-definition">
            <strong>Definition</strong>
            <p>A People Operating System is the human infrastructure of an organization: the way purpose, leadership, decisions, collaboration, strategy, and well-being work together in daily practice.</p>
          </div>
          {peopleOperatingSystemArticle.sections.map((section, index) => (
            <Reveal className="article-section" delay={index * 0.06} key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </Reveal>
          ))}
          <div className="article-takeaways">
            <h2>Key takeaways</h2>
            <ul>
              <li>A People Operating System makes the invisible human patterns of work visible.</li>
              <li>COIREA measures organizational health across Vision, Leadership, Strategy, Collaboration, and Well-Being.</li>
              <li>OVI diagnoses the system; GiA helps leaders ask better questions and choose better next actions.</li>
              <li>The goal is not more control. The goal is more coherence.</li>
            </ul>
          </div>
          <a className="button button--primary" href="/conversation">Book a conversation <ArrowRight /></a>
        </Reveal>
      </article>
      <AnswerEngineFaq />
      <Closing />
    </main>
  );
}

function MigratedBlogPostPage({ slug }) {
  const { post: rawPost, posts: rawPosts, loading, error } = useMigratedBlogPost(slug);
  const spanish = isSpanishPath();
  const post = useMemo(() => localizedPost(rawPost, spanish), [rawPost, spanish]);
  const posts = useMemo(() => localizedPosts(rawPosts, spanish), [rawPosts, spanish]);

  useEffect(() => {
    if (!post) return;
    const title = post.seo_title || `${post.title} | COIREA Insights`;
    const description = post.meta_description || post.preview_snippet || stripHtml(post.body_content).slice(0, 155);
    const postUrl = `https://www.coirea.com${localizedPath(`/insights/${post.slug}`, spanish)}`;
    const postImage = absolutePublicUrl(post.featured_image || extractFirstImage(post.body_content) || defaultShareImage);
    document.title = title;
    ensureMeta('meta[name="description"]', { name: "description" }).setAttribute("content", description);
    ensureMeta('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", description);
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", postUrl);
    ensureMeta('meta[property="og:image"]', { property: "og:image" }).setAttribute("content", postImage);
    ensureMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url" }).setAttribute("content", postImage);
    ensureMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }).setAttribute("content", `${post.title} - COIREA Insights`);
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }).setAttribute("content", title);
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }).setAttribute("content", description);
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" }).setAttribute("content", postImage);
    ensureMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }).setAttribute("content", `${post.title} - COIREA Insights`);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", postUrl);

    upsertJsonLd("coirea-blogposting", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image: postImage,
      author: {
        "@type": "Person",
        name: normalizeAuthor(post.author),
        url: "https://www.linkedin.com/in/mariajosefigueroaaadaros/",
      },
      publisher: {
        "@type": "Organization",
        name: "COIREA",
        logo: {
          "@type": "ImageObject",
          url: "https://www.coirea.com/assets/coirea-logo.png",
        },
      },
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      articleSection: localizedCluster(post.cluster, post.title, spanish),
      keywords: (post.tags || []).join(", "),
      ...(post.direct_answer ? { abstract: post.direct_answer } : {}),
      mentions: getArticleConceptLinks(post).map((item) => ({
        "@type": "Thing",
        name: item.label,
        url: absolutePublicUrl(item.href),
      })),
      wordCount: stripHtml(post.body_content).split(/\s+/).filter(Boolean).length,
    });

    return () => removeJsonLd("coirea-blogposting");
  }, [post, spanish]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const postCluster = displayCluster(post.cluster, post.title);
    const postTags = new Set(post.tags || []);
    return posts
      .filter((item) => item.slug !== post.slug)
      .map((item) => {
        const sameCluster = displayCluster(item.cluster, item.title) === postCluster ? 3 : 0;
        const tagOverlap = (item.tags || []).filter((tag) => postTags.has(tag)).length;
        return { ...item, relatedScore: sameCluster + tagOverlap };
      })
      .filter((item) => item.relatedScore > 0)
      .sort((a, b) => b.relatedScore - a.relatedScore || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [post, posts]);

  const conceptLinks = useMemo(() => getArticleConceptLinks(post).map((item) => ({
    ...item,
    label: t(item.label, spanish),
    text: t(item.text, spanish),
    href: localizedPath(item.href, spanish),
  })), [post, spanish]);

  const articleHtml = useMemo(() => sanitizeBlogHtml(post?.body_content || rawPost?.body_content || ""), [post?.body_content, rawPost?.body_content]);
  const articleText = useMemo(() => stripHtml(articleHtml).trim(), [articleHtml]);
  const articleContentKey = post ? `${post.slug}-${spanish ? "es" : "en"}` : "article";

  if (loading) {
    return (
      <main>
        <PageHero eyebrow={t("Insights", spanish)} title={t("Loading article...", spanish)} text={t("Preparing this COIREA insight.", spanish)} variant="insights" />
        <section className="article-page section">
          <Reveal className="article-shell"><p className="article-lede">{t("Loading the article...", spanish)}</p></Reveal>
        </section>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main>
        <PageHero eyebrow={t("Insights", spanish)} title={t("Post not found", spanish)} text={t("This article could not be found.", spanish)} variant="insights" />
        <section className="article-page section">
          <Reveal className="article-shell">
            <p className="article-lede">{error ? t(error, spanish) : t("The post may have moved or may not be published.", spanish)}</p>
            <a className="button button--primary" href={localizedPath("/insights", spanish)}>{t("Back to Insights", spanish)} <ArrowRight /></a>
          </Reveal>
        </section>
      </main>
    );
  }

  return (
    <main>
      <article className="article-page article-page--post section">
        <div className="article-shell">
          <div className="article-post-heading">
            <span className="eyebrow">{t("COIREA insight", spanish)}</span>
            <h1>{post.title}</h1>
            <p>{post.preview_snippet}</p>
          </div>
          <div className="article-kicker">
            <span className={`category-tag ${clusterClass(displayCluster(post.cluster, post.title))}`}>{localizedCluster(post.cluster, post.title, spanish)}</span>
            <small>{formatPostDate(post.created_at, true, spanish ? "es-ES" : "en-US")}</small>
          </div>
          <div className="migrated-post-meta">
            <span>{t("By", spanish)} {normalizeAuthor(post.author)}</span>
            <span>{estimateReadingTime(articleHtml)} {t("min read", spanish)}</span>
          </div>
          {articleText ? (
            <div
              key={articleContentKey}
              className="legacy-article-content"
              lang={spanish && post.body_content_es ? "es" : "en"}
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          ) : (
            <div className="article-definition article-definition--warning">
              <strong>{spanish ? "Contenido pendiente" : "Content pending"}</strong>
              <p>{spanish ? "Este artículo existe, pero el cuerpo del texto no se cargó correctamente. Por favor vuelve a Insights e inténtalo nuevamente." : "This article exists, but the body text did not load correctly. Please go back to Insights and try again."}</p>
            </div>
          )}
          {post.featured_image && (
            <img className="migrated-featured-image migrated-featured-image--after" src={post.featured_image} alt={`${post.title} ${spanish ? "imagen destacada" : "featured image"}`} />
          )}
          {post.direct_answer && (
            <div className="article-definition article-definition--after">
              <strong>{t("Direct answer", spanish)}</strong>
              <p>{post.direct_answer}</p>
            </div>
          )}
          {post.tags?.length > 0 && (
            <div className="article-tags" aria-label={spanish ? "Etiquetas del articulo" : "Article tags"}>
              {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          )}
          {conceptLinks.length > 0 && (
            <nav className="article-concept-links" aria-labelledby="article-concepts-title">
              <div>
                <span className="eyebrow">{t("COIREA context", spanish)}</span>
                <h2 id="article-concepts-title">{t("Connect this insight to the system", spanish)}</h2>
              </div>
              <div className="article-concept-grid">
                {conceptLinks.map((item) => (
                  <a href={item.href} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.text}</span>
                  </a>
                ))}
              </div>
            </nav>
          )}
          {relatedPosts.length > 0 && (
            <section className="related-insights" aria-labelledby="related-insights-title">
              <div className="related-insights-header">
                <span className="eyebrow">{t("Keep reading", spanish)}</span>
                <h2 id="related-insights-title">{t("Related insights", spanish)}</h2>
              </div>
              <div className="related-insights-grid">
                {relatedPosts.map((item) => (
                  <a className="related-insight-card" href={localizedPath(`/insights/${item.slug}`, spanish)} key={item.id}>
                    <span className={`category-tag ${clusterClass(displayCluster(item.cluster, item.title))}`}>{localizedCluster(item.cluster, item.title, spanish)}</span>
                    <h3>{item.title}</h3>
                    <small>{estimateReadingTime(item.body_content)} {t("min read", spanish)}</small>
                  </a>
                ))}
              </div>
            </section>
          )}
          <a className="button button--primary" href={localizedPath("/insights", spanish)}>{t("Back to Insights", spanish)} <ArrowRight /></a>
        </div>
      </article>
      <Closing />
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About"
        title="Organizations don't fail from lack of strategy. They fail when people can't sustain it."
        text="COIREA was founded to close the gap between how organizations are designed and how people actually experience them. Not through restructuring. Through coherence."
        variant="about"
      />
      {false && (
      <section className="founder-origin section">
        <Reveal className="founder-portrait">
          <div>
            <img src="/assets/coirea-valley.png" alt="Natural landscape representing the living systems that inspire COIREA" />
          </div>
          <span>Founder image placeholder. Replace with María José's photo.</span>
        </Reveal>
        <Reveal className="founder-copy" delay={0.1}>
          <span className="eyebrow">Founder</span>
          <h2 className="founder-name">Mar&iacute;a Jos&eacute; Figueroa</h2>
          <strong className="founder-title">Founder & Chief Systems Architect</strong>
          <p className="founder-bio-primary">Mar&iacute;a Jos&eacute; spent over a decade inside organizations watching the same patterns repeat: disconnected strategy, exhausted leadership, and teams that worked hard but couldn't quite align. COIREA was built from that experience, and from the belief that organizations don't fail from lack of intelligence, but from lack of coherence.</p>
          <p>She brings together systems thinking, organizational design, and a deep background in human-centered leadership to build something genuinely new: a People Operating System that organizations can measure, navigate, and evolve over time.</p>
          <p>Her work is grounded in Latin America, but designed for any organization ready to stop treating people and performance as separate questions.</p>
          <div className="founder-tags">
            {founderTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <a className="button button--outline" href="https://www.linkedin.com/in/mariajosefigueroaaadaros/" target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight size={17} /></a>
        </Reveal>
      </section>
      )}
      <section className="nature-inspiration section">
        <Reveal className="nature-intro">
          <span className="eyebrow">Inspired by nature</span>
          <h2>COIREA is inspired by the intelligence of living systems.</h2>
          <p>Forests, mycelium, rivers, and ecosystems show us that resilience is relational. Nothing evolves alone. The same is true inside organizations.</p>
        </Reveal>
        <div className="nature-grid">
          {naturePrinciples.map(([title, text], index) => (
            <Reveal className="nature-card" delay={index * 0.08} key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-stewards section" hidden>
        <Reveal className="section-heading section-heading--center">
          <span className="eyebrow">The Stewards</span>
          <h2>The human presence behind the COIREA system.</h2>
          <p>Stewards do not simply apply a method. They hold a living process, walking alongside organizations through moments of tension, reflection, and transformation.</p>
        </Reveal>
        <div className="founding-stewards-grid">
          {foundingStewards.map((steward, index) => (
            <Reveal className="founding-steward-card" delay={index * 0.08} key={steward.name}>
              <div className="steward-photo">
                <img src={steward.photo} alt={`${steward.name}, Founding Steward COIREA`} />
              </div>
              <div className="steward-card-copy">
                <span>{steward.location} · Founding Steward COIREA</span>
                <h3>{steward.name}</h3>
                <strong>{steward.role}</strong>
                <p>{steward.description}</p>
                <details>
                  <summary>Read steward story</summary>
                  {steward.bio.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </details>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-story section">
        <Reveal className="about-manifesto">
          <span className="eyebrow">Why we exist</span>
          <h2>Organizations are living systems. When they're well-designed, people don't just work, they grow.</h2>
          <p>Our mission is to help purpose-driven organizations measure and strengthen the conditions that allow both business and people to regenerate. We call this the People Operating System, five pillars that determine whether an organization can grow without breaking.</p>
        </Reveal>
        <Reveal className="about-principles" delay={0.1}>
          <span className="about-principles-label">What we believe</span>
          {visionValues.map(([title, text], index) => (
            <div key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </Reveal>
      </section>
      <section className="about-system section" hidden>
        <Reveal className="gia-card-large">
          <div className="gia-card-header">
            <div className="gia-avatar"><BookOpen size={20} weight="fill" /></div>
            <div><strong>Platform + Stewardship</strong><span>AI + Human Wisdom</span></div>
          </div>
          <h2>A new operating layer for purpose-driven organizations.</h2>
          <p>COIREA brings together the Organizational Vitality Index, GiA, and certified Stewards so leaders can move from fragmented symptoms into aligned action.</p>
        </Reveal>
        <Reveal className="steward-panel" delay={0.1}>
          <span className="eyebrow">The source</span>
          <h3>María José Figueroa</h3>
          <p>Founder of COIREA, regenerative business strategist, and systems thinker focused on human-centered organizational design. Her work brings together operational clarity, emotional intelligence, governance, and trust.</p>
          <a className="button button--outline" href="/conversation">Book a conversation <ArrowRight /></a>
        </Reveal>
      </section>
      <section className="faq-section section">
        <Reveal className="section-heading">
          <span className="eyebrow">Frequently asked questions</span>
          <h2>The concepts behind COIREA, clarified.</h2>
        </Reveal>
        <div className="faq-grid">
          {aboutFaqs.map(([question, answer], index) => (
            <Reveal className="faq-item" delay={index * 0.06} key={question}>
              <span>0{index + 1}</span>
              <h3>{question}</h3>
              <p>{answer}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <AboutContact />
    </main>
  );
}

function AboutContact() {
  return (
    <section className="about-contact section" id="conversation">
      <Reveal className="about-contact-copy">
        <span className="eyebrow">Apply to work with COIREA</span>
        <h2>Start with fit, not pressure.</h2>
        <p>Every organization enters with a Steward. Applications are reviewed personally so the first conversation begins with context, care, and honesty.</p>
        <a className="button button--primary" href="/conversation">Book a conversation <ArrowRight size={17} /></a>
      </Reveal>
      <Reveal className="about-contact-card" delay={0.1}>
        <span>01</span>
        <h3>A Steward reads every application personally.</h3>
        <p>If there is a genuine fit, COIREA will reach out within 5 business days.</p>
      </Reveal>
    </section>
  );
}

function ToolsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Tools"
        title="Organizational health tools for seeing the system clearly."
        text="COIREA’s tools help leaders diagnose organizational health, leadership coherence, and structural alignment before beginning deeper transformation."
      />
      <section className="detail-page section">
        <Reveal className="detail-intro">
          <span className="eyebrow">Organizational Health Scanner</span>
          <h2>A focused diagnostic across the dimensions that shape vitality.</h2>
          <p>The current COIREA scanner is designed as a short diagnostic that gives leaders an OVI score, pillar breakdown, and personalized insights.</p>
        </Reveal>
        <div className="detail-grid">
          {["Purpose & Culture", "Collaboration", "Leadership & Self-Leadership", "Well-Being", "Strategy & Interconnectivity"].map((item, index) => (
            <Reveal className="detail-card" delay={index * 0.06} key={item}>
              <span>0{index + 1}</span>
              <h3>{item}</h3>
              <p>Part of the diagnostic lens used to understand where the organization is coherent, strained, or ready to evolve.</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="faq-section section">
        <Reveal className="section-heading">
          <span className="eyebrow">Assessment FAQ</span>
          <h2>What leaders need to know before using the scanner.</h2>
        </Reveal>
        <div className="faq-grid">
          {toolFaqs.map(([question, answer], index) => (
            <Reveal className="faq-item" delay={index * 0.06} key={question}>
              <span>0{index + 1}</span>
              <h3>{question}</h3>
              <p>{answer}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="diagnostic section">
        <Reveal className="diagnostic-intro">
          <span className="eyebrow">Assessment promise</span>
          <h2>From reflection to a usable signal.</h2>
          <p>In the full implementation, leaders complete the scanner and receive an instant vitality reading with recommended areas for attention.</p>
        </Reveal>
        <Reveal className="diagnostic-panel" delay={0.1}>
          <div className="result-state">
            <div className="result-check"><Check size={25} weight="bold" /></div>
            <span className="eyebrow">Prototype tool preview</span>
            <h3>25 questions. OVI score. Pillar breakdown. Personalized insights.</h3>
            <p>This page preserves the original Tools intent while presenting it in the new COIREA visual system.</p>
          </div>
        </Reveal>
      </section>
      <Closing />
    </main>
  );
}

function Chatbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "gia",
      text: "Hi, I'm GiA. Think of me as a friendly guide inside COIREA. I can clarify doubts, help you explore what your organization may be sensing, and point you toward a Steward when a real conversation would be better.",
      prompts: chatQuickPrompts,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    const node = messagesRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  const ask = (text) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    setMessages((items) => [...items, { from: "user", text: clean }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      const answer = chatAnswer(clean);
      setMessages((items) => [...items, { from: "gia", ...answer }]);
      setThinking(false);
    }, 520);
  };

  const lastGiaPrompts = messages
    .slice()
    .reverse()
    .find((item) => item.from === "gia" && item.prompts?.length)?.prompts || chatFollowUpPrompts;

  return (
    <div className="chat-shell">
      <AnimatePresence>
        {open && (
          <motion.section
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label="GiA chat"
          >
            <header>
              <div className="gia-avatar"><Leaf size={19} weight="fill" /></div>
              <div><strong>GiA</strong><span>Friendly guide, not a replacement for a human</span></div>
              <button onClick={() => setOpen(false)} aria-label="Close chat"><X /></button>
            </header>
            <div className="chat-messages" aria-live="polite" ref={messagesRef}>
              {messages.map((message, index) => (
                <div className={`message message--${message.from}`} key={`${message.from}-${index}`}>
                  <p>{message.text}</p>
                  {message.actions?.length > 0 && (
                    <div className="message-actions">
                      {message.actions.map((action) => (
                        <a href={localizedPath(action.href)} key={action.label}>{action.label}<ArrowRight size={12} /></a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {thinking && <div className="typing"><span /><span /><span /></div>}
            </div>
            <div className="suggestions">
              {lastGiaPrompts.slice(0, 3).map((prompt) => (
                <button key={prompt} onClick={() => ask(prompt)} disabled={thinking}>{prompt}<ArrowRight /></button>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); ask(input); }}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about COIREA, OVI, GiA..." aria-label="Message GiA" />
              <button type="submit" aria-label="Send message" disabled={thinking}><ArrowUpRight /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button className="chat-launcher" onClick={() => setOpen((value) => !value)} whileTap={{ scale: 0.96 }} aria-expanded={open}>
        <span className="gia-avatar"><ChatCircleDots size={21} weight="fill" /></span>
        <span><strong>Ask GiA</strong><small>Questions, clarity, or a human next step</small></span>
        {open ? <X size={20} /> : <ArrowUpRight size={20} />}
      </motion.button>
    </div>
  );
}

function Footer() {
  return (
    <footer id="resources">
      <BrandMark compact />
      <p>Organizational intelligence for growth that builds capacity.</p>
      <div>
        <a href={localizedPath("/")}>Home</a>
        <a href={localizedPath("/insights")}>Insights</a>
        <a href={localizedPath("/about")}>About Us</a>
        <a href="https://www.linkedin.com/company/coirea" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:hello@coirea.com">hello@coirea.com</a>
      </div>
      <small>Concept prototype. Selected claims and data are illustrative pending owner confirmation.</small>
    </footer>
  );
}

function HomePage() {
  return (
    <main>
      <Hero />
      <Methodology />
      <Platform />
      <ImpactShift />
      <Approach />
      <GiaSection />
      <FitCheck />
      <AnswerEngineFaq />
      <Closing />
    </main>
  );
}

function CurrentPage() {
  const route = routeFromPath(getCurrentPathname());
  if (route === "/insights/what-is-a-people-operating-system") return <InsightArticlePage />;
  if (route.startsWith("/insights/")) {
    const slug = decodeURIComponent(route.replace("/insights/", ""));
    return <MigratedBlogPostPage slug={slug} />;
  }
  if (route === "/insights") return <InsightsPage />;
  if (route === "/conversation" || route === "/offerings") return <ConversationPage />;
  if (route === "/about") return <AboutPage />;
  return <HomePage />;
}

export function App() {
  return (
    <>
      <SEOManager />
      <SpanishCopyLayer />
      <Header />
      <CurrentPage />
      <Footer />
      <Chatbox />
    </>
  );
}
