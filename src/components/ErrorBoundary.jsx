import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel p-6 max-w-2xl space-y-3">
          <h2 className="text-base font-bold text-loss">Something broke on this page</h2>
          <p className="text-sm text-terminal-muted">
            The rest of the app still works — try another tab in the nav. If this keeps happening, the error message below tells me exactly what to fix:
          </p>
          <pre className="bg-terminal-bg rounded-xl p-3 text-xs font-mono overflow-auto whitespace-pre-wrap text-loss">
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-3 py-1.5 rounded-xl border border-terminal-border text-xs hover:border-accent/30"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
