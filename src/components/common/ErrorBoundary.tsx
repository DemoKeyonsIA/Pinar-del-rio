import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "No se pudo mostrar la vista",
      error.message,
      info.componentStack,
    );
  }
  render() {
    if (this.state.failed)
      return (
        <div className="p-8 max-w-xl mx-auto" role="alert">
          <h1 className="text-xl mb-4">No pudimos mostrar esta vista</h1>
          <p className="mb-4">
            Sus datos guardados se conservan. Recargue la aplicación para volver
            a entrar.
          </p>
          <button
            className="button secondary"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </div>
      );
    return this.props.children;
  }
}
