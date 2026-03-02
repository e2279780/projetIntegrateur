#!/usr/bin/env node
/**
 * Script pour initialiser la base de données Firebase avec les livres
 * Usage: node scripts/seed-database.js
 */
/* global process */

async function seedDatabase() {
  console.log('📚 BiblioConnect - Initialisation de la base de données');
  console.log('========================================\n');

  try {
    // Charger les modules
    const seedModule = await import('../src/seedBooks.js');
    const dbSvc = await import('../src/services/databaseService.js');

    // Vérifier si des livres existent déjà
    console.log('🔍 Vérification de la base de données...');
    const existingBooks = await dbSvc.getAllBooks();

    if (existingBooks && existingBooks.length > 0) {
      console.log(`\n✅ La base contient déjà ${existingBooks.length} livres.`);
      console.log('💡 Pour forcer la réinitialisation, supprimez d\'abord les livres dans Firebase Console.\n');
      return;
    }

    // Initialiser les livres
    console.log('📥 Ajout des livres à Firebase...\n');
    const result = await seedModule.seedBooksToFirebase('Bibliothécaire');

    console.log('\n========================================');
    console.log('✅ INITIALISATION TERMINÉE');
    console.log('========================================');
    console.log(`📚 Total de livres: ${result.total}`);
    console.log(`✅ Ajoutés: ${result.addedCount}`);
    console.log(`❌ Erreurs: ${result.errorCount}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('   1. Le fichier .env est configuré avec vos identifiants Firebase');
    console.log('   2. Firestore est activé dans votre projet Firebase');
    console.log('   3. Les règles Firestore permettent l\'écriture\n');
    process.exit(1);
  }
}

seedDatabase();
