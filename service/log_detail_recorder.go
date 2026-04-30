package service

import (
	"bufio"
	"bytes"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
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
	raw := recorder.String()
	if parsed := parseStreamResponseContent(raw); parsed != "" {
		return parsed
	}
	if last := lastStreamData(raw); last != "" {
		return last
	}
	return raw
}

func SkipLogsDetailResponse(c *gin.Context) {
	if c == nil {
		return
	}
	c.Set(logsDetailSkipResponseKey, true)
}

func parseStreamResponseContent(raw string) string {
	if !strings.Contains(raw, "data:") {
		return ""
	}
	var builder strings.Builder
	for _, data := range streamDataItems(raw) {
		if data == "" || data == "[DONE]" {
			continue
		}
		appendStreamDataContent(&builder, data)
	}
	return builder.String()
}

func streamDataItems(raw string) []string {
	lines := strings.Split(raw, "\n")
	items := make([]string, 0, len(lines))
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		items = append(items, strings.TrimSpace(strings.TrimPrefix(line, "data:")))
	}
	return items
}

func lastStreamData(raw string) string {
	items := streamDataItems(raw)
	for i := len(items) - 1; i >= 0; i-- {
		if items[i] != "" && items[i] != "[DONE]" {
			return items[i]
		}
	}
	return ""
}

func appendStreamDataContent(builder *strings.Builder, data string) {
	var chatResp dto.ChatCompletionsStreamResponse
	if err := common.Unmarshal([]byte(data), &chatResp); err == nil && len(chatResp.Choices) > 0 {
		for _, choice := range chatResp.Choices {
			builder.WriteString(choice.Delta.GetReasoningContent())
			builder.WriteString(choice.Delta.GetContentString())
			for _, toolCall := range choice.Delta.ToolCalls {
				if toolCall.Function.Name != "" {
					builder.WriteString(toolCall.Function.Name)
				}
				if toolCall.Function.Arguments != "" {
					builder.WriteString(toolCall.Function.Arguments)
				}
			}
		}
		return
	}

	var responsesResp dto.ResponsesStreamResponse
	if err := common.Unmarshal([]byte(data), &responsesResp); err == nil && responsesResp.Delta != "" {
		builder.WriteString(responsesResp.Delta)
		return
	}

	var claudeResp dto.ClaudeResponse
	if err := common.Unmarshal([]byte(data), &claudeResp); err == nil {
		if claudeResp.Delta != nil {
			builder.WriteString(claudeResp.Delta.GetText())
			if claudeResp.Delta.Thinking != nil {
				builder.WriteString(*claudeResp.Delta.Thinking)
			}
			if claudeResp.Delta.PartialJson != nil {
				builder.WriteString(*claudeResp.Delta.PartialJson)
			}
			builder.WriteString(claudeResp.Delta.Delta)
		}
		for _, content := range claudeResp.Content {
			builder.WriteString(content.GetText())
			if content.Thinking != nil {
				builder.WriteString(*content.Thinking)
			}
		}
	}
}
