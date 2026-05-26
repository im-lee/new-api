package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"unicode"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"gorm.io/gorm"
)

type QuickExchangeResult struct {
	Username          string   `json:"username"`
	Password          string   `json:"password"`
	APIKey            string   `json:"api_key"`
	BaseURL           string   `json:"base_url"`
	BaseURLV1         string   `json:"base_url_v1"`
	ModelsURL         string   `json:"models_url"`
	RecommendedModels []string `json:"recommended_models"`
}

func QuickExchange(key string, request *http.Request) (*QuickExchangeResult, error) {
	key = strings.TrimSpace(key)
	if key == "" {
		return nil, errors.New("兑换码不能为空")
	}

	username, password := buildQuickExchangeIdentity(key)
	user, err := getOrCreateQuickExchangeUser(username, password)
	if err != nil {
		return nil, err
	}

	if _, err = model.Redeem(key, user.Id); err != nil {
		redemption := model.Redemption{}
		findErr := model.DB.Where(&model.Redemption{Key: key}).First(&redemption).Error
		if findErr != nil || redemption.Status != common.RedemptionCodeStatusUsed || redemption.UsedUserId != user.Id {
			return nil, err
		}
	}

	token, err := getOrCreateQuickExchangeToken(user.Id)
	if err != nil {
		return nil, err
	}

	baseURL := getRequestBaseURL(request)
	return &QuickExchangeResult{
		Username:          username,
		Password:          password,
		APIKey:            token.GetFullKey(),
		BaseURL:           baseURL,
		BaseURLV1:         strings.TrimRight(baseURL, "/") + "/v1",
		ModelsURL:         strings.TrimRight(baseURL, "/") + "/pricing",
		RecommendedModels: []string{},
	}, nil
}

func getOrCreateQuickExchangeUser(username string, password string) (*model.User, error) {
	user := model.User{}
	err := model.DB.Where("username = ?", username).First(&user).Error
	if err == nil {
		return &user, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	user = model.User{
		Username:    username,
		Password:    password,
		DisplayName: username,
		Role:        common.RoleCommonUser,
		Status:      common.UserStatusEnabled,
	}
	if err := user.Insert(0); err != nil {
		return nil, err
	}
	return &user, nil
}

func getOrCreateQuickExchangeToken(userID int) (*model.Token, error) {
	token := model.Token{}
	err := model.DB.Where("user_id = ? AND name = ?", userID, "quick-exchange").Order("id asc").First(&token).Error
	if err == nil {
		return &token, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	key, err := common.GenerateKey()
	if err != nil {
		return nil, err
	}
	token = model.Token{
		UserId:             userID,
		Name:               "quick-exchange",
		Key:                key,
		CreatedTime:        common.GetTimestamp(),
		AccessedTime:       common.GetTimestamp(),
		ExpiredTime:        -1,
		UnlimitedQuota:     true,
		ModelLimitsEnabled: false,
	}
	if setting.DefaultUseAutoGroup {
		token.Group = "auto"
		token.CrossGroupRetry = true
	}
	if err := token.Insert(); err != nil {
		return nil, err
	}
	return &token, nil
}

func buildQuickExchangeIdentity(key string) (string, string) {
	keyHash := sha256.Sum256([]byte(key))
	keyHashText := hex.EncodeToString(keyHash[:])
	prefix := strings.SplitN(key, "-", 2)[0]
	usernamePart := sanitizeQuickExchangeUsernamePart(prefix)
	if usernamePart == "" {
		usernamePart = keyHashText[:12]
	}
	if len(usernamePart) > 17 {
		usernamePart = usernamePart[:17]
	}
	passwordHash := sha256.Sum256([]byte(usernamePart))
	passwordHashText := hex.EncodeToString(passwordHash[:])
	return "qe_" + usernamePart, "qe_" + passwordHashText[:14]
}

func sanitizeQuickExchangeUsernamePart(value string) string {
	var builder strings.Builder
	for _, r := range value {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' {
			builder.WriteRune(r)
		}
	}
	return builder.String()
}

func getRequestBaseURL(request *http.Request) string {
	scheme := firstHeaderValue(request.Header.Get("X-Forwarded-Proto"))
	if scheme == "" {
		if request.TLS != nil {
			scheme = "https"
		} else {
			scheme = "http"
		}
	}
	host := firstHeaderValue(request.Header.Get("X-Forwarded-Host"))
	if host == "" {
		host = request.Host
	}
	return scheme + "://" + host
}

func firstHeaderValue(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	return strings.TrimSpace(strings.Split(value, ",")[0])
}
