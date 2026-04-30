package model

import (
	"os"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	logDetailDefaultQueueSize      = 1024
	logDetailDefaultMaxContentByte = 1 << 20
)

var (
	backupLogDB      *gorm.DB
	logDetailQueue   chan *LogsDetail
	logDetailEnabled bool
	logDetailOnce    sync.Once
	logDetailMaxByte = logDetailDefaultMaxContentByte
)

type LogsDetail struct {
	Id               int64  `json:"id" gorm:"primaryKey;column:id"`
	RequestId        string `json:"request_id" gorm:"column:request_id;type:varchar(64);not null;index:idx_request_response_logs_request_id"`
	UserId           int    `json:"user_id" gorm:"column:user_id;not null;default:0;index:idx_request_response_logs_user_id_created_at,priority:1"`
	ModelName        string `json:"model_name" gorm:"column:model_name;type:varchar(255);not null;default:''"`
	PromptTokens     int    `json:"prompt_tokens" gorm:"column:prompt_tokens;not null;default:0"`
	CompletionTokens int    `json:"completion_tokens" gorm:"column:completion_tokens;not null;default:0"`
	PromptContent    string `json:"prompt_content" gorm:"column:prompt_content;type:longtext"`
	ResponseContent  string `json:"response_content" gorm:"column:response_content;type:longtext"`
	CreatedAt        int64  `json:"created_at" gorm:"column:created_at;not null;default:0;index:idx_request_response_logs_user_id_created_at,priority:2;index:idx_request_response_logs_created_at"`
}

func (LogsDetail) TableName() string {
	return "logs_detail"
}

func InitBackupLogDB() {
	dsn := os.Getenv("BACKUP_SQL_DSN")
	if strings.TrimSpace(dsn) == "" {
		return
	}
	dsn = appendMySQLDSNParam(dsn, "parseTime", "true")
	dsn = appendMySQLDSNParam(dsn, "timeout", "3s")
	dsn = appendMySQLDSNParam(dsn, "readTimeout", "10s")
	dsn = appendMySQLDSNParam(dsn, "writeTimeout", "10s")
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{PrepareStmt: true})
	if err != nil {
		common.SysError("failed to initialize backup log database, logs_detail disabled: " + err.Error())
		return
	}
	sqlDB, err := db.DB()
	if err != nil {
		common.SysError("failed to get backup log sql database, logs_detail disabled: " + err.Error())
		return
	}
	sqlDB.SetMaxIdleConns(common.GetEnvOrDefault("BACKUP_SQL_MAX_IDLE_CONNS", 10))
	sqlDB.SetMaxOpenConns(common.GetEnvOrDefault("BACKUP_SQL_MAX_OPEN_CONNS", 50))
	sqlDB.SetConnMaxLifetime(time.Second * time.Duration(common.GetEnvOrDefault("BACKUP_SQL_MAX_LIFETIME", 60)))
	if err := sqlDB.Ping(); err != nil {
		common.SysError("failed to ping backup log database, logs_detail disabled: " + err.Error())
		return
	}
	backupLogDB = db
	logDetailMaxByte = common.GetEnvOrDefault("LOGS_DETAIL_MAX_CONTENT_BYTES", logDetailDefaultMaxContentByte)
	queueSize := common.GetEnvOrDefault("LOGS_DETAIL_QUEUE_SIZE", logDetailDefaultQueueSize)
	if queueSize <= 0 {
		queueSize = logDetailDefaultQueueSize
	}
	logDetailQueue = make(chan *LogsDetail, queueSize)
	logDetailEnabled = true
	startLogDetailWorkers()
	common.SysLog("backup log database initialized, logs_detail enabled")
}

func appendMySQLDSNParam(dsn, key, value string) string {
	if strings.Contains(dsn, key+"=") {
		return dsn
	}
	sep := "?"
	if strings.Contains(dsn, "?") {
		sep = "&"
	}
	return dsn + sep + key + "=" + value
}

func startLogDetailWorkers() {
	logDetailOnce.Do(func() {
		workerCount := common.GetEnvOrDefault("LOGS_DETAIL_WORKERS", 1)
		if workerCount <= 0 {
			workerCount = 1
		}
		for i := 0; i < workerCount; i++ {
			go func() {
				for record := range logDetailQueue {
					if backupLogDB == nil || record == nil {
						continue
					}
					if err := backupLogDB.Create(record).Error; err != nil {
						common.SysError("failed to record logs_detail: " + err.Error())
					}
				}
			}()
		}
	})
}

func EnqueueLogsDetail(record *LogsDetail) {
	if !logDetailEnabled || logDetailQueue == nil || record == nil {
		return
	}
	record.PromptContent = limitLogDetailContent(record.PromptContent)
	record.ResponseContent = limitLogDetailContent(record.ResponseContent)
	if record.PromptContent == "" && record.ResponseContent == "" {
		return
	}
	select {
	case logDetailQueue <- record:
	default:
		common.SysError("logs_detail queue full, dropped request_id=" + record.RequestId)
	}
}

func LogsDetailEnabled() bool {
	return logDetailEnabled
}

func limitLogDetailContent(content string) string {
	if logDetailMaxByte <= 0 || len(content) <= logDetailMaxByte {
		return content
	}
	return content[:logDetailMaxByte]
}
