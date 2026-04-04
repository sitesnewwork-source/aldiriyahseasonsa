import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-6 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">حدث خطأ في تحميل الصفحة</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            قد يكون السبب مشكلة مؤقتة في الاتصال. يرجى المحاولة مرة أخرى.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2.5 bg-gold text-white rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
