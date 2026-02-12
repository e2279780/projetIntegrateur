/**
 * Exemple d'intégration Firebase dans votre App.jsx
 * Ce fichier montre comment mettre en place l'authentification et gérer l'état utilisateur
 */

import { useEffect, useState } from 'react';
import { authService } from './services';
import { databaseService, storageService } from './services';
import { useUser } from './context/useUser';

// ============= EXEMPLE D'UTILISATION DANS UN COMPOSANT =============

/**
 * Composant de connexion
 */
export const LoginExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.login(email, password);
      console.log('Connecté:', user);
      setEmail('');
      setPassword('');
      // La redirection se fera automatiquement via useUser et onAuthChange
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.loginWithGoogle();
      console.log('Connecté avec Google:', user);
      // La redirection se fera automatiquement via useUser et onAuthChange
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '420px',
    margin: '50px auto',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 10px 0',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#4299e1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
  };

  const primaryButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1,
    transform: loading ? 'scale(0.98)' : 'scale(1)',
  };

  const primaryButtonHoverStyle = {
    ...primaryButtonStyle,
    backgroundColor: loading ? '#2563eb' : '#1d4ed8',
  };

  const secondaryButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1,
  };

  const secondaryButtonHoverStyle = {
    ...secondaryButtonStyle,
    backgroundColor: loading ? '#f9fafb' : '#f3f4f6',
    borderColor: '#d1d5db',
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    fontSize: '13px',
    color: '#9ca3af',
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  };

  const errorStyle = {
    padding: '12px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px',
    border: '1px solid #fecaca',
  };

  const linkStyle = {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
  };

  const linkAStyle = {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const [emailInput, setEmailInput] = useState(inputStyle);
  const [passwordInput, setPasswordInput] = useState(inputStyle);
  const [primaryBtn, setPrimaryBtn] = useState(primaryButtonStyle);
  const [secondaryBtn, setSecondaryBtn] = useState(secondaryButtonStyle);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>BiblioConnect</h1>
        <p style={subtitleStyle}>Connectez-vous à votre bibliothèque</p>
      </div>

      {error && <div style={errorStyle}>❌ {error}</div>}

      <form onSubmit={handleLogin} style={formStyle}>
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailInput(inputFocusStyle)}
          onBlur={() => setEmailInput(inputStyle)}
          required
          style={emailInput}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordInput(inputFocusStyle)}
          onBlur={() => setPasswordInput(inputStyle)}
          required
          style={passwordInput}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setPrimaryBtn(primaryButtonHoverStyle)}
          onMouseLeave={() => setPrimaryBtn(primaryButtonStyle)}
          style={primaryBtn}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              Connexion en cours...
            </>
          ) : (
            '→ Se connecter'
          )}
        </button>
      </form>

      <div style={dividerStyle}>
        <div style={dividerLineStyle}></div>
        <span>ou</span>
        <div style={dividerLineStyle}></div>
      </div>

      <button
        onClick={handleLoginGoogle}
        disabled={loading}
        onMouseEnter={() => setSecondaryBtn(secondaryButtonHoverStyle)}
        onMouseLeave={() => setSecondaryBtn(secondaryButtonStyle)}
        style={secondaryBtn}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? 'Connexion Google...' : 'Se connecter avec Google'}
      </button>

      <div style={linkStyle}>
        Pas de compte ?{' '}
        <a style={linkAStyle}>S'inscrire</a>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:disabled {
          background-color: #f9fafb;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

/**
 * Composant d'inscription
 */
