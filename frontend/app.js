try {
const { BrowserRouter, Routes, Route, NavLink, Link, useParams, useNavigate } = window.ReactRouterDOM || {};
const { 
  Upload, 
  Search, 
  Database,
  Menu, 
  ImageIcon,
  BarChart3,
  ArrowLeft,
  Sun,
  Moon
} = window.lucide || window.Lucide || window.LucideReact || {};

// Custom Icon Component
const Icon = ({ name: IconComponent, size = 20, className = "" }) => {
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const navItems = [
    { to: '/', icon: Upload, label: 'Upload' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Icon name={Database} size={24} />
          </div>
          <span className="logo-text">CV Metadata</span>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="header">
          <div className="header-left">
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
              <Icon name={Menu} size={20} />
            </button>
            <h1 className="header-title">CV Metadata Warehouse</h1>
          </div>
          <div className="header-right">
            <button className="btn-none theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Icon name={theme === 'dark' ? Sun : Moon} size={20} />
            </button>
          </div>
        </header>

        <main className="content-area">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Pages
const UploadSection = () => {
  const [status, setStatus] = React.useState('Waiting for upload...');
  const [result, setResult] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const imageInputRef = React.useRef(null);
  const datasetInputRef = React.useRef(null);

  const processFile = async (file, type) => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);
    setStatus(`Uploading "${file.name}"...`);

    try {
      if (type === 'image') {
        // ----------------------------------------------------------------
        // Real API call: POST /upload → FastAPI backend (Bronze Layer)
        // ----------------------------------------------------------------
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
          // NOTE: Do NOT set Content-Type header manually —
          // the browser must set it automatically so the boundary is included.
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || `Server error ${response.status}`);
        }

        const data = await response.json();
        // data = { image: "dog.jpg", detections: [{ object: "dog", confidence: 0.92 }, ...] }

        setStatus(`"${file.name}" processed — ${data.detections.length} object(s) detected.`);

        // Preview the uploaded image locally (object URL avoids an extra round-trip)
        const objectUrl = URL.createObjectURL(file);
        setResult({
          imageUrl: objectUrl,
          filename: data.image,
          detections: data.detections,   // real detections from backend
        });

      } else {
        // ZIP dataset: inform user – backend only supports single images for now
        setStatus(`Dataset "${file.name}" selected. Connect backend batch endpoint to process.`);
        setResult({
          imageUrl: null,
          filename: file.name,
          detections: [],
        });
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file, 'image');
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleDatasetChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file, 'dataset');
    e.target.value = '';
  };

  return (
    <div>
      {/* Hidden file inputs – triggered by their respective buttons */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <input
        ref={datasetInputRef}
        type="file"
        accept=".zip,application/zip"
        style={{ display: 'none' }}
        onChange={handleDatasetChange}
      />

      <div className="page-header">
        <h2 className="title">Upload Data</h2>
        <p className="subtitle">Upload images or datasets for metadata extraction.</p>
      </div>

      <div className="card upload-card mb-32">
        <div className="button-group">
          <button 
            type="button"
            id="btn-upload-image"
            className="btn btn-primary" 
            onClick={() => imageInputRef.current && imageInputRef.current.click()}
            disabled={isUploading}
          >
            Upload Single Image
          </button>
          <button 
            type="button" 
            id="btn-upload-dataset"
            className="btn btn-outline" 
            onClick={() => datasetInputRef.current && datasetInputRef.current.click()}
            disabled={isUploading}
          >
            Upload Dataset (ZIP)
          </button>
        </div>
        <div className="status-area">
          <p>Status: {status}</p>
        </div>
      </div>

      {result && (
        <div className="detection-section animate">
          <h3 className="section-title">Detection Result Viewer</h3>
          {result.imageUrl ? (
            <div className="grid-2">
              <div className="card">
                <h4 className="card-title">Image Preview</h4>
                <div className="image-container">
                  <img src={result.imageUrl} alt="Uploaded preview" className="preview-image" />
                  {/* Overlay container for future bounding boxes */}
                  <div className="bounding-box-overlay" id="bbox-overlay"></div>
                </div>
              </div>
              
              <div className="card">
                <h4 className="card-title">Detected Objects</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Object</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detections.map((det, i) => (
                        <tr key={i}>
                          <td className="font-medium">{det.object}</td>
                          <td>{det.confidence.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <p><strong>Dataset received:</strong> {result.filename}</p>
              <p className="text-muted" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                Connect backend to process the dataset and view detections.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

};

const SearchSection = () => {
  const navigate = useNavigate();
  const [objectName, setObjectName] = React.useState('');
  const [confidence, setConfidence] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      if (objectName) params.append('object', objectName);
      if (confidence)  params.append('confidence', confidence);

      const response = await fetch(`http://localhost:8000/search?${params.toString()}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${response.status}`);
      }
      const data = await response.json();
      // data = { results: [ { id, filename, image_url, detections } ] }
      setResults(data.results);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="title">Search / Query</h2>
        <p className="subtitle">Query the metadata warehouse by object name and confidence threshold.</p>
      </div>

      <div className="card mb-32">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label htmlFor="search-object">Search Object</label>
            <input 
              id="search-object"
              type="text" 
              placeholder="e.g. dog" 
              className="input-field"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-confidence">Confidence &gt;</label>
            <input 
              id="search-confidence"
              type="number" 
              step="0.1"
              min="0"
              max="1"
              placeholder="0.8" 
              className="input-field"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button id="btn-search" type="submit" className="btn btn-primary" disabled={isSearching}>
              <Icon name={Search} size={18} /> 
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {results !== null && (
        <div className="animate">
          <h3 className="section-title">Results</h3>
          {results.length > 0 ? (
            <div className="results-grid">
              {results.map(res => (
                <div 
                  key={res.id} 
                  className="result-card card"
                  onClick={() => navigate(`/metadata/${res.id}`)}
                >
                  <img src={res.image_url} alt={res.filename} className="result-thumb" />
                  <p className="result-filename">{res.filename}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No images found matching the criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

const MetadataViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [metadata, setMetadata] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMetadata = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/metadata/${id}`);
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.detail || `Server error ${response.status}`);
                }
                const data = await response.json();
                // data = { id, filename, width, height, model, image_url, detections }
                setMetadata({
                    filename: data.filename,
                    width: data.width,
                    height: data.height,
                    model: data.model,
                    imageUrl: data.image_url,
                    detections: data.detections,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [id]);

    return (
        <div className="animate">
            <button className="btn btn-none back-btn" onClick={() => navigate(-1)}>
                <Icon name={ArrowLeft} size={18} /> Back to Search
            </button>
            <div className="page-header">
                <h2 className="title">Metadata Viewer</h2>
            </div>
            
            {isLoading ? (
                <p className="text-muted">Loading metadata...</p>
            ) : metadata ? (
                <div className="grid-2">
                    <div className="card">
                        <div className="image-container">
                           <img src={metadata.imageUrl} alt={metadata.filename} className="preview-image" />
                        </div>
                    </div>
                    <div>
                        <div className="card mb-24">
                            <h4 className="card-title">Image Properties</h4>
                            <div className="properties-list">
                                <div className="property-item">
                                    <span className="property-label">Filename</span>
                                    <span className="font-medium">{metadata.filename}</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-label">Width</span>
                                    <span>{metadata.width}px</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-label">Height</span>
                                    <span>{metadata.height}px</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-label">Model</span>
                                    <span>{metadata.model}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h4 className="card-title">Detections</h4>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Object</th>
                                            <th>Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metadata.detections.map((det, i) => (
                                            <tr key={i}>
                                                <td className="font-medium">{det.object}</td>
                                                <td>{det.confidence.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-muted">Metadata not found.</p>
            )}
        </div>
    );
};

const AnalyticsSection = () => {
    const [stats, setStats] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8000/analytics');
                if (!response.ok) {
                    throw new Error(`Server error ${response.status}`);
                }
                const data = await response.json();
                // data = { total_images, total_detections, top_classes: [{object, count}] }
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="animate">
            <div className="page-header">
                <h2 className="title">Analytics</h2>
                <p className="subtitle">High-level view of warehouse metrics.</p>
            </div>

            {isLoading && <p className="text-muted">Loading analytics...</p>}
            {error && <p className="text-muted" style={{color:'var(--color-error, #f87171)'}}>Error: {error}</p>}

            {stats && !isLoading && (
                <>
                    {/* Summary stat cards */}
                    <div className="grid-2 mb-32">
                        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <p className="text-muted" style={{ marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Images Processed</p>
                            <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>{stats.total_images}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <p className="text-muted" style={{ marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Detections</p>
                            <p style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>{stats.total_detections}</p>
                        </div>
                    </div>

                    {/* Top classes */}
                    <h3 className="section-title">Top Detected Objects</h3>
                    {stats.top_classes.length > 0 ? (
                        <div className="card">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Object Class</th>
                                            <th>Detections</th>
                                            <th>Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.top_classes.map((cls, i) => {
                                            const pct = stats.total_detections > 0
                                                ? Math.round((cls.count / stats.total_detections) * 100)
                                                : 0;
                                            return (
                                                <tr key={cls.object}>
                                                    <td className="text-muted">{i + 1}</td>
                                                    <td className="font-medium">{cls.object}</td>
                                                    <td>{cls.count}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                height: '8px', borderRadius: '4px',
                                                                background: 'var(--color-primary, #6366f1)',
                                                                width: `${pct}%`, minWidth: '4px', maxWidth: '120px',
                                                                opacity: 0.8,
                                                            }} />
                                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                            <p className="text-muted">No detections yet. Upload some images to see analytics.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// App Wrapper with Routing
const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<UploadSection />} />
          <Route path="/search" element={<SearchSection />} />
          <Route path="/analytics" element={<AnalyticsSection />} />
          <Route path="/metadata/:id" element={<MetadataViewer />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

// Render
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
} catch (e) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'color:white;background:red;font-size:24px;z-index:9999;position:fixed;top:50px;left:0;padding:20px;width:100%; border:4px solid black;';
  errorDiv.textContent = 'APP SYNC ERROR: ' + e.name + ': ' + e.message;
  document.body.appendChild(errorDiv);
}
