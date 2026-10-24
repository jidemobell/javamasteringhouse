import type { Track } from '../../types';

import phase1Md from '../../../content/beacon/phase-1.md?raw';
import phase2Md from '../../../content/beacon/phase-2.md?raw';
import phase3Md from '../../../content/beacon/phase-3.md?raw';
import phase4Md from '../../../content/beacon/phase-4.md?raw';
import phase5Md from '../../../content/beacon/phase-5.md?raw';
import phase6Md from '../../../content/beacon/phase-6.md?raw';

// Track — Beacon: SRE Reliability Lab
// Builds one small Go service (relayd) then makes it measurable and provable:
// bounded concurrency and clean shutdown, SLIs from real histograms, the whole
// stack in Terraform, an SLO with an error budget, and incident artifacts.
//
// Deliberately NOT cloud-based: the Docker Terraform provider teaches identical
// concepts (state, plan/apply, drift, variables) with zero spend and no account.

export const beaconTrack: Track = {
  id: 'beacon',
  name: 'Beacon — SRE Reliability Lab',
  tagline:
    'Build a Go service, instrument it, put it in Terraform, give it an SLO — then break it on purpose and write the postmortem.',
  mode: 'phased',
  phases: [
    {
      id: 'phase-1',
      index: 1,
      title: 'A Go Service That Refuses to Guess',
      subtitle: 'Skeleton, config validation, error wrapping, handlers',
      difficulty: 'intermediate',
      concepts: [],
      overview: phase1Md,
      runInstructions: `\`\`\`bash
mkdir -p relayd && cd relayd
go mod init example.com/relayd
go get github.com/prometheus/client_golang/prometheus@latest

go run .
\`\`\`

> The service does not need Prometheus at Phase 1 — the module is added now so
> Phase 3 does not interrupt the flow. Go 1.21+ is assumed.`,
      tasks: [
        {
          id: 'load-config',
          title: 'Load and validate config at startup',
          concepts: [],
          brief: `
> 🧠 **Fail at deploy time, not at 3am.** Config read and validated in \`main\`
> means a typo in an environment variable kills the rollout, where it is cheap.
> The same typo read lazily inside a handler becomes an incident.

Implement \`LoadConfig\`. Rules:

- \`PORT\` defaults to \`8080\`; \`QUEUE_DEPTH\` to \`256\`; \`WORKERS\` to \`4\`;
  \`SHUTDOWN_GRACE\` to \`10s\`.
- A value that will not parse is an error **wrapped with \`%w\`**, naming the
  variable.
- A value that parses but is nonsense (\`QUEUE_DEPTH=0\` or negative) is a plain
  \`errors.New\` — it is a fact about your config, not a wrapped system error.

- ✅ Caller can do \`errors.Is(err, strconv.ErrSyntax)\` on a bad \`QUEUE_DEPTH\`
- ✅ \`QueueDepth < 1\` rejected before any listener starts
- ❌ \`mustInt()\` that panics — a panic in \`main\` is merely a worse log line
`,
          samples: [
            {
              filename: 'config.go',
              language: 'go',
              starter: `package main

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config is everything relayd reads from the environment at startup.
type Config struct {
	Port          string
	QueueDepth    int
	Workers       int
	ShutdownGrace time.Duration
}

// LoadConfig reads the environment and returns a validated Config.
//
// TODO: apply the defaults, then override from PORT, QUEUE_DEPTH, WORKERS
// and SHUTDOWN_GRACE.
// TODO: wrap parse failures with %w and name the offending variable.
// TODO: reject values that parse but are invalid.
func LoadConfig() (Config, error) {
	return Config{}, errors.New("not implemented")
}
`,
              reference: `package main

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port          string
	QueueDepth    int
	Workers       int
	ShutdownGrace time.Duration
}

func LoadConfig() (Config, error) {
	cfg := Config{
		Port:          "8080",
		QueueDepth:    256,
		Workers:       4,
		ShutdownGrace: 10 * time.Second,
	}

	if v := os.Getenv("PORT"); v != "" {
		cfg.Port = v
	}
	if v := os.Getenv("QUEUE_DEPTH"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil {
			return Config{}, fmt.Errorf("QUEUE_DEPTH=%q: %w", v, err)
		}
		cfg.QueueDepth = n
	}
	if v := os.Getenv("WORKERS"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil {
			return Config{}, fmt.Errorf("WORKERS=%q: %w", v, err)
		}
		cfg.Workers = n
	}
	if v := os.Getenv("SHUTDOWN_GRACE"); v != "" {
		d, err := time.ParseDuration(v)
		if err != nil {
			return Config{}, fmt.Errorf("SHUTDOWN_GRACE=%q: %w", v, err)
		}
		cfg.ShutdownGrace = d
	}

	// Parsed fine, but meaningless — a distinct class of error.
	if cfg.QueueDepth < 1 {
		return Config{}, errors.New("QUEUE_DEPTH must be >= 1")
	}
	if cfg.Workers < 1 {
		return Config{}, errors.New("WORKERS must be >= 1")
	}
	if cfg.ShutdownGrace <= 0 {
		return Config{}, errors.New("SHUTDOWN_GRACE must be > 0")
	}
	return cfg, nil
}
`,
            },
          ],
        },
        {
          id: 'ingest-handler',
          title: 'Validate, wrap, respond — never panic on a request path',
          concepts: [],
          brief: `
> 🧠 **A panic in a handler is a 500 with extra steps.** \`net/http\` recovers
> per-connection, so the process survives — but you lose the request, the log
> line, and any chance of telling the client what was wrong.

Implement \`handleIngest\`. It must:

1. Cap the body (\`http.MaxBytesReader\`, 1 MiB) — an unbounded \`io.ReadAll\` is a
   memory outage with a friendly name.
2. Decode into \`Event\`; on failure return **400** and log the wrapped error.
3. Validate \`Device\` and \`Metric\` are non-empty; return **400** if not.
4. Accept (\`202\`). Phase 2 adds the queue; for now just respond.

- ✅ \`fmt.Errorf("decode: %w", err)\` — the chain survives into the log
- ✅ A 400 never counts as an error outcome (Phase 3 depends on this)
- ❌ \`json.NewDecoder(r.Body).Decode(&ev)\` with the error ignored
`,
          samples: [
            {
              filename: 'handler.go',
              language: 'go',
              starter: `package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type Event struct {
	Device string  \`json:"device"\`
	Metric string  \`json:"metric"\`
	Value  float64 \`json:"value"\`
	TS     int64   \`json:"ts"\`
}

const maxBody = 1 << 20 // 1 MiB

// handleIngest validates an event and (from Phase 2) queues it.
//
// TODO: cap the body with http.MaxBytesReader.
// TODO: decode, wrapping the error with %w.
// TODO: reject missing Device or Metric with 400.
// TODO: accept with 202.
func handleIngest(w http.ResponseWriter, r *http.Request) {
	// your code
}
`,
              reference: `package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
)

type Event struct {
	Device string  \`json:"device"\`
	Metric string  \`json:"metric"\`
	Value  float64 \`json:"value"\`
	TS     int64   \`json:"ts"\`
}

const maxBody = 1 << 20

func handleIngest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxBody)

	var ev Event
	if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
		var tooBig *http.MaxBytesError
		if errors.As(err, &tooBig) {
			http.Error(w, "body too large", http.StatusRequestEntityTooLarge)
			return
		}
		log.Printf("ingest decode: %v", err) // wrapped, so the cause survives
		http.Error(w, "malformed event", http.StatusBadRequest)
		return
	}

	if ev.Device == "" || ev.Metric == "" {
		http.Error(w, "device and metric are required", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusAccepted)
}
`,
            },
          ],
        },
        {
          id: 'health-endpoints',
          title: 'Liveness and readiness are different questions',
          concepts: ['health-checks'],
          brief: `
> 🧠 **Liveness asks "restart me?"; readiness asks "send me traffic?"** Wiring a
> downstream dependency into liveness means one database blip restarts every
> replica simultaneously — turning a 30-second degradation into a multi-minute
> outage.

Implement both:

- \`/healthz\` — returns 200 while the process is running. **Checks nothing
  external.**
- \`/readyz\` — returns 200 only when the service is accepting work; 503 otherwise.

For now readiness reads an \`accepting\` flag. Phase 2 flips it during shutdown.

- ✅ \`/healthz\` stays 200 while the queue is saturated
- ✅ \`/readyz\` flips to 503 during shutdown
- ❌ One handler registered on both paths
`,
          samples: [
            {
              filename: 'health.go',
              language: 'go',
              starter: `package main

import "net/http"

// handleHealth is liveness: is the process able to run?
// TODO: return 200 with a tiny body. Do not check dependencies here.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	// your code
}

// handleReady is readiness: should traffic reach this instance right now?
// TODO: return 503 when the service is not accepting work.
func handleReady(w http.ResponseWriter, r *http.Request) {
	// your code
}
`,
              reference: `package main

import (
	"net/http"
	"sync/atomic"
)

// accepting is flipped to false at the start of shutdown.
var accepting atomic.Bool

func init() { accepting.Store(true) }

func handleHealth(w http.ResponseWriter, r *http.Request) {
	// Deliberately dependency-free: a wedged process fails this by not answering.
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func handleReady(w http.ResponseWriter, r *http.Request) {
	if !accepting.Load() {
		http.Error(w, "shutting down", http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ready"))
}
`,
            },
          ],
        },
      ],
    },

    {
      id: 'phase-2',
      index: 2,
      title: 'Concurrency You Can Stop',
      subtitle: 'Bounded workers, an explicit overload decision, graceful shutdown',
      difficulty: 'advanced',
      concepts: ['backpressure', 'go-context'],
      overview: phase2Md,
      runInstructions: `\`\`\`bash
# Load test with any HTTP bench tool; \`hey\` is convenient.
go install github.com/rakyll/hey@latest

go run . &
hey -n 5000 -c 50 -m POST -d '{"device":"pi-1","metric":"temp","value":21.4}' \\
  http://localhost:8080/ingest

# Then verify the drain: start load, send SIGTERM, watch for lost events.
kill -TERM %1
\`\`\``,
      tasks: [
        {
          id: 'worker-pool',
          title: 'A bounded worker pool',
          concepts: ['backpressure'],
          brief: `
> 🧠 **The buffered channel is the queue; the worker count is the throughput
> ceiling.** Both are config, not constants, because both are things you want to
> change under load without a rebuild.

Implement:

1. \`Queue\` holding \`chan Event\`, \`cfg.Workers\` goroutines, and a \`sync.WaitGroup\`.
2. Each worker ranges over the channel until it closes.
3. \`Stop()\` closes the channel and waits — **only call it when no producer can
   still send.**

- ✅ \`range q.events\` exits cleanly when the channel closes
- ✅ \`wg.Wait()\` in \`Stop\` so returning means "drained"
- ❌ \`close(q.events)\` while handlers may still send — that panics
`,
          samples: [
            {
              filename: 'queue.go',
              language: 'go',
              starter: `package main

import "sync"

type Queue struct {
	events chan Event
	wg     sync.WaitGroup
}

func NewQueue(depth, workers int) *Queue {
	q := &Queue{events: make(chan Event, depth)}
	q.wg.Add(workers)
	for i := 0; i < workers; i++ {
		go q.worker()
	}
	return q
}

// worker drains events until the channel is closed.
// TODO: range over q.events, defer q.wg.Done(), and process each event.
func (q *Queue) worker() {
	// your code
}

// Stop closes the channel and waits for in-flight work to finish.
// Safe only after producers have stopped.
func (q *Queue) Stop() {
	// your code
}
`,
              reference: `package main

import (
	"log"
	"sync"
	"sync/atomic"
)

type Queue struct {
	events    chan Event
	wg        sync.WaitGroup
	processed atomic.Int64
}

func NewQueue(depth, workers int) *Queue {
	q := &Queue{events: make(chan Event, depth)}
	q.wg.Add(workers)
	for i := 0; i < workers; i++ {
		go q.worker()
	}
	return q
}

func (q *Queue) worker() {
	defer q.wg.Done()
	for ev := range q.events {
		// Real work lives here. Kept trivial so failures come from the
		// infrastructure, not from this function.
		q.processed.Add(1)
		_ = ev
	}
}

func (q *Queue) Stop() {
	close(q.events)
	q.wg.Wait()
	log.Printf("queue drained, processed=%d", q.processed.Load())
}
`,
            },
          ],
        },
        {
          id: 'overload-decision',
          title: 'Decide what "full" means — reject, do not guess',
          concepts: ['backpressure'],
          brief: `
> 🧠 **Three choices when the queue is full: block, drop, or reject.** Blocking
> pushes latency onto the client and eventually takes the listener down. Dropping
> silently loses telemetry and looks healthy. Rejecting with \`503\` + \`Retry-After\`
> is honest and keeps the latency SLI meaningful.

Use a **non-blocking send** with \`select\`/\`default\`:

- Accepted → \`202\`
- Queue full → \`503\` with \`Retry-After: 1\`

Then write one sentence in a comment: *why this and not blocking?* That sentence
is the artifact.

- ✅ \`select { case ch <- ev: … default: … }\`
- ✅ The 503 response is fast — that is the point
- ❌ \`ch <- ev\` unconditionally, then wondering why p99 tracks queue depth
`,
          samples: [
            {
              filename: 'handler-queue.go',
              language: 'go',
              starter: `package main

import "net/http"

// enqueue places an event on the queue, or reports that it could not.
// TODO: non-blocking send with select/default.
// TODO: return false when the queue is full.
func (q *Queue) enqueue(ev Event) bool {
	return false
}

// respondAcceptedOrBusy writes the correct status for the outcome.
// TODO: 202 when queued, 503 + Retry-After when not.
func respondAcceptedOrBusy(w http.ResponseWriter, ok bool) {
	// your code
}
`,
              reference: `package main

import "net/http"

// enqueue never blocks the caller. Fast rejection keeps latency honest; blocking
// here would make p99 latency a function of queue depth, and a saturated queue
// would eventually stop the listener accepting connections at all.
func (q *Queue) enqueue(ev Event) bool {
	select {
	case q.events <- ev:
		return true
	default:
		return false
	}
}

func respondAcceptedOrBusy(w http.ResponseWriter, ok bool) {
	if !ok {
		w.Header().Set("Retry-After", "1")
		http.Error(w, "queue full", http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusAccepted)
}
`,
            },
          ],
        },
        {
          id: 'graceful-shutdown',
          title: 'SIGTERM must drain, not truncate',
          concepts: ['go-context'],
          brief: `
> 🧠 **Ordering is the whole lesson.** Stop accepting → drain in-flight requests →
> close the queue → wait for workers. Close the queue first and a live producer
> panics. Skip the wait and the process exits mid-write.

Wire it with \`signal.NotifyContext\`:

1. \`ctx, stop := signal.NotifyContext(...SIGTERM, os.Interrupt)\`
2. Run \`srv.ListenAndServe()\` in a goroutine.
3. On \`<-ctx.Done()\`: flip \`accepting\` to false (readiness fails), then
   \`srv.Shutdown(shutCtx)\` with \`cfg.ShutdownGrace\`.
4. Only then \`queue.Stop()\`.

- ✅ \`/readyz\` returns 503 immediately after the signal
- ✅ Exit code 0 on a clean drain
- ❌ \`os.Exit(0)\` in the signal handler — no deferred work runs at all
`,
          samples: [
            {
              filename: 'main.go',
              language: 'go',
              starter: `package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	queue := NewQueue(cfg.QueueDepth, cfg.Workers)
	mux := http.NewServeMux()
	mux.HandleFunc("/ingest", handleIngest)
	mux.HandleFunc("/healthz", handleHealth)
	mux.HandleFunc("/readyz", handleReady)

	srv := &http.Server{Addr: ":" + cfg.Port, Handler: mux}

	// TODO: signal.NotifyContext for SIGTERM + os.Interrupt.
	// TODO: run ListenAndServe in a goroutine.
	// TODO: on signal — flip accepting, srv.Shutdown with grace, queue.Stop().

	_ = context.Background()
	_ = errors.Is
	_ = time.Second
	_ = os.Interrupt
	_ = syscall.SIGTERM
}
`,
              reference: `package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	queue := NewQueue(cfg.QueueDepth, cfg.Workers)
	mux := http.NewServeMux()
	mux.HandleFunc("/ingest", handleIngest)
	mux.HandleFunc("/healthz", handleHealth)
	mux.HandleFunc("/readyz", handleReady)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, os.Interrupt)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()
	log.Printf("relayd listening on :%s", cfg.Port)

	select {
	case err := <-errCh:
		log.Fatalf("listen: %v", err)
	case <-ctx.Done():
	}

	// 1. Fail readiness so the load balancer stops sending new work.
	accepting.Store(false)

	// 2. Let in-flight requests finish, bounded by the grace period.
	shutCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownGrace)
	defer cancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}

	// 3. Safe now: no handler can send on the channel.
	queue.Stop()
	log.Print("relayd stopped cleanly")
}
`,
            },
          ],
        },
      ],
    },

    {
      id: 'phase-3',
      index: 3,
      title: 'Make the Service Observable',
      subtitle: 'Outcome counters, latency histograms, the two SLIs',
      difficulty: 'intermediate',
      concepts: ['sli-slo-sla'],
      overview: phase3Md,
      runInstructions: `\`\`\`bash
go get github.com/prometheus/client_golang/prometheus/promhttp

go run . &
curl -s localhost:8080/metrics | grep relayd_
\`\`\`

> Add \`/metrics\` via \`promhttp.Handler()\`. In Phase 4 Prometheus scrapes this
> endpoint from the same Docker network.`,
      tasks: [
        {
          id: 'outcome-counter',
          title: 'Count outcomes, not errors',
          concepts: ['sli-slo-sla'],
          brief: `
> 🧠 **Label the outcome of every request, including the good ones.** A counter
> that only fires on errors cannot produce a ratio, and a ratio is the only thing
> an SLI can be.

Create \`relayd_ingest_requests_total\` as a \`CounterVec\` with an \`outcome\` label:
\`accepted\`, \`rejected\`, \`invalid\`, \`error\`.

Then wire it so:

- \`202\` → \`accepted\`
- \`503\` (queue full) → \`rejected\`
- \`400\` (malformed) → \`invalid\`
- \`500\` → \`error\`

- ✅ \`invalid\` is separate from \`error\` — client mistakes must not spend your budget
- ✅ Labels are a closed set; no device IDs
- ❌ \`outcome\` built from the error message (unbounded cardinality)
`,
          samples: [
            {
              filename: 'metrics.go',
              language: 'go',
              starter: `package main

import "github.com/prometheus/client_golang/prometheus"

var ingestTotal = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "relayd_ingest_requests_total",
		Help: "Ingest requests by outcome.",
	},
	[]string{"outcome"},
)

func init() {
	prometheus.MustRegister(ingestTotal)
}

// Outcome label values. Keep them a closed set.
const (
	outcomeAccepted = "accepted"
	outcomeRejected = "rejected"
	outcomeInvalid  = "invalid"
	outcomeError    = "error"
)

// TODO: increment ingestTotal for each outcome at the right place in the
// handler. There is no single correct location — the point is that every
// return path increments exactly one outcome.
`,
              reference: `package main

import "github.com/prometheus/client_golang/prometheus"

var ingestTotal = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "relayd_ingest_requests_total",
		Help: "Ingest requests by outcome.",
	},
	[]string{"outcome"},
)

func init() {
	prometheus.MustRegister(ingestTotal)
}

const (
	outcomeAccepted = "accepted"
	outcomeRejected = "rejected"
	outcomeInvalid  = "invalid"
	outcomeError    = "error"
)

// count records the outcome of one request. Called from every return path.
func count(outcome string) {
	ingestTotal.WithLabelValues(outcome).Inc()
}

// Usage inside the handler:
//
//	if err := decode(...); err != nil {
//	    count(outcomeInvalid)          // client's fault — not your budget
//	    http.Error(w, "malformed event", http.StatusBadRequest)
//	    return
//	}
//	if !queue.enqueue(ev) {
//	    count(outcomeRejected)         // your capacity limit
//	    w.Header().Set("Retry-After", "1")
//	    http.Error(w, "queue full", http.StatusServiceUnavailable)
//	    return
//	}
//	count(outcomeAccepted)
//	w.WriteHeader(http.StatusAccepted)
`,
            },
          ],
        },
        {
          id: 'latency-histogram',
          title: 'A histogram, not an average',
          concepts: ['sli-slo-sla'],
          brief: `
> 🧠 **Averages hide outages.** 1% of requests taking 5s and 99% taking 20ms
> averages to 70ms — a number that describes nobody's experience. A histogram lets
> you ask *"what fraction were under 250ms?"*, which is the latency SLI.

Add \`relayd_ingest_duration_seconds\` with buckets suited to this service:
\`0.05, 0.1, 0.25, 0.5, 1, 2.5\`.

Then time the handler with \`defer\` **at the top**, so every return path is
measured — including the errors.

- ✅ \`defer observe(time.Since(start))\` before any early return
- ✅ Buckets bracket your real latency (a 40ms service needs no 60s bucket)
- ❌ \`time.Since(start)\` at the end only — you measure success, not reality
`,
          samples: [
            {
              filename: 'latency.go',
              language: 'go',
              starter: `package main

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var ingestDuration = prometheus.NewHistogramVec(
	prometheus.HistogramOpts{
		Name:    "relayd_ingest_duration_seconds",
		Help:    "Ingest handler latency.",
		Buckets: []float64{0.05, 0.1, 0.25, 0.5, 1, 2.5},
	},
	[]string{"route"},
)

func init() {
	prometheus.MustRegister(ingestDuration)
}

// instrument wraps a handler and records its duration for every return path.
func instrument(route string, next http.HandlerFunc) http.HandlerFunc {
	// your code
	return next
}
`,
              reference: `package main

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var ingestDuration = prometheus.NewHistogramVec(
	prometheus.HistogramOpts{
		Name:    "relayd_ingest_duration_seconds",
		Help:    "Ingest handler latency.",
		Buckets: []float64{0.05, 0.1, 0.25, 0.5, 1, 2.5},
	},
	[]string{"route"},
)

func init() {
	prometheus.MustRegister(ingestDuration)
}

func instrument(route string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		// defer, not a trailing call: early returns are exactly the slow paths.
		defer func() {
			ingestDuration.WithLabelValues(route).Observe(time.Since(start).Seconds())
		}()
		next(w, r)
	}
}
`,
            },
          ],
        },
        {
          id: 'queue-gauge',
          title: 'Queue depth as a gauge — the leading indicator',
          concepts: ['backpressure'],
          brief: `
> 🧠 **Counters tell you what happened; gauges tell you what is about to.** Queue
> depth rises before requests start failing, which makes it the number you watch
> during an incident.

Add \`relayd_queue_depth\` as a \`Gauge\`, set after every enqueue and every
dequeue. Expose \`/metrics\` via \`promhttp\`.

Then answer: with \`QUEUE_DEPTH=256\` and \`WORKERS=4\`, what does a rising gauge
tell you that a falling \`accepted\` rate does not?

- ✅ \`len(q.events)\` is safe alongside concurrent send/receive — a snapshot
- ✅ A gauge reflects *current* state; never \`Add\` forever
- ❌ A gauge that only ever increments (a counter wearing a gauge's name)
`,
          samples: [
            {
              filename: 'gauge.go',
              language: 'go',
              starter: `package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var queueDepth = prometheus.NewGauge(prometheus.GaugeOpts{
	Name: "relayd_queue_depth",
	Help: "Events currently waiting in the queue.",
})

func init() {
	prometheus.MustRegister(queueDepth)
}

// recordDepth is called after every enqueue and every dequeue.
func (q *Queue) recordDepth() {
	// your code
}

// metricsHandler exposes the registry.
func metricsHandler() http.Handler {
	// your code
	return promhttp.Handler()
}
`,
              reference: `package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var queueDepth = prometheus.NewGauge(prometheus.GaugeOpts{
	Name: "relayd_queue_depth",
	Help: "Events currently waiting in the queue.",
})

func init() {
	prometheus.MustRegister(queueDepth)
}

// recordDepth snapshots the buffered channel. len() on a channel is safe
// alongside concurrent sends and receives; it is a snapshot, not a lock.
func (q *Queue) recordDepth() {
	queueDepth.Set(float64(len(q.events)))
}

func metricsHandler() http.Handler {
	return promhttp.Handler()
}

// Queue depth rising while throughput is flat means workers cannot keep up —
// you are about to start rejecting. That is the warning the failure counters
// cannot give you, because they only move once it is already too late.
`,
            },
          ],
        },
      ],
    },

    {
      id: 'phase-4',
      index: 4,
      title: 'Terraform the Whole Stack',
      subtitle: 'Docker provider, state, variables, and drift you cause on purpose',
      difficulty: 'mid',
      concepts: ['terraform-state'],
      overview: phase4Md,
      runInstructions: `\`\`\`bash
mkdir -p infra && cd infra

# The Docker provider talks to your local daemon — no cloud account, no spend.
terraform init
terraform plan  -var="env=dev"
terraform apply -var="env=dev"
terraform destroy -var="env=dev"
\`\`\`

> Add \`*.tfstate*\` and \`.terraform/\` to \`.gitignore\` **before** the first
> apply. State can contain secrets in other providers; build the habit now.`,
      tasks: [
        {
          id: 'first-apply',
          title: 'Network, image, container — in that order',
          concepts: ['terraform-state'],
          brief: `
> 🧠 **Resources reference each other, and Terraform derives the order.** You do
> not sequence anything by hand; \`docker_container.relayd\` referring to
> \`docker_network.relay.name\` *is* the dependency declaration.

Write the provider block, a network, an image and a container:

- Network name: \`\${var.env}-relay\`
- Container: \`\${var.env}-relayd\`, port 8080 mapped to \`var.host_port\`
- Config passed as \`env\`, **not** baked into the image

- ✅ \`terraform plan\` shows create order: network → image → container
- ✅ \`env=dev\` then \`env=staging\` gives two isolated stacks
- ❌ \`depends_on\` everywhere — references already express the order
`,
          samples: [
            {
              filename: 'main.tf',
              language: 'hcl',
              starter: `terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# TODO: network named "\${var.env}-relay"
# TODO: image from var.image / var.tag
# TODO: container "\${var.env}-relayd" on that network, port 8080 -> var.host_port
# TODO: pass QUEUE_DEPTH and SHUTDOWN_GRACE via env
`,
              reference: `terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "relay" {
  name = "\${var.env}-relay"
}

resource "docker_image" "relayd" {
  name = "\${var.image}:\${var.tag}"
}

resource "docker_container" "relayd" {
  name  = "\${var.env}-relayd"
  image = docker_image.relayd.image_id

  networks_advanced {
    name = docker_network.relay.name
  }

  ports {
    internal = 8080
    external = var.host_port
  }

  # Runtime config lives here, not in the image, so one image serves every env.
  env = [
    "QUEUE_DEPTH=\${var.queue_depth}",
    "WORKERS=\${var.workers}",
    "SHUTDOWN_GRACE=10s",
  ]

  restart = "unless-stopped"
}
`,
            },
          ],
        },
        {
          id: 'variables-outputs',
          title: 'Variables in, outputs out',
          concepts: ['terraform-state'],
          brief: `
> 🧠 **Variables are the parameter list; outputs are the return values.** A module
> with hardcoded names cannot run twice, which means it cannot run in staging.

Declare:

| Variable | Type | Default |
|---|---|---|
| \`env\` | string | *none — required* |
| \`image\` | string | \`"relayd"\` |
| \`tag\` | string | \`"latest"\` |
| \`host_port\` | number | \`8080\` |
| \`queue_depth\` | number | \`256\` |
| \`workers\` | number | \`4\` |

Output the container name and the ingest URL.

- ✅ \`env\` has no default — an unnamed environment should be a hard error
- ✅ \`host_port\` is a number, not a string
- ❌ A default for \`env\`, which quietly deploys to \`"dev"\` twice
`,
          samples: [
            {
              filename: 'variables.tf',
              language: 'hcl',
              starter: `# TODO: declare the variables in the brief's table.
# env must be required.

variable "env" {}

variable "image" {
  type    = string
  default = "relayd"
}

# TODO: tag, host_port, queue_depth, workers

output "container" {
  value = docker_container.relayd.name
}

# TODO: output the ingest URL
`,
              reference: `variable "env" {
  type        = string
  description = "Environment name, e.g. dev or staging."
  # No default on purpose: an unnamed environment is a mistake.
  validation {
    condition     = length(var.env) > 0 && length(var.env) <= 16
    error_message = "env must be 1-16 characters."
  }
}

variable "image" {
  type    = string
  default = "relayd"
}

variable "tag" {
  type    = string
  default = "latest"
}

variable "host_port" {
  type    = number
  default = 8080
}

variable "queue_depth" {
  type    = number
  default = 256
}

variable "workers" {
  type    = number
  default = 4
}

output "container" {
  value       = docker_container.relayd.name
  description = "Container name for docker logs / exec."
}

output "ingest_url" {
  value       = "http://localhost:\${var.host_port}/ingest"
  description = "POST events here."
}
`,
            },
          ],
        },
        {
          id: 'drift-exercise',
          title: 'Cause drift, then read the plan',
          concepts: ['terraform-state'],
          brief: `
> 🧠 **Terraform compares your files to its state, not to the world.** That is why
> it is fast, why it can be wrong after a manual change, and why \`plan\` is the
> review step that actually matters.

Run the sequence and record what you see:

1. \`terraform apply\` — note the container name.
2. \`docker rm -f dev-relayd\` — the "quick fix" a colleague makes at 2am.
3. \`terraform plan\` — it proposes to create the container again.

Then write, in the editor:

- What Terraform compared, precisely
- Why \`plan\` said "create" rather than "replace"
- The one thing you would add to CI to catch this before an incident

- ✅ You can explain state vs reality without hand-waving
- ❌ "Terraform checks what is actually running" — it does not
`,
          samples: [
            {
              filename: 'drift-notes.md',
              language: 'markdown',
              starter: `# The Drift Exercise

## What I did

\`\`\`bash
terraform apply -var="env=dev"
docker rm -f dev-relayd
terraform plan -var="env=dev"
\`\`\`

## What plan proposed

(create / update / replace — and which resource)

## What Terraform actually compared

(it compared ... against ...)

## Why "create" and not "replace"

## What I would add to CI

`,
              reference: `# The Drift Exercise

## What I did

\`\`\`bash
terraform apply -var="env=dev"
docker rm -f dev-relayd
terraform plan -var="env=dev"
\`\`\`

## What plan proposed

\`# docker_container.relayd will be created\` — one resource, no changes to
network or image.

## What Terraform actually compared

My \`.tf\` files against \`terraform.tfstate\`. State still recorded the container
as existing with its old ID; the plan refresh found it gone, so the recorded
desired state no longer matched reality and Terraform queued a create.

## Why "create" and not "replace"

"Replace" is destroy-then-create, used when an attribute that forces replacement
changes (a name, an immutable field). Here nothing about the desired resource
changed — only its existence. Terraform was reconciling a missing object, not a
changed one.

## What I would add to CI

\`terraform plan -detailed-exitcode\` on a schedule, failing on exit code 2. That
turns undetected drift into a build failure instead of a 2am surprise.
`,
            },
          ],
        },
      ],
    },

    {
      id: 'phase-5',
      index: 5,
      title: 'SLOs and the Error Budget',
      subtitle: 'Write the SLO, compute the budget, then query it in PromQL',
      difficulty: 'advanced',
      concepts: ['sli-slo-sla', 'error-budgets'],
      overview: phase5Md,
      runInstructions: `\`\`\`bash
# Prometheus in front of relayd — add to the Terraform stack or run ad hoc.
docker run -d --name prometheus --network dev-relay \\
  -p 9090:9090 \\
  -v "$PWD/prometheus.yml:/etc/prometheus/prometheus.yml" \\
  prom/prometheus
\`\`\`

> Scrape target inside the Docker network is \`dev-relayd:8080\`.`,
      tasks: [
        {
          id: 'slo-document',
          title: 'Write the SLO before touching PromQL',
          concepts: ['sli-slo-sla', 'error-budgets'],
          brief: `
> 🧠 **If you cannot write the SLO in prose, the query will encode a mistake.**
> The document forces the three decisions: what counts as good, what window, and
> what is excluded.

Fill in the template. Be specific about exclusions — this is where most SLOs go
wrong.

- ✅ Availability target chosen *below* measured performance, not above ambition
- ✅ Malformed client requests explicitly excluded from the denominator
- ❌ "99.9% uptime" with no window and no definition of uptime
`,
          samples: [
            {
              filename: 'slo.md',
              language: 'markdown',
              starter: `# relayd — Service Level Objectives

## SLI 1 — Availability

- Definition: 
- Good event: 
- Valid event: 
- Excluded: 

## SLI 2 — Latency

- Definition: 
- Threshold: 
- Good event: 

## Objectives

| SLI | Target | Window |
|---|---|---|
| Availability | | |
| Latency | | |

## Error budget

- Budget: 
- In minutes over the window: 
- Policy when exhausted: 
`,
              reference: `# relayd — Service Level Objectives

## SLI 1 — Availability

- Definition: proportion of ingest requests that were accepted, out of all
  valid ingest requests.
- Good event: HTTP 202 (queued for processing).
- Valid event: any request with a well-formed body and required fields.
- Excluded: 400s from malformed input or missing fields. A client that posts
  garbage is not relayd being unavailable — and counting it would let any
  sender spend our error budget.

## SLI 2 — Latency

- Definition: proportion of ingest requests served faster than 250ms.
- Threshold: 250ms (measured, not aspirational — p95 sits near 40ms).
- Good event: \`relayd_ingest_duration_seconds\` in buckets at or below 0.25.

## Objectives

| SLI | Target | Window |
|---|---|---|
| Availability | 99.5% | 28 days |
| Latency (at or under 250ms) | 99.0% | 28 days |

## Error budget

- Budget: 0.5% of valid requests.
- In minutes over the window: 28 × 24 × 60 × 0.005 ≈ 201 min ≈ 3h 22m.
- Policy when exhausted: no feature deploys until the 28-day ratio is back at or
  above target; reliability work takes priority. Planned maintenance is spent
  from this budget, not excused from it.
`,
            },
          ],
        },
        {
          id: 'recording-rules',
          title: 'Recording rules: compute the ratio once',
          concepts: ['sli-slo-sla', 'error-budgets'],
          brief: `
> 🧠 **Never query raw counters at 3am.** Recording rules precompute the ratio, so
> a dashboard and an alert read the *same* number — and cannot disagree.

Write three rules:

1. \`relayd:sli_availability:ratio_28d\` — the SLO judgement window
2. \`relayd:sli_availability:ratio_1h\` — fast enough to alert on
3. \`relayd:error_budget:remaining_ratio\` — \`1 - (1 - ratio) / (1 - target)\`

Use \`sum(rate(...)) / sum(rate(...))\`, with \`accepted\` over
\`accepted|rejected|error\` (never \`invalid\`).

- ✅ One expression shape, reused at different windows
- ✅ Budget ratio: 1.0 = full, 0 = exhausted, below 0 = breached
- ❌ \`avg_over_time(up[28d])\` — \`up\` is scrape success, not user experience
`,
          samples: [
            {
              filename: 'rules.yml',
              language: 'yaml',
              starter: `groups:
  - name: relayd-slo
    interval: 30s
    rules:
      # TODO: 28d availability ratio
      - record: relayd:sli_availability:ratio_28d
        expr: |

      # TODO: 1h availability ratio (same shape, shorter window)
      - record: relayd:sli_availability:ratio_1h
        expr: |

      # TODO: remaining error budget as a ratio
      - record: relayd:error_budget:remaining_ratio
        expr: |
`,
              reference: `groups:
  - name: relayd-slo
    interval: 30s
    rules:
      - record: relayd:sli_availability:ratio_28d
        expr: |
          sum(rate(relayd_ingest_requests_total{outcome="accepted"}[28d]))
          /
          sum(rate(relayd_ingest_requests_total{outcome=~"accepted|rejected|error"}[28d]))

      - record: relayd:sli_availability:ratio_1h
        expr: |
          sum(rate(relayd_ingest_requests_total{outcome="accepted"}[1h]))
          /
          sum(rate(relayd_ingest_requests_total{outcome=~"accepted|rejected|error"}[1h]))

      - record: relayd:error_budget:remaining_ratio
        expr: |
          1 - (
            (1 - relayd:sli_availability:ratio_28d) / (1 - 0.995)
          )
`,
            },
          ],
        },
        {
          id: 'promql-practice',
          title: 'Query the latency SLI by hand',
          concepts: ['sli-slo-sla'],
          brief: `
> 🧠 **The fraction-under-threshold form is the honest latency SLI** — it answers
> "what share of users got a fast response?" rather than smoothing everyone into
> an average.

Write two queries:

1. **Fraction under 250ms** over 5 minutes — sum the rate of the \`le="0.25"\`
   bucket and divide by \`le="+Inf"\`.
2. **p95 latency** over 5 minutes — this one uses \`histogram_quantile(0.95, ...)\`.

Then state, in a comment, which one belongs in your SLO and why.

- ✅ \`sum(rate(...{le="0.25"}[5m])) / sum(rate(...{le="+Inf"}[5m]))\`
- ✅ Unit suffix in the metric name makes the query readable
- ❌ \`avg(relayd_ingest_duration_seconds)\` — a summary statistic over nothing
`,
          samples: [
            {
              filename: 'queries.promql',
              language: 'promql',
              starter: `# 1. Fraction of requests under 250ms, last 5m
# TODO


# 2. p95 latency, last 5m
# TODO


# Which belongs in the SLO, and why?
# TODO
`,
              reference: `# 1. Fraction of requests under 250ms, last 5m
sum(rate(relayd_ingest_duration_seconds_bucket{route="/ingest",le="0.25"}[5m]))
/
sum(rate(relayd_ingest_duration_seconds_bucket{route="/ingest",le="+Inf"}[5m]))

# 2. p95 latency, last 5m
histogram_quantile(
  0.95,
  sum(rate(relayd_ingest_duration_seconds_bucket{route="/ingest"}[5m])) by (le)
)

# Which belongs in the SLO, and why?
# The fraction-under form. It is a ratio of good events to valid events — the
# same shape as the availability SLI, so both share one budget model and one
# burn-rate formula. A p95 is a percentile of a distribution, not a share of
# users, and it cannot be multiplied into an error budget.
`,
            },
          ],
        },
      ],
    },

    {
      id: 'phase-6',
      index: 6,
      title: 'Break It on Purpose',
      subtitle: 'Burn-rate alerts, a runbook, a postmortem, a budget policy',
      difficulty: 'advanced',
      concepts: ['burn-rate-alerts', 'error-budgets'],
      overview: phase6Md,
      runInstructions: `\`\`\`bash
# Watch the two burn-rate alerts while you inject faults.
curl -s localhost:9090/api/v1/alerts | jq '.data.alerts[].labels'

# Fault 1 — the container dies
docker kill dev-relayd

# Fault 2 — saturate the queue
hey -n 20000 -c 200 -m POST -d '{"device":"pi-1","metric":"temp","value":21.4}' \\
  http://localhost:8080/ingest

# Fault 3 — degrade latency: add time.Sleep(400 * time.Millisecond)
# in the ingest handler, rebuild the image, then terraform apply.
\`\`\``,
      tasks: [
        {
          id: 'burn-rate-alerts',
          title: 'Two alerts, two audiences',
          concepts: ['burn-rate-alerts'],
          brief: `
> 🧠 **One window cannot be both fast and quiet.** A 5-minute window reacts in
> minutes and cries wolf. Pair a long window (is it material?) with a short one
> (is it happening now?) and require both.

Write:

- **Fast burn** — \`14.4x\` budget rate over 1h **and** 5m, \`for: 2m\`, severity
  \`page\`
- **Slow burn** — \`6x\` over 6h **and** 30m, severity \`ticket\`

Both link to a \`runbook\` annotation. An alert without one is a question with no
answer.

- ✅ \`(1 - ratio) > (14.4 * 0.005)\` — burn rate as a multiple of the budget
- ✅ Two severities, so a slow leak does not wake anyone
- ❌ \`up == 0\` as your SLO alert — that measures the scraper, not the service
`,
          samples: [
            {
              filename: 'alerts.yml',
              language: 'yaml',
              starter: `groups:
  - name: relayd-burn
    rules:
      # TODO fast burn: 14.4x over 1h, confirmed on 5m, for: 2m, severity page
      - alert: RelaydAvailabilityFastBurn
        expr: |

        labels:
          severity: page

      # TODO slow burn: 6x over 6h, confirmed on 30m, severity ticket
      - alert: RelaydAvailabilitySlowBurn
        expr: |

        labels:
          severity: ticket
`,
              reference: `groups:
  - name: relayd-burn
    rules:
      # 14.4x burn exhausts a 30-day budget in about 2 days. Page on this.
      - alert: RelaydAvailabilityFastBurn
        expr: |
          (1 - relayd:sli_availability:ratio_1h) > (14.4 * 0.005)
          and
          (1 - relayd:sli_availability:ratio_5m) > (14.4 * 0.005)
        for: 2m
        labels:
          severity: page
        annotations:
          summary: "relayd burning error budget 14x too fast"
          description: "1h and 5m windows both over budget. Check /readyz, queue depth, and recent deploys."
          runbook: "runbooks/relayd-availability.md"

      # 6x burn is a slow leak: material over days, not minutes. Ticket.
      - alert: RelaydAvailabilitySlowBurn
        expr: |
          (1 - relayd:sli_availability:ratio_6h) > (6 * 0.005)
          and
          (1 - relayd:sli_availability:ratio_30m) > (6 * 0.005)
        for: 15m
        labels:
          severity: ticket
        annotations:
          summary: "relayd error budget draining steadily"
          runbook: "runbooks/relayd-availability.md"
`,
            },
          ],
        },
        {
          id: 'runbook',
          title: 'A runbook for someone who has never seen this service',
          concepts: ['burn-rate-alerts'],
          brief: `
> 🧠 **The runbook is written for the person you will be at 3am** — tired, on a
> laptop, with no memory of how this works. Structure beats prose: symptom, first
> check, likely cause, action, escalation.

Write it for the fast-burn alert. Include the exact commands you actually ran
during the injection, and what each output means.

- ✅ Every command is copy-pasteable and read-only first
- ✅ "If X, do Y" — not "investigate the queue"
- ❌ A runbook that assumes the reader knows which dashboard to open
`,
          samples: [
            {
              filename: 'runbook-availability.md',
              language: 'markdown',
              starter: `# Runbook — relayd availability (fast burn)

## Symptom


## First checks (read-only)

\`\`\`bash
# 1. Is the process up and ready?

# 2. What is the queue doing?

# 3. What do the outcomes look like?

\`\`\`

## Likely causes

| Signal | Cause | Action |
|---|---|---|
| | | |

## Escalation

`,
              reference: `# Runbook — relayd availability (fast burn)

## Symptom

\`RelaydAvailabilityFastBurn\` is firing: availability is burning at more than 14x
the SLO budget rate on both the 1h and 5m windows.

## First checks (read-only)

\`\`\`bash
# 1. Is the process up and ready? 200/200 is healthy.
curl -s -o /dev/null -w '%{http_code}\\n' localhost:8080/healthz
curl -s -o /dev/null -w '%{http_code}\\n' localhost:8080/readyz

# 2. Queue depth — near QUEUE_DEPTH means workers are the bottleneck.
curl -s localhost:8080/metrics | grep relayd_queue_depth

# 3. Outcome mix over 5m. Mostly "rejected" = capacity. Mostly "error" = bug.
curl -s localhost:8080/metrics | grep relayd_ingest_requests_total

# 4. Did a deploy just happen?
docker inspect dev-relayd --format '{{.Created}}'
\`\`\`

## Likely causes

| Signal | Cause | Action |
|---|---|---|
| \`readyz\` = 503 | Shutting down, crashed, or wedged | \`docker logs dev-relayd --tail 50\`; restart via \`terraform apply\` — never \`docker run\` by hand |
| \`queue_depth\` pinned at max | Workers cannot keep up | Raise \`WORKERS\` in Terraform, \`terraform apply\` |
| Mostly \`rejected\` | Genuine overload or a retry storm | Check for a client retrying without backoff |
| Mostly \`error\` (500) | Bug or dependency fault | Roll back to the previous image tag; capture the wrapped error from logs |
| Metric missing entirely | Scrape failed, not an outage | Check Prometheus targets before paging anyone else |

## Escalation

If availability is still burning after the first two actions, roll back to the
previous image tag and page the on-call owner. Rolling back is always allowed;
investigating in production is not.
`,
            },
          ],
        },
        {
          id: 'postmortem',
          title: 'A blameless postmortem with a timeline',
          concepts: ['error-budgets', 'burn-rate-alerts'],
          brief: `
> 🧠 **"Human error" is not a cause — it is where the analysis starts.** A person
> made a reasonable decision given what the system showed them. The fix belongs in
> the system: the guardrail, the alert, the default.

Document the fault you injected (suggested: kill the container during load).
Include:

- Timeline with timestamps — detection time matters more than the trigger
- Contributing factors — plural, never one
- What went **well** (not decoration; it shows what to keep)
- Action items with owners

- ✅ "Detection took 3m because the fast-burn alert needed a 2m \`for:\`"
- ❌ "Root cause: I killed the container"
`,
          samples: [
            {
              filename: 'postmortem.md',
              language: 'markdown',
              starter: `# Postmortem — relayd availability, <date>

**Severity:** <page | ticket>
**Duration:** <detection-to-recovery>
**Budget consumed:** <% of the 28-day allowance>

## Summary


## Timeline

| Time | Event |
|---|---|
| | |

## Contributing factors

1. 

## What went well


## What went badly


## Action items

| Action | Owner | Due |
|---|---|---|
| | | |
`,
              reference: `# Postmortem — relayd availability, 2026-10-24

**Severity:** page
**Duration:** about 6 minutes from injection to recovery
**Budget consumed:** about 0.6% of the 28-day allowance (one 6-minute outage)

## Summary

During a deliberate fault-injection session the relayd container was killed
mid-load. Readiness failed within one scrape interval, the fast-burn alert paged
after 2 minutes, and the container was recreated from Terraform. Buffered events
in the queue at the moment of the kill were lost — expected for an in-memory
queue, but previously undocumented.

## Timeline

| Time | Event |
|---|---|
| 14:02:10 | Container killed (\`docker kill\`) during 50-concurrency load |
| 14:02:11 | In-flight requests reset; \`/readyz\` unreachable |
| 14:02:30 | Prometheus scrape fails — target marked down |
| 14:03:10 | Fast-burn condition true on the 5m window |
| 14:04:10 | Alert fires (\`for: 2m\`) |
| 14:04:40 | On-call confirms \`/readyz\` 503; \`docker ps\` shows no container |
| 14:05:20 | \`terraform apply\` recreates the container; readiness returns 200 |
| 14:08:00 | Availability ratio recovers above threshold |

## Contributing factors

1. **In-memory queue.** Buffered events are lost on process death. A known design
   choice, but not written where an operator would find it.
2. **Detection lag dominated duration.** Real unavailability was about 10 seconds;
   the incident was 6 minutes, of which 2 were the alert's \`for:\` window.
3. **Restart policy did not cover an explicit kill.** \`unless-stopped\` restarts
   on daemon restart, not on an operator-initiated kill — correct, but undocumented.

## What went well

- Readiness failed immediately, so no traffic was sent to a dead process.
- The runbook's first two checks identified the cause; no dashboard archaeology.
- Recovery was a \`terraform apply\`, so state and reality ended consistent.

## What went badly

- A 2-minute \`for:\` is most of the detection budget for an outright outage.
- Nobody had written down that the queue is in-memory.

## Action items

| Action | Owner | Due |
|---|---|---|
| Document the in-memory queue's data-loss window in the runbook | me | done |
| Add a \`RelaydTargetDown\` alert at \`for: 30s\` for outright unavailability | me | this week |
| Consider a disk-backed queue as a Phase 7 candidate | me | backlog |
`,
            },
          ],
        },
        {
          id: 'budget-policy',
          title: 'The error-budget policy — the thing that makes the SLO real',
          concepts: ['error-budgets'],
          brief: `
> 🧠 **Without a policy, the SLO is a dashboard.** The policy is the pre-agreed
> consequence of spending the budget, decided while everyone is calm — so it is
> not negotiated mid-incident.

Write the policy at three thresholds: **75%**, **100%**, **above 100%**. State
exactly what changes, who decides, and how the service gets back inside target.

- ✅ "At 100%, feature deploys stop until the 28-day ratio is at or above 99.5%"
- ✅ Exceptions named in advance, not discovered mid-incident
- ❌ "We will review the budget monthly" — that is a meeting, not a policy
`,
          samples: [
            {
              filename: 'error-budget-policy.md',
              language: 'markdown',
              starter: `# relayd — Error-budget policy

**SLO:** 99.5% availability over 28 days. **Budget:** 0.5% ≈ 3h 22m.

## At 75% consumed


## At 100% consumed


## Above 100% (breached)


## Exceptions


## Who decides

`,
              reference: `# relayd — Error-budget policy

**SLO:** 99.5% availability over 28 days. **Budget:** 0.5% ≈ 3h 22m.

## At 75% consumed

Reliability review the next working day. No automatic change — but the next
change to relayd ships with a rollback plan written before the deploy, and queue
depth joins the daily check.

## At 100% consumed

**Feature work on relayd stops.** Only changes that directly improve reliability
are permitted: capacity, alerting, failure handling, tests. The budget is
reviewed weekly until the 28-day ratio is back at or above 99.5%.

## Above 100% (breached)

The SLO was missed. A postmortem is mandatory regardless of cause, and the target
itself is re-examined: either the service needs more reliability investment, or
the target was set above what this service is funded to deliver. Both are
legitimate outcomes; silently keeping a missed target is not.

## Exceptions

- Planned maintenance **is** counted against the budget. It is not free.
- Malformed client input (400) is excluded from the SLI, and therefore the budget.
- A dependency outage that relayd correctly surfaces as 503 **is** counted —
  from the user's perspective the service was unavailable.

## Who decides

The service owner decides to invoke the freeze. Anyone can call for a review.
The freeze lifts only when the 28-day ratio is back at or above target — not when
the incident is closed.
`,
            },
          ],
        },
      ],
    },
  ],
};
