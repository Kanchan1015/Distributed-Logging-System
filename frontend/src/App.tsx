import { FormEvent, useEffect, useMemo, useState } from "react";

type LogEntry = {
  id: string;
  message: string;
  timestamp: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8081";

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
}

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (first, second) =>
          new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()
      ),
    [logs]
  );

  async function loadLogs() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/logs`);

      if (!response.ok) {
        throw new Error(`Unable to load logs. Server returned ${response.status}.`);
      }

      const data = (await response.json()) as LogEntry[];
      setLogs(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load logs.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setError("Enter a log message before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Unable to create log. Server returned ${response.status}.`);
      }

      const createdLog = (await response.json()) as LogEntry;
      setLogs((currentLogs) => [createdLog, ...currentLogs]);
      setMessage("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create log.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Distributed Logging System</p>
        <h1>Log intake demo</h1>
        <p>
          Submit a log message, store it in MongoDB through the Spring Boot API, and
          review the saved entries from one simple screen.
        </p>
      </section>

      <section className="panel">
        <form className="log-form" onSubmit={createLog}>
          <label htmlFor="message">Log message</label>
          <div className="input-row">
            <input
              id="message"
              name="message"
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Example: Payment service started"
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send log"}
            </button>
          </div>
        </form>

        {error ? <div className="alert">{error}</div> : null}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Stored logs</h2>
            <p>{logs.length} entries found</p>
          </div>
          <button className="secondary-button" type="button" onClick={loadLogs} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading logs...</p>
        ) : sortedLogs.length === 0 ? (
          <p className="empty-state">No logs yet. Send one above to test the system.</p>
        ) : (
          <div className="log-list">
            {sortedLogs.map((log) => (
              <article className="log-item" key={log.id}>
                <p>{log.message}</p>
                <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
