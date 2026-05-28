package service

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"gorm.io/gorm"
)

var quickExchangeKeyPattern = regexp.MustCompile(`^[A-Za-z0-9]{32}$`)

type QuickExchangeResult struct {
	Username          string   `json:"username"`
	Password          string   `json:"password"`
	APIKey            string   `json:"api_key"`
	BaseURL           string   `json:"base_url"`
	BaseURLV1         string   `json:"base_url_v1"`
	ModelsURL         string   `json:"models_url"`
	RecommendedModels []string `json:"recommended_models"`
}

func QuickExchange(redemptionKey string, requestBaseURL string) (*QuickExchangeResult, error) {
	key := strings.TrimSpace(redemptionKey)
	if !quickExchangeKeyPattern.MatchString(key) {
		return nil, errors.New("兑换码格式不正确，请输入 32 位字母和数字组成的兑换码")
	}
	if !common.RegisterEnabled || !common.PasswordRegisterEnabled {
		return nil, errors.New("当前站点未开放账号密码注册，无法使用快捷兑换")
	}
	if !operation_setting.IsPaymentComplianceConfirmed() {
		return nil, errors.New("管理员尚未确认支付合规设置，暂无法兑换")
	}

	username := key[:10]
	password := username

	if err := ensureQuickExchangeKeyCanProceed(key, username); err != nil {
		return nil, err
	}

	user, err := getOrCreateQuickExchangeUser(username, password)
	if err != nil {
		return nil, err
	}

	if err := redeemOrConfirmQuickExchangeKey(key, user.Id); err != nil {
		return nil, err
	}

	token, err := getOrCreateQuickExchangeToken(user.Id, username)
	if err != nil {
		return nil, err
	}

	baseURL := strings.TrimRight(system_setting.ServerAddress, "/")
	if baseURL == "" {
		baseURL = strings.TrimRight(requestBaseURL, "/")
	}
	baseURLV1 := ""
	modelsURL := ""
	if baseURL != "" {
		baseURLV1 = baseURL + "/v1"
		modelsURL = baseURL + "/pricing"
	}

	return &QuickExchangeResult{
		Username:          username,
		Password:          password,
		APIKey:            "sk-" + strings.TrimPrefix(token.Key, "sk-"),
		BaseURL:           baseURL,
		BaseURLV1:         baseURLV1,
		ModelsURL:         modelsURL,
		RecommendedModels: []string{},
	}, nil
}

func ensureQuickExchangeKeyCanProceed(key string, username string) error {
	redemption := &model.Redemption{}
	if err := model.DB.Unscoped().Where(&model.Redemption{Key: key}).First(redemption).Error; err != nil {
		return errors.New("无效的兑换码")
	}
	if redemption.Status == common.RedemptionCodeStatusEnabled {
		if redemption.ExpiredTime != 0 && redemption.ExpiredTime < common.GetTimestamp() {
			return errors.New("该兑换码已过期")
		}
		return nil
	}
	if redemption.Status != common.RedemptionCodeStatusUsed {
		return errors.New("该兑换码不可用")
	}

	user := &model.User{}
	if err := model.DB.Where("username = ?", username).First(user).Error; err != nil {
		return errors.New("该兑换码已被使用")
	}
	if redemption.UsedUserId != user.Id {
		return errors.New("该兑换码已被使用")
	}
	return nil
}

func getOrCreateQuickExchangeUser(username string, password string) (*model.User, error) {
	user := &model.User{}
	err := model.DB.Where("username = ?", username).First(user).Error
	if err == nil {
		checkUser := model.User{Username: username, Password: password}
		if err := checkUser.ValidateAndFill(); err != nil {
			return nil, errors.New("快捷兑换账号已存在但密码不匹配，请联系客服处理")
		}
		return &checkUser, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("查询账号失败: %w", err)
	}

	user = &model.User{
		Username:    username,
		Password:    password,
		DisplayName: username,
		Role:        common.RoleCommonUser,
	}
	if err := user.Insert(0); err != nil {
		return nil, fmt.Errorf("创建账号失败: %w", err)
	}

	created := &model.User{}
	if err := model.DB.Where("username = ?", username).First(created).Error; err != nil {
		return nil, fmt.Errorf("读取快捷兑换账号失败: %w", err)
	}
	return created, nil
}

func redeemOrConfirmQuickExchangeKey(key string, userID int) error {
	_, err := model.Redeem(key, userID)
	if err == nil {
		return nil
	}

	redemption := &model.Redemption{}
	if findErr := model.DB.Unscoped().Where(&model.Redemption{Key: key}).First(redemption).Error; findErr != nil {
		return errors.New("兑换码错误或者已被使用，请联系客服解决")
	}
	if redemption.Status == common.RedemptionCodeStatusUsed && redemption.UsedUserId == userID {
		return nil
	}
	return errors.New("兑换码错误或者已被使用，请联系客服解决")
}

func getOrCreateQuickExchangeToken(userID int, username string) (*model.Token, error) {
	token := &model.Token{}
	err := model.DB.Where("user_id = ? AND status = ?", userID, common.TokenStatusEnabled).Order("id desc").First(token).Error
	if err == nil {
		return token, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("查询 API Key 失败: %w", err)
	}

	key, err := common.GenerateKey()
	if err != nil {
		return nil, fmt.Errorf("生成 API Key 失败: %w", err)
	}
	token = &model.Token{
		UserId:             userID,
		Name:               username + "的快捷兑换令牌",
		Key:                key,
		CreatedTime:        common.GetTimestamp(),
		AccessedTime:       common.GetTimestamp(),
		ExpiredTime:        -1,
		RemainQuota:        500000,
		UnlimitedQuota:     true,
		ModelLimitsEnabled: false,
	}
	if setting.DefaultUseAutoGroup {
		token.Group = "auto"
	}
	if err := token.Insert(); err != nil {
		return nil, fmt.Errorf("创建 API Key 失败: %w", err)
	}
	return token, nil
}
