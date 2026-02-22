import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookReader, 
  faClock, 
  faExclamationTriangle, 
  faPlayCircle, 
  faCalendarAlt, 
  faCreditCard, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
      <FontAwesomeIcon icon={icon} />
    </div>
    <h2 className="text-xl font-black text-slate-800">{title}</h2>
  </div>
);

export default function Dashboard({ user }) {
  // --- SÉCURITÉ CRUCIALE : Empêche le crash si user est null au chargement ---
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse font-black text-slate-300 uppercase tracking-widest">
          Chargement du dashboard...
        </div>
      </div>
    );
  }

  const myEmprunts = [
    { 
      id: 1, 
      title: "Clean Code", 
      author: "Robert C. Martin", 
      dueDate: "2026-02-25", 
      thumbnail: "https://books.google.com/books/content?id=hjI6XwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
    },
    { 
      id: 2, 
      title: "The Pragmatic Programmer", 
      author: "Andrew Hunt", 
      dueDate: "2026-02-05", 
      thumbnail: "https://books.google.com/books/content?id=8i9bDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    }
  ];

  const myPurchases = [
    { 
      id: 3, 
      title: "Eloquent JavaScript", 
      author: "Marijn Haverbeke", 
      thumbnail: "https://books.google.com/books/content?id=PT6_DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      readLink: "https://books.google.ca/books?id=PT6_DwAAQBAJ&printsec=frontcover" 
    }
  ];

  const getDaysRemaining = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 font-sans animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR GAUCHE */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] border-4 border-slate-800 flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl italic">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-2xl font-black mb-1 italic uppercase tracking-tighter leading-none">
                {user?.name || "Utilisateur"}
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 truncate">
                {user?.email || "Chargement..."}
              </p>
              
              <div className="border-t border-slate-800 pt-8">
                <p className="text-xl font-black leading-none">{myEmprunts.length + myPurchases.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">Ouvrages actifs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 italic">Frais de retard</h3>
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-between text-red-500">
                <span className="text-sm font-black italic uppercase italic leading-none">Solde dû</span>
                <span className="text-2xl font-black tracking-tighter">2.50 $</span>
              </div>
              
              <Link 
                to="/frais" 
                className="block w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
              >
                <FontAwesomeIcon icon={faCreditCard} className="mr-2" /> Régler mes frais
              </Link>
            </div>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 space-y-12">
          {/* Section Emprunts */}
          <section>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <FontAwesomeIcon icon={faCalendarAlt} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Emprunts en cours</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myEmprunts.map(book => {
                const days = getDaysRemaining(book.dueDate);
                const isLate = days < 0;

                return (
                  <div key={book.id} className={`bg-white p-6 rounded-[3rem] border flex gap-8 group transition-all hover:shadow-xl ${isLate ? 'border-red-100 bg-red-50/10' : 'border-gray-100 shadow-sm'}`}>
                    <div className="relative shrink-0 w-24 h-36 bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-50">
                      <img 
                        src={book.thumbnail?.replace('http:', 'https:')} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover block" 
                        alt={book.title} 
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=Indisponible"; }}
                      />
                      {isLate && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <FontAwesomeIcon icon={faExclamationTriangle} size="xs" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-black text-slate-800 text-xl leading-tight mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase mb-6 tracking-widest">{book.author}</p>
                      
                      <div className={`p-4 rounded-2xl flex items-center gap-4 ${isLate ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-slate-400'}`}>
                        <FontAwesomeIcon icon={isLate ? faClock : faCheckCircle} />
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">
                            {isLate ? "Retard de" : "Prévu dans"}
                          </p>
                          <p className="font-black text-sm uppercase">
                            {Math.abs(days)} jour(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section Liseuse */}
          <section>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-emerald-500 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                  <FontAwesomeIcon icon={faBookReader} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Ma Liseuse</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myPurchases.map(book => (
                <div key={book.id} className="bg-slate-900 rounded-[3rem] p-10 text-white relative group overflow-hidden border border-slate-800">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative w-28 h-40 mb-6 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={book.thumbnail?.replace('http:', 'https:')} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover block" 
                        alt={book.title} 
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=Livre"; }}
                      />
                    </div>
                    <h3 className="font-black text-lg mb-2 leading-tight uppercase italic">{book.title}</h3>
                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-8">{book.author}</p>
                    
                    <a 
                      href={book.readLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                    >
                       <FontAwesomeIcon icon={faPlayCircle} size="lg" /> Lire
                    </a>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}