export const SignupExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Membre',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputStates, setInputStates] = useState({
    email: 'default',
    password: 'default',
    firstName: 'default',
    lastName: 'default',
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role
      );
      console.log('Compte créé:', user);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'Membre',
      });
      // La redirection se fera automatiquement
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.signupWithGoogle();
      console.log('Compte créé avec Google:', user);
      // La redirection se fera automatiquement
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const containerStyle = {
    maxWidth: '420px',
    margin: '50px auto',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 10px 0',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#4299e1',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const selectFocusStyle = {
    ...inputFocusStyle,
    cursor: 'pointer',
  };

  const primaryButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1,
    marginTop: '10px',
  };

  const primaryButtonHoverStyle = {
    ...primaryButtonStyle,
    backgroundColor: loading ? '#2563eb' : '#1d4ed8',
  };

  const secondaryButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1,
    marginTop: '5px',
  };

  const secondaryButtonHoverStyle = {
    ...secondaryButtonStyle,
    backgroundColor: loading ? '#f9fafb' : '#f3f4f6',
    borderColor: '#d1d5db',
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    fontSize: '13px',
    color: '#9ca3af',
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  };

  const errorStyle = {
    padding: '12px 14px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '15px',
    border: '1px solid #fecaca',
  };

  const linkStyle = {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
  };

  const linkAStyle = {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const [primaryBtn, setPrimaryBtn] = useState(primaryButtonStyle);
  const [secondaryBtn, setSecondaryBtn] = useState(secondaryButtonStyle);

  const handleInputFocus = (field) => {
    setInputStates(prev => ({ ...prev, [field]: 'focus' }));
  };

  const handleInputBlur = (field) => {
    setInputStates(prev => ({ ...prev, [field]: 'default' }));
  };

  const getInputStyle = (field) => {
    return inputStates[field] === 'focus' ? inputFocusStyle : inputStyle;
  };

  const getSelectStyle = (field) => {
    return inputStates[field] === 'focus' ? selectFocusStyle : selectStyle;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>BiblioConnect</h1>
        <p style={subtitleStyle}>Créer votre compte utilisateur</p>
      </div>

      {error && <div style={errorStyle}>❌ {error}</div>}

      <form onSubmit={handleSignup} style={formStyle}>
        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => handleInputFocus('email')}
          onBlur={() => handleInputBlur('email')}
          required
          style={getInputStyle('email')}
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe (min 6 caractères)"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => handleInputFocus('password')}
          onBlur={() => handleInputBlur('password')}
          required
          style={getInputStyle('password')}
          disabled={loading}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            type="text"
            name="firstName"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChange}
            onFocus={() => handleInputFocus('firstName')}
            onBlur={() => handleInputBlur('firstName')}
            required
            style={getInputStyle('firstName')}
            disabled={loading}
          />

          <input
            type="text"
            name="lastName"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChange}
            onFocus={() => handleInputFocus('lastName')}
            onBlur={() => handleInputBlur('lastName')}
            required
            style={getInputStyle('lastName')}
            disabled={loading}
          />
        </div>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={getSelectStyle('role')}
          disabled={loading}
        >
          <option value="Membre">👤 Membre</option>
          <option value="Bibliothécaire">📚 Bibliothécaire</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setPrimaryBtn(primaryButtonHoverStyle)}
          onMouseLeave={() => setPrimaryBtn(primaryButtonStyle)}
          style={primaryBtn}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              Inscription en cours...
            </>
          ) : (
            '→ S\'inscrire'
          )}
        </button>
      </form>

      <div style={dividerStyle}>
        <div style={dividerLineStyle}></div>
        <span>ou</span>
        <div style={dividerLineStyle}></div>
      </div>

      <button
        onClick={handleSignupGoogle}
        disabled={loading}
        onMouseEnter={() => setSecondaryBtn(secondaryButtonHoverStyle)}
        onMouseLeave={() => setSecondaryBtn(secondaryButtonStyle)}
        style={secondaryBtn}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? 'Inscription Google...' : 'S\'inscrire avec Google'}
      </button>

      <div style={linkStyle}>
        Vous avez déjà un compte ?{' '}
        <a style={linkAStyle}>Se connecter</a>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:disabled, select:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

/**
 * Composant pour lister les livres
 */
