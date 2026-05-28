package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/gin-gonic/gin"
)

type quickExchangeRequest struct {
	Key string `json:"key"`
}

func QuickExchange(c *gin.Context) {
	req := quickExchangeRequest{}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	result, err := service.QuickExchange(req.Key, getQuickExchangeRequestBaseURL(c))
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	common.ApiSuccess(c, result)
}

func getQuickExchangeRequestBaseURL(c *gin.Context) string {
	if system_setting.ServerAddress != "" {
		return system_setting.ServerAddress
	}

	scheme := c.Request.Header.Get("X-Forwarded-Proto")
	if scheme == "" {
		scheme = c.Request.Header.Get("X-Forwarded-Protocol")
	}
	if scheme == "" && c.Request.Header.Get("X-Forwarded-Ssl") == "on" {
		scheme = "https"
	}
	if scheme == "" {
		if c.Request.TLS != nil {
			scheme = "https"
		} else {
			scheme = "http"
		}
	}
	return scheme + "://" + c.Request.Host
}
