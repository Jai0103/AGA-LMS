import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCcw, ShieldCheck } from "lucide-react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "The page could not be rendered.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AGA LMS render error", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.hash = "/";
    this.setState({
      hasError: false,
      message: "",
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
          <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
              <div className="p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  Page recovery
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  Something interrupted this page.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  AGA LMS caught a frontend rendering error before it could turn into a blank screen. You can reload the page or return to the home screen.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Technical message</p>
                  <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-800">
                    {this.state.message}
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={this.handleReload}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reload page
                  </button>
                  <button
                    type="button"
                    onClick={this.handleHome}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                  >
                    <Home className="h-4 w-4" />
                    Return home
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-8 text-white lg:p-10">
                <div className="flex h-full min-h-[20rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <ShieldCheck className="h-8 w-8 text-emerald-300" />
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                      Protected UI
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Recovery standard</p>
                    <p className="mt-3 text-2xl font-bold tracking-tight">
                      Runtime errors are now contained instead of showing a blank page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}