export const BooksListExample = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const allBooks = await databaseService.getAllBooks();
        setBooks(allBooks);
      } catch (error) {
        console.error('Erreur:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    if (!user) {
      alert('Vous devez être connecté pour emprunter un livre');
      return;
    }
    try {
      await databaseService.createBorrow(user.uid, bookId, 14);
      alert('Livre emprunté avec succès!');
      // Recharger la liste
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Livres disponibles</h2>
      {books.map((book) => (
        <div key={book.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <h3>{book.title}</h3>
          <p>Auteur: {book.author}</p>
          <p>Catégorie: {book.category}</p>
          <p>Disponible: {book.availableCopies}/{book.totalCopies}</p>
          {book.availableCopies > 0 && (
            <button onClick={() => handleBorrow(book.id)}>
              Emprunter
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Composant pour ajouter un livre (Bibliothécaire uniquement)
 */
export const AddBookExample = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    totalCopies: 1,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [error, setError] = useState('');
  const { role } = useUser();

  if (role !== 'Bibliothécaire') {
    return <p>Seul un bibliothécaire peut ajouter des livres</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      // Ajouter le livre
      const bookId = await databaseService.addBook('Bibliothécaire', formData);

      // Uploader la couverture si fournie
      if (coverFile) {
        const imageUrl = await storageService.uploadBookCover(bookId, coverFile);
        await databaseService.updateBook('Bibliothécaire', bookId, {
          coverImageUrl: imageUrl,
        });
      }

      alert('Livre ajouté avec succès!');
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        description: '',
        totalCopies: 1,
      });
      setCoverFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleAddBook}>
      <h2>Ajouter un livre</h2>
      <input
        type="text"
        name="title"
        placeholder="Titre"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="author"
        placeholder="Auteur"
        value={formData.author}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="isbn"
        placeholder="ISBN"
        value={formData.isbn}
        onChange={handleChange}
      />
      <input
        type="text"
        name="category"
        placeholder="Catégorie"
        value={formData.category}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <input
        type="number"
        name="totalCopies"
        placeholder="Nombre de copies"
        value={formData.totalCopies}
        onChange={handleChange}
        min="1"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCoverFile(e.target.files[0])}
      />
      <button type="submit">Ajouter le livre</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

/**
 * Composant pour afficher l'historique des emprunts
 */
export const BorrowHistoryExample = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        const history = await databaseService.getUserBorrowHistory(user.uid);
        setBorrows(history);
      } catch (error) {
        console.error('Erreur:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleReturnBook = async (borrowId) => {
    try {
      await databaseService.returnBorrow(borrowId);
      alert('Livre retourné avec succès!');
      // Recharger la page ou mettre à jour l'état
      window.location.reload();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const activeBorrows = borrows.filter((b) => !b.returnDate);
  const returnedBorrows = borrows.filter((b) => b.returnDate);

  return (
    <div>
      <h2>Mes emprunts</h2>
      
      <h3>Emprunts actifs ({activeBorrows.length})</h3>
      {activeBorrows.length === 0 ? (
        <p>Aucun emprunt actif</p>
      ) : (
        activeBorrows.map((borrow) => (
          <div key={borrow.id} style={{ border: '1px solid orange', padding: '10px', margin: '10px 0' }}>
            <p>Livre ID: {borrow.bookId}</p>
            <p>Emprunté le: {borrow.borrowDate.toDate().toLocaleDateString()}</p>
            <p style={{
              color: new Date() > borrow.returnDueDate.toDate() ? 'red' : 'green',
            }}>
              À retourner avant: {borrow.returnDueDate.toDate().toLocaleDateString()}
            </p>
            <button onClick={() => handleReturnBook(borrow.id)}>
              Retourner
            </button>
          </div>
        ))
      )}

      <h3>Historique ({returnedBorrows.length})</h3>
      {returnedBorrows.map((borrow) => (
        <div key={borrow.id} style={{ border: '1px solid green', padding: '10px', margin: '10px 0', opacity: 0.7 }}>
          <p>Livre ID: {borrow.bookId}</p>
          <p>Retourné le: {borrow.returnDate.toDate().toLocaleDateString()}</p>
          {borrow.isOverdue && <p style={{ color: 'red' }}>⚠️ Était en retard</p>}
        </div>
      ))}
    </div>
  );
};
