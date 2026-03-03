# Guide des Frais de Retard - BiblioConnect

## Vue d'ensemble

Le système de frais de retard permet à la bibliothèque de gérer les livres non retournés à temps et de facturer les utilisateurs selon un tarif journalier fixe.

## Caractéristiques principales

### 1. **Calcul automatique des frais**
- **Tarif**: 1,50$ par jour de retard
- **Calcul**: Les frais sont calculés automatiquement lorsqu'un livre est retourné en retard
- **Précision**: Les frais sont arrondis à 2 décimales

### 2. **Blocage des emprunts**
- Les utilisateurs qui ont des frais de retard **non payés** ne peuvent pas emprunter d'autres livres
- Un message d'erreur clairs'affiche lors de la tentative d'emprunt
- Le blocage est levé dès que les frais sont payés

### 3. **Historique des frais**
- Chaque emprunt en retard enregistre:
  - `daysOverdue`: Nombre de jours de retard
  - `lateFees`: Montant total des frais
  - `feesSettled`: Boolean indiquant si les frais ont été payés
  - `feesSettledDate`: Date du paiement (si applicable)

## Structure des données Firestore

### Collection `borrows` (emprunts)
```javascript
{
  userId: string,
  bookId: string,
  borrowDate: Timestamp,
  returnDueDate: Timestamp,
  returnDate: Timestamp | null,
  isOverdue: boolean,
  daysOverdue: number,        // Nouveau
  lateFees: number,           // Nouveau
  feesSettled: boolean,       // Nouveau
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `payments` (paiements)
```javascript
{
  userId: string,
  totalAmount: number,
  borrowIds: string[],
  paymentDate: Timestamp,
  type: 'late_fees',
  status: 'completed',
  createdAt: Timestamp
}
```

## API Endpoints

### 1. **GET /api/overdue-charges/:userId**
Obtenir les frais de retard en attente d'un utilisateur.

**Réponse:**
```json
{
  "hasOutstandingCharges": boolean,
  "totalCharges": number,
  "overdueBooks": [
    {
      "borrowId": string,
      "bookId": string,
      "daysOverdue": number,
      "lateFees": number,
      "returnDueDate": Timestamp
    }
  ]
}
```

### 2. **POST /api/pay-overdue-charges**
Marquer les frais de retard comme payés.

**Corps de la requête:**
```json
{
  "userId": string,
  "borrowIds": string[]  // Optionnel - si non fourni, paye tous les emprunts en retard
}
```

**Réponse:**
```json
{
  "success": true,
  "paymentId": string,
  "totalPaid": number,
  "borrowsSettled": number,
  "paymentDetails": [
    {
      "borrowId": string,
      "lateFees": number,
      "settled": true
    }
  ]
}
```

### 3. **GET /api/unpaid-charges/:userId**
Obtenir les frais impayés (livres retournés en retard mais frais non payés).

**Réponse:**
```json
[
  {
    "borrowId": string,
    "bookId": string,
    "lateFees": number,
    "isOverdue": true,
    "feesSettled": false
  }
]
```

### 4. **DELETE /api/borrows/:borrowId**
Modifier pour retourner les informations de frais.

**Réponse:**
```json
{
  "success": true,
  "message": "Livre retourné avec succès",
  "isOverdue": boolean,
  "daysOverdue": number,
  "lateFees": number
}
```

## Service Functions (databaseService.js)

### `checkUserOutstandingCharges(userId)`
Vérifie si un utilisateur a des frais de retard impayés.

```javascript
const charges = await databaseService.checkUserOutstandingCharges(userId);
// Returns: { hasOutstandingCharges, totalCharges, overdueBooks }
```

### `createBorrow(userId, bookId, daysToKeep)`
Crée un emprunt. **Lance une erreur** si l'utilisateur a des frais en attente.

```javascript
try {
  const borrowId = await databaseService.createBorrow(userId, bookId, 14);
} catch (err) {
  // "Vous avez des frais de retard impayés (X.XX$)..."
}
```

### `returnBorrow(borrowId)`
Retourne un livre et calcule les frais si nécessaire.

```javascript
const result = await databaseService.returnBorrow(borrowId);
// Returns: { isOverdue, daysOverdue, lateFees }
```

### `getUserOverdueBooks(userId)`
Obtient les emprunts actuels en retard avec frais.

```javascript
const overdueBooks = await databaseService.getUserOverdueBooks(userId);
```

### `payOverdueCharges(userId, borrowIds?)`
Marque les frais de retard comme payés et crée un enregistrement de paiement.

```javascript
const payment = await databaseService.payOverdueCharges(userId);
// ou
const payment = await databaseService.payOverdueCharges(userId, [borrowId1, borrowId2]);
```

### `getUnpaidOverdueCharges(userId)`
Obtient les frais impayés d'un utilisateur.

```javascript
const unpaid = await databaseService.getUnpaidOverdueCharges(userId);
```

## Interface Utilisateur

### Page Dashboard
- **Widget "Frais à régler"**: Affiche le montant total des frais en attente
- **Alerte visuelle**: Card rouge en haut si des frais sont en attente
- **Lien d'accès rapide**: Bouton pour naviguer vers la page de paiement

### Page Frais (/frais)
- **Liste détaillée**: Affiche tous les livres en retard
- **Calcul en temps réel**: Affiche le nombre de jours de retard et les frais accumulés
- **Formulaire de paiement**: Interface de paiement pour régler les frais
- **Message de succès**: Confirmation après le paiement

### Page BookDetail
- **Blocage d'emprunt**: Message d'erreur si l'utilisateur a des frais non réglés
- **Vérification au chargement**: Vérifie automatiquement les frais de l'utilisateur

## Flux d'utilisation

### Scénario 1: Retour en retard
1. Utilisateur retourne un livre après la date limite
2. La fonction `returnBorrow()` calcule automatiquement les frais
3. Un enregistrement est créé avec `daysOverdue` et `lateFees`
4. Le livre est marqué comme `isOverdue: true`

### Scénario 2: Paiement des frais
1. Utilisateur voit le widget "Frais à régler" dans le Dashboard
2. Clique sur le lien "Régler les frais maintenant"
3. Navigue vers la page `/frais`
4. Remplit le formulaire de paiement
5. Soumet le paiement
6. Les frais sont marqués comme `feesSettled: true`
7. Peut maintenant emprunter d'autres livres

### Scénario 3: Tentative d'emprunt avec frais non payés
1. Utilisateur tente d'emprunter un livre
2. `createBorrow()` appelle `checkUserOutstandingCharges()`
3. Trouve des frais en attente
4. Lance une erreur: "Vous avez des frais de retard impayés..."
5. Utilisateur est redirigé vers la page de paiement

## Configuration

### Modifier le tarif journalier
Éditez la constante dans `databaseService.js`:
```javascript
const LATE_FEE_PER_DAY = 1.50; // Modifier cette valeur
```

## Considérations de sécurité

1. **Validation côté serveur**: Les vérifications de frais sont faites côté serveur
2. **Authentification**: Chaque paiement est lié à une `userId` vérifiée
3. **Historique**: Tous les paiements sont enregistrés dans la collection `payments`
4. **Audit trail**: Chaque transaction crée un enregistrement immuable

## Points importants

⚠️ **Important:**
- Les frais ne sont **pas calculés automatiquement** au fil du temps
- Ils sont calculés **au moment du retour** du livre
- Une fois un livre retourné, les frais deviennent **immuables**
- Les paiements ne sont **pas réversibles** (par design de sécurité)

## Cas limites

### Livre retourné tardif mais pas encore payé
- `feesSettled: false` jusqu'au paiement
- L'utilisateur ne peut pas emprunter d'autres livres
- Les frais continuent de s'afficher

### Paiement partiel
- Le système supporte les paiements par emprunt
- Chaque emprunt peut être payé indépendamment
- Pas supporté actuellement dans l'interface (UI)

### Multiple emprunts en retard
- Le montant total est affiché sur le Dashboard
- Tous les emprunts en retard doivent être payés pour obtenir l'accès à l'emprunt

## Tests recommandés

1. ✅ Retourner un livre avec 3 jours de retard → $4.50 de frais
2. ✅ Vérifier que le Dashboard affiche les frais
3. ✅ Tenter d'emprunter un livre avec frais en attente → Erreur
4. ✅ Payer les frais via la page `/frais`
5. ✅ Vérifier que l'utilisateur peut emprunter après paiement
6. ✅ Vérifier les frais d'autres utilisateurs n'affectent pas l'accès
