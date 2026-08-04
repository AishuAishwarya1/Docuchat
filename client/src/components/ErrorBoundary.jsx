import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif',
          textAlign: 'center', padding: 24,
        }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#756F5E', marginBottom: 20 }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button style={{ backgroundColor: 'gray', paddingTop: 5, paddingBottom: 5, paddingRight: 10, paddingLeft:10, borderRadius: 3 }} onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;