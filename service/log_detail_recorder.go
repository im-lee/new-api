package service

import (
	"bufio"
	"bytes"
	"net"
	"net/http"
	"sync"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

const (
	logsDetailPromptKey       = "logs_detail_prompt_content"
	logsDetailRecorderKey     = "logs_detail_response_recorder"
	logsDetailSkipResponseKey = "logs_detail_skip_response"
	logsDetailMaxCapture      = 1 << 20
)

type logsDetailResponseRecorder struct {
	gin.ResponseWriter
	mu  sync.Mutex
	buf bytes.Buffer
}

func (w *logsDetailResponseRecorder) Write(data []byte) (int, error) {
	w.capture(data)
	return w.ResponseWriter.Write(data)
}

func (w *logsDetailResponseRecorder) WriteString(s string) (int, error) {
	w.capture([]byte(s))
	return w.ResponseWriter.WriteString(s)
}

func (w *logsDetailResponseRecorder) Flush() {
	w.ResponseWriter.Flush()
}

func (w *logsDetailResponseRecorder) CloseNotify() <-chan bool {
	return w.ResponseWriter.CloseNotify()
}

func (w *logsDetailResponseRecorder) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	return w.ResponseWriter.Hijack()
}

func (w *logsDetailResponseRecorder) Pusher() http.Pusher {
	return w.ResponseWriter.Pusher()
}

func (w *logsDetailResponseRecorder) capture(data []byte) {
	if len(data) == 0 {
		return
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	remaining := logsDetailMaxCapture - w.buf.Len()
	if remaining <= 0 {
		return
	}
	if len(data) > remaining {
		data = data[:remaining]
	}
	_, _ = w.buf.Write(data)
}

func (w *logsDetailResponseRecorder) String() string {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.buf.String()
}

func StartLogsDetailRecorder(c *gin.Context) {
	if !model.LogsDetailEnabled() || c == nil || c.Writer == nil {
		return
	}
	if _, exists := c.Get(logsDetailRecorderKey); exists {
		return
	}
	recorder := &logsDetailResponseRecorder{ResponseWriter: c.Writer}
	c.Writer = recorder
	c.Set(logsDetailRecorderKey, recorder)
}

func RecordLogsDetailPrompt(c *gin.Context, data []byte) {
	if !model.LogsDetailEnabled() || c == nil || len(data) == 0 {
		return
	}
	if len(data) > logsDetailMaxCapture {
		data = data[:logsDetailMaxCapture]
	}
	c.Set(logsDetailPromptKey, string(data))
}

func GetLogsDetailPrompt(c *gin.Context) string {
	if c == nil {
		return ""
	}
	return c.GetString(logsDetailPromptKey)
}

func GetLogsDetailResponse(c *gin.Context) string {
	if c == nil {
		return ""
	}
	if c.GetBool(logsDetailSkipResponseKey) {
		return ""
	}
	value, exists := c.Get(logsDetailRecorderKey)
	if !exists {
		return ""
	}
	recorder, ok := value.(*logsDetailResponseRecorder)
	if !ok || recorder == nil {
		return ""
	}
	return recorder.String()
}

func SkipLogsDetailResponse(c *gin.Context) {
	if c == nil {
		return
	}
	c.Set(logsDetailSkipResponseKey, true)
}
