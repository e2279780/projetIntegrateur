#!/usr/bin/env node
/**
 * Script pour vérifier les données de test créées
 * Affiche les emprunts et frais du compte mimic
 */
/* global process */

import dotenv from 'dotenv';
dotenv.config();

async function verifyTestData() {
  console.log('🔍 BiblioConnect - Vérification des données de test');
  console.log('========================================\n');

  try {
    // Charger les modules
    const dbSvc = await import('../src/services/databaseService.js');

    const mimicUserId = 'xBuNcSr0RgUT28usVtNqBDT0wXp1';
    console.log(`👤 Vérification pour: ${mimicUserId}\n`);

    // 1. Vérifier les frais en attente
    console.log('📊 Frais de retard en attente:');
    const charges = await dbSvc.checkUserOutstandingCharges(mimicUserId);
    
    console.log(`   ✅ Frais en attente: ${charges.hasOutstandingCharges ? 'OUI' : 'NON'}`);
    console.log(`   💰 Montant total: $${charges.totalCharges.toFixed(2)}`);
    console.log(`   📚 Nombre de livres: ${charges.overdueBooks.length}`);

    if (charges.overdueBooks.length > 0) {
      console.log('\n   Détails des livres:\n');
      for (const book of charges.overdueBooks) {
        console.log(`   📖 ${book.bookId}`);
        console.log(`      Jours de retard: ${book.daysOverdue}`);
        console.log(`      Frais: $${book.lateFees.toFixed(2)}`);
      }
    }

    // 2. Vérifier tous les emprunts
    console.log('\n\n📚 Tous les emprunts du compte:\n');
    const allBorrows = await dbSvc.getUserBorrowHistory(mimicUserId);
    
    console.log(`   Total: ${allBorrows.length} emprunt(s)\n`);
    
    for (const borrow of allBorrows) {
      console.log(`   📕 Emprunt ID: ${borrow.id}`);
      console.log(`      Livre: ${borrow.bookId}`);
      console.log(`      Retourné: ${borrow.returnDate ? 'OUI' : 'NON'}`);
      console.log(`      En retard: ${borrow.isOverdue ? 'OUI' : 'NON'}`);
      if (borrow.lateFees) {
        console.log(`      Frais: $${borrow.lateFees.toFixed(2)}`);
      }
      console.log();
    }

    // 3. Frais impayés
    console.log('\n💳 Frais impayés:\n');
    const unpaid = await dbSvc.getUnpaidOverdueCharges(mimicUserId);
    
    console.log(`   Total: ${unpaid.length} frais impayé(s)\n`);
    
    for (const charge of unpaid) {
      console.log(`   ⚠️  Emprunt: ${charge.borrowId}`);
      console.log(`      Livre: ${charge.bookId}`);
      console.log(`      Frais: $${charge.lateFees.toFixed(2)}`);
    }

    console.log('\n========================================');
    console.log('✅ VÉRIFICATION TERMINÉE');
    console.log('========================================\n');

    if (!charges.hasOutstandingCharges) {
      console.log('⚠️  ATTENTION: Aucun frais de retard trouvé!');
      console.log('💡 Assurez-vous que:');
      console.log('   1. Le script test-late-fees.js s\'est exécuté avec succès');
      console.log('   2. Les emprunts sont dans Firestore');
      console.log('   3. L\'userId "xBuNcSr0RgUT28usVtNqBDT0wXp1" est correct\n');
    } else {
      console.log('✅ Les données de test sont présentes!');
      console.log('🧪 Vous pouvez maintenant tester l\'interface:\n');
      console.log('   1. Démarrez l\'app: npm run dev');
      console.log('   2. Connectez-vous avec le compte mimic');
      console.log('   3. Allez au Dashboard');
      console.log('   4. Vous devriez voir les frais affichés\n');
    }

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  }
}

verifyTestData();
