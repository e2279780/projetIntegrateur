#!/bin/bash
# Script de configuration Firebase pour BiblioConnect

echo "=========================================="
echo "   BiblioConnect - Configuration Firebase"
echo "=========================================="
echo ""

# Vérifier si firebase-tools est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ firebase-tools n'est pas installé"
    echo "Installation: npm install -g firebase-tools"
    exit 1
fi

echo "✅ firebase-tools détecté"
echo ""

# Connexion à Firebase
echo "📝 Connexion à Firebase..."
firebase login

# Sélectionner le projet
echo ""
echo "🔍 Sélection du projet..."
firebase use --add

# Déployer les règles Firestore
echo ""
echo "🛡️  Déploiement des règles Firestore..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Règles Firestore déployées avec succès!"
else
    echo "❌ Erreur lors du déploiement des règles"
    exit 1
fi

# Résumé
echo ""
echo "=========================================="
echo "   ✅ Configuration terminée!"
echo "=========================================="
echo ""
echo "Prochaines étapes:"
echo "1. Vérifier la configuration dans Firebase Console"
echo "2. Activer l'authentification par Email/Mot de passe"
echo "3. Activer Cloud Firestore"
echo "4. Activer Cloud Storage"
echo "5. Configurer les variables d'environnement dans .env"
echo ""
