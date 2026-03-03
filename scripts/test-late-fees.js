#!/usr/bin/env node
/**
 * Script pour générer des données de test pour les frais de retard
 * Crée des emprunts en retard pour le compte de test "mimic"
 * Usage: node scripts/test-late-fees.js
 */
/* global process */

import dotenv from 'dotenv';
dotenv.config();

import { Timestamp, collection, addDoc } from 'firebase/firestore';

async function createTestLateFees() {
  console.log('🧪 BiblioConnect - Script de test des frais de retard');
  console.log('========================================\n');

  try {
    // Charger les modules
    const dbSvc = await import('../src/services/databaseService.js');
    const firebaseServer = await import('../src/firebaseServer.js');
    const db = firebaseServer.db;

    // ID du compte de test
    const mimicUserId = 'xBuNcSr0RgUT28usVtNqBDT0wXp1'; // ID du compte mimic trouvé dans Firebase
    console.log(`👤 Compte de test: ${mimicUserId}\n`);

    // Récupérer les livres disponibles
    console.log('📚 Récupération des livres...');
    const books = await dbSvc.getAllBooks();
    
    if (books.length < 3) {
      console.error('❌ Vous avez besoin d\'au moins 3 livres pour ce test');
      console.log('💡 Exécutez d\'abord: node scripts/seed-database.js\n');
      process.exit(1);
    }

    const selectedBooks = books.slice(0, 3); // Prendre les 3 premiers livres
    console.log(`✅ ${books.length} livres trouvés\n`);

    // Créer les emprunts en retard
    console.log('⏰ Création d\'emprunts en retard...\n');

    const testCases = [
      {
        days: 3,
        bookIndex: 0,
        description: '3 jours de retard'
      },
      {
        days: 7,
        bookIndex: 1,
        description: '7 jours de retard'
      },
      {
        days: 10,
        bookIndex: 2,
        description: '10 jours de retard'
      }
    ];

    const borrowIds = [];

    for (const testCase of testCases) {
      const book = selectedBooks[testCase.bookIndex];
      
      // Créer une date limite dans le passé
      const returnDueDate = new Date();
      returnDueDate.setDate(returnDueDate.getDate() - testCase.days);

      // Date d'emprunt
      const borrowDate = new Date(returnDueDate);
      borrowDate.setDate(borrowDate.getDate() - 14); // Emprunt standard de 14 jours

      // Calculer les frais
      const lateFees = testCase.days * 1.5; // 1,50$ par jour

      console.log(`📖 Livre: "${book.title}"`);
      console.log(`   Auteur: ${book.author}`);
      console.log(`   Retard: ${testCase.days} jours`);
      console.log(`   Frais: $${lateFees.toFixed(2)}`);

      // Créer l'emprunt EN RETARD mais NON RETOURNÉ dans Firestore
      const borrowRef = await addDoc(collection(db, 'borrows'), {
        userId: mimicUserId,
        bookId: book.id,
        borrowDate: Timestamp.fromDate(borrowDate),
        returnDueDate: Timestamp.fromDate(returnDueDate),
        returnDate: null, // PAS encore retourné
        isOverdue: true,
        daysOverdue: testCase.days,
        lateFees: lateFees,
        feesSettled: false, // Frais NON payés
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      borrowIds.push(borrowRef.id);
      console.log(`   ✅ Emprunt créé: ${borrowRef.id}\n`);
    }

    // Résumé
    console.log('========================================');
    console.log('✅ DONNÉES DE TEST CRÉÉES');
    console.log('========================================\n');

    const totalFees = testCases.reduce((sum, tc) => sum + (tc.days * 1.5), 0);
    console.log(`📊 Résumé:`);
    console.log(`   Emprunts en retard: ${borrowIds.length}`);
    console.log(`   Total des frais: $${totalFees.toFixed(2)}`);
    console.log(`   Compte de test: ${mimicUserId}\n`);

    console.log('🧪 Étapes de test:\n');
    console.log('1️⃣  Se connecter avec le compte "mimic" sur l\'application');
    console.log('2️⃣  Aller au Dashboard');
    console.log('3️⃣  Voir le widget "Frais à régler" avec $' + totalFees.toFixed(2));
    console.log('4️⃣  Voir l\'alerte rouge "Frais de retard à régler"');
    console.log('5️⃣  Cliquer sur "Régler les frais maintenant"');
    console.log('6️⃣  La page Frais affiche les 3 livres en retard');
    console.log('7️⃣  Remplir le formulaire de paiement et soumettre');
    console.log('8️⃣  Voir le message de succès');
    console.log('9️⃣  Retourner au Dashboard - les frais ont disparu');
    console.log('🔟 Tenter d\'emprunter un livre - devrait fonctionner\n');

    console.log('💡 Pour tester le blocage d\'emprunt:');
    console.log('   - Ne pas payer les frais');
    console.log('   - Aller sur une page de livre');
    console.log('   - Cliquer sur "Emprunter"');
    console.log('   - Voir le message d\'erreur bloquant\n');

    console.log('⚠️  Pour réinitialiser les données:');
    console.log('   - Oavrez Firebase Console');
    console.log('   - Supprimez les emprunts du document utilisateur');
    console.log('   - Ou réexécutez ce script pour créer nouveaux emprunts\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('   1. Le fichier .env est configuré avec vos identifiants Firebase');
    console.log('   2. Firestore est activé dans votre projet Firebase');
    console.log('   3. Les règles Firestore permettent l\'écriture');
    console.log('   4. Vous avez créé un compte "mimic" dans Firebase Auth\n');
    process.exit(1);
  }
}

createTestLateFees();
