package controller

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAliBalanceQueryReturnsProviderSpecificGuidance(t *testing.T) {
	channel := &model.Channel{Type: constant.ChannelTypeAli}

	_, err := updateStandardChannelBalance(channel)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "阿里云百炼")
	assert.NotContains(t, err.Error(), "尚未实现")
}
