/**
 * Calcule le nombre de jours restants avant la date d'échéance
 * Gère les différents formats : Timestamp Firebase, JSON, ISO String, Date JS
 * @param {*} dateObj - Date à convertir (Timestamp, secondes, string, etc)
 * @returns {number} Nombre de jours restants (positif = future, négatif = passé, 0 = aujourd'hui)
 */
export const getDaysRemaining = (dateObj) => {
  if (!dateObj) return 0;

  try {
    let dueDate;

    // Cas 1 : Timestamp Firebase avec méthode toMillis()
    if (typeof dateObj.toMillis === 'function') {
      dueDate = new Date(dateObj.toMillis());
    } 
    // Cas 2 : Format Firebase direct (.seconds)
    else if (dateObj.seconds !== undefined) {
      dueDate = new Date(dateObj.seconds * 1000);
    }
    // Cas 3 : Objet Timestamp avec méthode toDate()
    else if (typeof dateObj.toDate === 'function') {
      dueDate = dateObj.toDate();
    } 
    // Cas 4 : String ISO ou Date native
    else {
      dueDate = new Date(dateObj);
    }

    // Si la date est invalide (NaN), on sort
    if (isNaN(dueDate.getTime())) return 0;

    // Normalisation à minuit pour ignorer les décalages d'heures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

/**
 * Formate la date d'échéance en texte lisible
 * @param {*} dateObj - Date à formater
 * @returns {string} Date formatée (ex: "12/03/2026")
 */
export const formatDueDate = (dateObj) => {
  if (!dateObj) return '-';

  try {
    let dueDate;

    if (typeof dateObj.toDate === 'function') {
      dueDate = dateObj.toDate();
    } else if (dateObj.seconds !== undefined) {
      dueDate = new Date(dateObj.seconds * 1000);
    } else if (typeof dateObj.toMillis === 'function') {
      dueDate = new Date(dateObj.toMillis());
    } else {
      dueDate = new Date(dateObj);
    }

    if (isNaN(dueDate.getTime())) return '-';
    return dueDate.toLocaleDateString('fr-FR');
  } catch {
    return '-';
  }
};

/**
 * Retourne le statut et la couleur basés sur les jours restants
 * @param {number} daysRemaining - Nombre de jours restants
 * @returns {Object} { status: string, color: string, bgColor: string }
 */
export const getBorrowStatus = (daysRemaining) => {
  if (daysRemaining < 0) {
    return {
      status: 'En retard',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'faTimesCircle'
    };
  } else if (daysRemaining <= 3) {
    return {
      status: 'À retourner',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: 'faClock'
    };
  } else {
    return {
      status: 'En cours',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'faCheck'
    };
  }
};
