import { Injectable } from '@angular/core';

export interface TranslationDictionary {
  [key: string]: {
    [lang: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FallbackTranslationService {
  private dictionary: TranslationDictionary = {
    'Welcome to Chat': {
      'es': 'Bienvenido al Chat',
      'fr': 'Bienvenue dans le Chat',
      'de': 'Willkommen im Chat',
      'it': 'Benvenuto nella Chat',
      'pt': 'Bem-vindo ao Chat'
    },
    'Bienvenido a Chatear': {
      'en': 'Welcome to Chat',
      'fr': 'Bienvenue dans le Chat',
      'de': 'Willkommen im Chat',
      'it': 'Benvenuto nella Chat',
      'pt': 'Bem-vindo ao Chat'
    },
    'Connect with your team and start meaningful conversations. Select a conversation from the sidebar or create a new one to start.': {
      'es': 'Conecta con tu equipo e inicia conversaciones significativas. Selecciona una conversación de la barra lateral o crea una nueva para comenzar.',
      'fr': 'Connectez-vous avec votre équipe et commencez des conversations significatives. Sélectionnez une conversation dans la barre latérale ou créez-en une nouvelle pour commencer.',
      'de': 'Verbinden Sie sich mit Ihrem Team und beginnen Sie bedeutungsvolle Gespräche. Wählen Sie ein Gespräch aus der Seitenleiste oder erstellen Sie ein neues, um zu beginnen.',
      'it': 'Connettiti con il tuo team e inizia conversazioni significative. Seleziona una conversazione dalla barra laterale o creane una nuova per iniziare.',
      'pt': 'Conecte-se com sua equipe e inicie conversas significativas. Selecione uma conversa na barra lateral ou crie uma nova para começar.'
    },
    'Conéctese con su equipo y comience conversaciones significativas. Seleccione una conversación en la barra lateral o cree una nueva para comenzar.': {
      'en': 'Connect with your team and start meaningful conversations. Select a conversation from the sidebar or create a new one to start.',
      'fr': 'Connectez-vous avec votre équipe et commencez des conversations significatives. Sélectionnez une conversation dans la barre latérale ou créez-en une nouvelle pour commencer.',
      'de': 'Verbinden Sie sich mit Ihrem Team und beginnen Sie bedeutungsvolle Gespräche. Wählen Sie ein Gespräch aus der Seitenleiste oder erstellen Sie ein neues, um zu beginnen.',
      'it': 'Connettiti con il tuo team e inizia conversazioni significative. Seleziona una conversazione dalla barra laterale o creane una nuova per iniziare.',
      'pt': 'Conecte-se com sua equipe e inicie conversas significativas. Selecione uma conversa na barra lateral ou crie uma nova para começar.'
    },
    'Start New Conversation': {
      'es': 'Iniciar Nueva Conversación',
      'fr': 'Commencer une Nouvelle Conversation',
      'de': 'Neue Unterhaltung Beginnen',
      'it': 'Inizia Nuova Conversazione',
      'pt': 'Iniciar Nova Conversação'
    },
    'Iniciar nueva conversación': {
      'en': 'Start New Conversation',
      'fr': 'Commencer une Nouvelle Conversation',
      'de': 'Neue Unterhaltung Beginnen',
      'it': 'Inizia Nuova Conversazione',
      'pt': 'Iniciar Nova Conversação'
    },
    'Tip: Use the + button on the sidebar to start chatting': {
      'es': 'Consejo: Usa el botón + en la barra lateral para comenzar a chatear',
      'fr': 'Astuce : Utilisez le bouton + dans la barre latérale pour commencer à discuter',
      'de': 'Tipp: Verwenden Sie die + Schaltfläche in der Seitenleiste, um mit dem Chatten zu beginnen',
      'it': 'Suggerimento: Usa il pulsante + sulla barra laterale per iniziare a chattare',
      'pt': 'Dica: Use o botão + na barra lateral para começar a conversar'
    },
    'Sugerencia: use el botón + en la barra lateral para comenzar a chatear': {
      'en': 'Tip: Use the + button on the sidebar to start chatting',
      'fr': 'Astuce : Utilisez le bouton + dans la barre latérale pour commencer à discuter',
      'de': 'Tipp: Verwenden Sie die + Schaltfläche in der Seitenleiste, um mit dem Chatten zu beginnen',
      'it': 'Suggerimento: Usa il pulsante + sulla barra laterale per iniziare a chattare',
      'pt': 'Dica: Use o botão + na barra lateral para começar a conversar'
    },
    'No conversations yet': {
      'es': 'No hay conversaciones aún',
      'fr': 'Aucune conversation pour le moment',
      'de': 'Noch keine Gespräche',
      'it': 'Nessuna conversazione ancora',
      'pt': 'Nenhuma conversa ainda'
    },
    'Start a new conversation to get started': {
      'es': 'Inicia una nueva conversación para comenzar',
      'fr': 'Commencez une nouvelle conversation pour commencer',
      'de': 'Beginnen Sie ein neues Gespräch, um zu beginnen',
      'it': 'Inizia una nuova conversazione per iniziare',
      'pt': 'Inicie uma nova conversa para começar'
    },
    'Start chatting': {
      'es': 'Comenzar a chatear',
      'fr': 'Commencer à discuter',
      'de': 'Mit dem Chatten beginnen',
      'it': 'Inizia a chattare',
      'pt': 'Começar a conversar'
    },
    'Online': {
      'es': 'En línea',
      'fr': 'En ligne',
      'de': 'Online',
      'it': 'Online',
      'pt': 'Online'
    },
    'Offline': {
      'es': 'En linea',
      'fr': 'Hors ligne',
      'de': 'Offline',
      'it': 'Offline',
      'pt': 'Offline'
    },
    'Last seen': {
      'es': 'Última vez visto',
      'fr': 'Dernière connexion',
      'de': 'Zuletzt gesehen',
      'it': 'Ultima volta visto',
      'pt': 'Visto pela última vez'
    },
    'Reconnecting...': {
      'es': 'Reconectando...',
      'fr': 'Reconnexion...',
      'de': 'Wieder verbinden...',
      'it': 'Riconnessione...',
      'pt': 'Reconectando...'
    },
    'No results found': {
      'es': 'No se encontraron resultados',
      'fr': 'Aucun résultat trouvé',
      'de': 'Keine Ergebnisse gefunden',
      'it': 'Nessun risultato trovato',
      'pt': 'Nenhum resultado encontrado'
    },
    'Try searching with different keywords': {
      'es': 'Intenta buscar con diferentes palabras clave',
      'fr': 'Essayez de chercher avec des mots-clés différents',
      'de': 'Versuchen Sie, mit anderen Schlüsselwörtern zu suchen',
      'it': 'Prova a cercare con parole chiave diverse',
      'pt': 'Tente procurar com palavras-chave diferentes'
    },
    'No contacts found': {
      'es': 'No se encontraron contactos',
      'fr': 'Aucun contact trouvé',
      'de': 'Keine Kontakte gefunden',
      'it': 'Nessun contatto trovato',
      'pt': 'Nenhum contato encontrado'
    }
    ,
    'Chats': {
      'es': 'Chats',
      'fr': 'Discussions',
      'de': 'Chats',
      'it': 'Chat',
      'pt': 'Chats'
    },
    'Back to conversations': {
      'es': 'Volver a conversaciones',
      'fr': 'Retour aux conversations',
      'de': 'Zurück zu Gesprächen',
      'it': 'Torna alle conversazioni',
      'pt': 'Voltar às conversas'
    },
    'Search users...': {
      'es': 'Buscar usuarios...',
      'fr': 'Rechercher des utilisateurs...',
      'de': 'Benutzer suchen...',
      'it': 'Cerca utenti...',
      'pt': 'Pesquisar usuários...'
    },
    'Search conversations...': {
      'es': 'Buscar conversaciones...',
      'fr': 'Rechercher des conversations...',
      'de': 'Unterhaltungen suchen...',
      'it': 'Cerca conversazioni...',
      'pt': 'Pesquisar conversas...'
    },
    'Translation not available in this browser': {
      'es': 'La traducción no está disponible en este navegador',
      'fr': 'La traduction n’est pas disponible sur ce navigateur',
      'de': 'Übersetzung ist in diesem Browser nicht verfügbar',
      'it': 'La traduzione non è disponibile su questo browser',
      'pt': 'Tradução não disponível neste navegador'
    },
    'Type to search users': {
      'es': 'Escribe para buscar usuarios',
      'fr': 'Tapez pour rechercher des utilisateurs',
      'de': 'Tippen, um Benutzer zu suchen',
      'it': 'Digita per cercare utenti',
      'pt': 'Digite para buscar usuários'
    },
    'Start typing a name or email': {
      'es': 'Comienza a escribir un nombre o correo',
      'fr': 'Commencez à taper un nom ou un e-mail',
      'de': 'Beginnen Sie, einen Namen oder eine E-Mail zu tippen',
      'it': 'Inizia a digitare un nome o email',
      'pt': 'Comece digitando um nome ou e-mail'
    },
    'Start the conversation by sending the first message': {
      'es': 'Inicia la conversación enviando el primer mensaje',
      'fr': 'Commencez la conversation en envoyant le premier message',
      'de': 'Beginnen Sie das Gespräch, indem Sie die erste Nachricht senden',
      'it': 'Inizia la conversazione inviando il primo messaggio',
      'pt': 'Comece a conversa enviando a primeira mensagem'
    },
    'Today': {
      'es': 'Hoy',
      'fr': 'Aujourd’hui',
      'de': 'Heute',
      'it': 'Oggi',
      'pt': 'Hoje'
    },
    'Yesterday': {
      'es': 'Ayer',
      'fr': 'Hier',
      'de': 'Gestern',
      'it': 'Ieri',
      'pt': 'Ontem'
    },
    'Pending': {
      'es': 'Pendiente',
      'fr': 'En attente',
      'de': 'Ausstehend',
      'it': 'In sospeso',
      'pt': 'Pendente'
    },
    'Processing': {
      'es': 'Procesando',
      'fr': 'Traitement en cours',
      'de': 'Verarbeitung',
      'it': 'Elaborazione',
      'pt': 'Processando'
    },
    'Error': {
      'es': 'Error',
      'fr': 'Erreur',
      'de': 'Fehler',
      'it': 'Errore',
      'pt': 'Erro'
    },
    'Translation:': {
      'es': 'Traducción:',
      'fr': 'Traduction :',
      'de': 'Übersetzung:',
      'it': 'Traduzione:',
      'pt': 'Tradução:'
    },
    'Off': {
      'es': 'Desactivado',
      'fr': 'Désactivé',
      'de': 'Aus',
      'it': 'Disattivato',
      'pt': 'Desativado'
    }
  };

  translate(text: string, targetLanguage: string): string {
    const normalizedText = this.normalizeText(text);
    
    // Try exact match first
    if (this.dictionary[normalizedText] && this.dictionary[normalizedText][targetLanguage]) {
      return this.dictionary[normalizedText][targetLanguage];
    }
    
    // Try case-insensitive match
    const lowerText = normalizedText.toLowerCase();
    for (const [key, translations] of Object.entries(this.dictionary)) {
      if (key.toLowerCase() === lowerText && translations[targetLanguage]) {
        console.log(`[FallbackTranslation] Case-insensitive match found for "${text}" -> "${key}"`);
        return translations[targetLanguage];
      }
    }
    
    // Return original text if translation not found
    console.warn(`[FallbackTranslation] No translation found for "${text}" in ${targetLanguage}`);
    return text;
  }

  private normalizeText(text: string): string {
    return text.trim();
  }

  isSupported(text: string, targetLanguage: string): boolean {
    const normalizedText = this.normalizeText(text);
    return !!(this.dictionary[normalizedText] && this.dictionary[normalizedText][targetLanguage]);
  }
}
