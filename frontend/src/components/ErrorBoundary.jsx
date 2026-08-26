import { Component } from "react";

// Without this, a single component throwing during render (as
// CreditDebitNoteModal briefly did — a Rules-of-Hooks violation) unmounts
// the entire React tree to a blank page with no way to recover short of a
// hard reload.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error in app tree:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold text-ink">Something went wrong.</p>
        <p className="text-sm text-gray-500">
          Please reload the page. If this keeps happening, it's a bug worth reporting.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reload
        </button>
      </div>
    );
  }
}
