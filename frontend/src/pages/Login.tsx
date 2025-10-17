import { useState, FormEvent } from 'react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@assetflow.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular login (en producción esto llamaría a /api/auth/login)
    setTimeout(() => {
      if (email && password) {
        onLogin({
          id: '1',
          name: 'Usuario Demo',
          email: email,
          role: 'admin'
        });
      } else {
        setError('Email y contraseña son requeridos');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold text-primary">AssetFlow</h1>
                  <p className="text-muted">Sistema de Gestión de Activos</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Recordarme
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Demo: demo@assetflow.com / demo123
                  </small>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">Estado del Sistema</h6>
                  <div className="d-flex justify-content-between">
                    <span className="badge bg-success">Backend API: Activo</span>
                    <span className="badge bg-success">MongoDB: Activo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                AssetFlow v1.0 &copy; 2025
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
