import React, { useState, useCallback } from 'react';
import { Search, BookOpen, User, Calendar, Star, X, ExternalLink } from 'lucide-react';

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  publisher?: string[];
  subject?: string[];
  language?: string[];
  page_count?: number;
  rating?: number;
}

interface SearchResponse {
  docs: Book[];
  numFound: number;
  start: number;
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data: SearchResponse = await response.json();
      setBooks(data.docs.slice(0, 20)); // Limit to 20 results for better performance
    } catch (error) {
      console.error('Error searching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks(searchQuery);
  };

  const getCoverUrl = (coverId?: number, size: 'S' | 'M' | 'L' = 'M') => {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  };

  const getBookUrl = (key: string) => {
    return `https://openlibrary.org${key}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">BookSearch</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Your Next Great Read
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Search through millions of books from the Open Library
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for books by title..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200 hover:shadow-xl"
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <div className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl transition-colors duration-200 font-medium">
                  {loading ? 'Searching...' : 'Search'}
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              {books.length > 0 ? `Found ${books.length} books` : 'No books found'}
            </h3>
            
            {books.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <div
                    key={book.key}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                      {book.cover_i ? (
                        <img
                          src={getCoverUrl(book.cover_i, 'L')}
                          alt={`Cover of ${book.title}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <BookOpen className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {book.title}
                      </h4>
                      
                      {book.author_name && (
                        <div className="flex items-center gap-1 text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm line-clamp-1">
                            {book.author_name.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {book.first_publish_year && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{book.first_publish_year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Welcome State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">
              Start your book discovery journey
            </h3>
            <p className="text-gray-500">
              Enter a book title in the search box above to begin exploring
            </p>
          </div>
        )}
      </main>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-2xl font-bold text-gray-900">Book Details</h3>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <div className="w-48 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-lg mx-auto">
                    {selectedBook.cover_i ? (
                      <img
                        src={getCoverUrl(selectedBook.cover_i, 'L')}
                        alt={`Cover of ${selectedBook.title}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Book Information */}
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {selectedBook.title}
                  </h4>
                  
                  <div className="space-y-3">
                    {selectedBook.author_name && (
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">Author(s):</span>
                          <p className="text-gray-700">{selectedBook.author_name.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedBook.first_publish_year && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">First Published:</span>
                        <span className="text-gray-700">{selectedBook.first_publish_year}</span>
                      </div>
                    )}
                    
                    {selectedBook.publisher && selectedBook.publisher.length > 0 && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">Publisher(s):</span>
                          <p className="text-gray-700">{selectedBook.publisher.slice(0, 3).join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedBook.language && selectedBook.language.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 text-sm font-bold">🌐</span>
                        <div>
                          <span className="font-medium text-gray-900">Language(s):</span>
                          <p className="text-gray-700">{selectedBook.language.slice(0, 5).join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedBook.subject && selectedBook.subject.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 text-sm font-bold">📚</span>
                        <div>
                          <span className="font-medium text-gray-900">Subjects:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedBook.subject.slice(0, 8).map((subject, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a
                      href={getBookUrl(selectedBook.key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                    >
                      View on Open Library
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;