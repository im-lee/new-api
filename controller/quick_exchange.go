package controller

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/service"

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

	result, err := service.QuickExchange(req.Key, c.Request)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}
	common.ApiSuccess(c, result)
}
