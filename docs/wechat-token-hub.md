---
title: WechatTokenHub
---

# 🔐 WechatTokenHub

<div align="center">
  <img src="https://s2.loli.net/2025/07/30/Lauge4F7JK2RtEU.png" alt="WechatTokenHub Logo" width="180">
  
  <p>微信公众号 Access Token 管理服务，解决本地开发时 IP 白名单限制问题</p>

  <a href="https://github.com/xiaoqiangclub/WechatTokenHub">
    <img src="https://img.shields.io/badge/GitHub-WechatTokenHub-blue?logo=github" alt="GitHub">
  </a>
  <a href="https://hub.docker.com/r/xiaoqiangclub/wechat-token-hub">
    <img src="https://img.shields.io/badge/Docker-xiaoqiangclub%2Fwechat--token--hub-blue?logo=docker" alt="Docker">
  </a>
  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python" alt="Python">
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi" alt="FastAPI">
  </a>
</div>

---

## ✨ 功能特性

- 🔑 **多账号支持** - 可配置管理多个微信公众号
- 🎯 **灵活查询** - 支持通过 `app_id` 或 `name` 指定账号
- 📦 **批量获取** - 支持一次获取多个或全部账号的 Token
- ⚡ **高效缓存** - 内存缓存，快速响应
- 🔄 **自动刷新** - Token 过期前自动刷新
- 📊 **精确有效期** - 返回剩余有效期，而非固定 7200
- 🛡️ **安全认证** - 支持 API 密钥验证
- ✅ **启动验证** - 服务启动时自动验证所有账号有效性
- 🌐 **代理支持** - 支持 HTTP/HTTPS/SOCKS5 代理
- 📖 **完整文档** - Swagger/ReDoc 自动生成 + 首页示例
- 🐳 **容器部署** - Docker 一键部署

---

## 🚀 快速开始

### 方式一：Docker 运行（推荐）

```bash
docker run -d \
  --name wechat-token-hub \
  -p 8000:8000 \
  -e 'WECHAT_ACCOUNTS=[{"app_id":"你的AppID","app_secret":"你的AppSecret","name":"我的公众号"}]' \
  -e API_SECRET=your_secret_key \
  xiaoqiangclub/wechat-token-hub:latest
```

### 方式二：Docker Compose

1. **创建 `.env` 文件：**

```env
APP_PORT=8000
API_SECRET=your_secret_key
TOKEN_REFRESH_BUFFER=300

# 代理配置（可选）
# PROXY_URL=http://127.0.0.1:7890

WECHAT_ACCOUNTS='[
  {"app_id": "wx1234567890abcdef", "app_secret": "your_app_secret_here_32chars", "name": "公众号A"},
  {"app_id": "wx0987654321fedcba", "app_secret": "another_app_secret_32chars", "name": "公众号B"}
]'
```

2. **创建 `docker-compose.yml`：**

```yaml
services:
  wechat-token-hub:
    image: xiaoqiangclub/wechat-token-hub:latest
    container_name: wechat-token-hub
    network_mode: bridge
    restart: always
    ports:
      - "${APP_PORT:-8000}:8000"
    environment:
      - API_PREFIX=${API_PREFIX:-/api/v1}
      - API_SECRET=${API_SECRET:-}
      - TOKEN_REFRESH_BUFFER=${TOKEN_REFRESH_BUFFER:-300}
      - PROXY_URL=${PROXY_URL:-}
      - WECHAT_ACCOUNTS=${WECHAT_ACCOUNTS:-[]}
```

3. **启动服务：**

```bash
docker-compose up -d
```

4. **访问服务：**

| 地址 | 说明 |
|------|------|
| `http://localhost:8000/` | 🏠 首页（使用文档 & 账号状态） |
| `http://localhost:8000/docs` | 📖 Swagger 交互文档 |
| `http://localhost:8000/redoc` | 📚 ReDoc 文档 |
| `http://localhost:8000/health` | ❤️ 健康检查 |
| `http://localhost:8000/status` | 📊 服务状态（含账号验证结果和出口IP） |

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|:----:|
| `APP_HOST` | 服务监听地址 | `0.0.0.0` | 否 |
| `APP_PORT` | 服务监听端口 | `8000` | 否 |
| `API_PREFIX` | API 路径前缀 | `/api/v1` | 否 |
| `API_SECRET` | API 访问密钥（留空则不验证） | - | 否 |
| `TOKEN_REFRESH_BUFFER` | Token 提前刷新时间（秒） | `300` | 否 |
| `WECHAT_ACCOUNTS` | 微信账号配置（JSON 数组） | `[]` | **是** |
| `PROXY_URL` | HTTP/HTTPS/SOCKS5 代理地址 | - | 否 |
| `DEBUG` | 调试模式 | `false` | 否 |

### 微信账号配置格式

```json
[
  {
    "app_id": "wx1234567890abcdef",
    "app_secret": "your_app_secret_here_32chars",
    "name": "公众号A"
  },
  {
    "app_id": "wx0987654321fedcba",
    "app_secret": "another_app_secret_32chars",
    "name": "公众号B"
  }
]
```

| 字段 | 说明 | 必填 |
|------|------|:----:|
| `app_id` | 微信公众号 AppID | **是** |
| `app_secret` | 微信公众号 AppSecret | **是** |
| `name` | 账号别名（用于通过名称查询） | 否 |

> 💡 **账号验证**：服务启动时会自动尝试获取每个账号的 Token，验证账号配置是否正确。无效账号会在首页和日志中显示具体错误原因。

### 代理配置

如果服务器无法直接访问微信 API（如在境外服务器部署），可以配置代理：

```env
# HTTP/HTTPS 代理
PROXY_URL=http://127.0.0.1:7890

# SOCKS5 代理
PROXY_URL=socks5://127.0.0.1:1080

# 带认证的代理
PROXY_URL=http://user:password@proxy.example.com:8080
```

服务启动时会自动检测代理连接并在首页显示出口 IP 地址，方便确认请求微信服务器时使用的 IP。

---

## 📖 API 接口文档

### 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **认证方式**: Query 参数 `secret` 或 Header `X-API-Secret`

### 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET / POST | `/token` | 获取单个账号 Token |
| GET / POST | `/token/batch` | 批量获取多个账号 Token |
| GET | `/token/realtime` | 实时获取 Token（跳过缓存） |
| DELETE | `/token/{app_id}` | 删除缓存的 Token |
| GET | `/token/accounts` | 获取所有账号信息 |

### 状态接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/status` | 服务状态（含账号验证结果和出口IP） |
| POST | `/status/refresh` | 重新验证所有账号和代理连接 |

---

### 🔑 获取单个 Token

#### 请求参数

| 参数 | 位置 | 类型 | 说明 |
|------|------|------|------|
| `app_id` | Query | string | 通过 AppID 指定账号 |
| `name` | Query | string | 通过名称指定账号（与 app_id 二选一） |
| `force_refresh` | Query | bool | 强制刷新 Token（默认 false） |
| `simple_response` | Query | bool | 简单响应模式（默认 false） |
| `secret` | Query | string | API 密钥 |
| `X-API-Secret` | Header | string | API 密钥（与 secret 二选一） |

#### 请求示例

```bash
# 获取默认账号 Token（完整响应）
curl "http://localhost:8000/api/v1/token"

# 获取默认账号 Token（简单响应）
curl "http://localhost:8000/api/v1/token?simple_response=true"

# 通过名称指定账号
curl "http://localhost:8000/api/v1/token?name=公众号A&simple_response=true"

# 通过 AppID 指定账号
curl "http://localhost:8000/api/v1/token?app_id=wx123456&simple_response=true"

# 强制刷新 Token
curl "http://localhost:8000/api/v1/token?force_refresh=true&simple_response=true"

# 带密钥请求（Query 参数）
curl "http://localhost:8000/api/v1/token?secret=your_secret&simple_response=true"

# 带密钥请求（Header）
curl -H "X-API-Secret: your_secret" "http://localhost:8000/api/v1/token?simple_response=true"
```

#### POST 请求示例

```bash
curl -X POST "http://localhost:8000/api/v1/token" \
  -H "Content-Type: application/json" \
  -H "X-API-Secret: your_secret" \
  -d '{
    "name": "公众号A",
    "force_refresh": false,
    "simple_response": true
  }'
```

#### 响应格式

**完整响应**（`simple_response=false`，默认）：

```json
{
  "success": true,
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "82_xxxxxxxxxxxxxxxx",
    "expires_in": 6500,
    "expires_at": "2024-01-15T12:00:00",
    "created_at": "2024-01-15T10:00:00",
    "from_cache": true
  }
}
```

**简单响应**（`simple_response=true`）：

```json
{
  "access_token": "82_xxxxxxxxxxxxxxxx",
  "expires_in": 6500
}
```

失败时返回：

```json
null
```

> ⚠️ **重要**: `expires_in` 返回的是**剩余有效期**（秒），不是固定的 7200。

---

### 📦 批量获取 Token

一次性获取多个账号的 Token。

#### 请求参数

| 参数 | 位置 | 类型 | 说明 |
|------|------|------|------|
| `all` | Query | bool | 获取所有账号（默认 false） |
| `app_ids` | Query | string | AppID 列表，逗号分隔 |
| `names` | Query | string | 名称列表，逗号分隔 |
| `force_refresh` | Query | bool | 强制刷新 Token（默认 false） |
| `simple_response` | Query | bool | 简单响应模式（默认 false） |

#### 请求示例

```bash
# 获取所有账号
curl "http://localhost:8000/api/v1/token/batch?all=true&simple_response=true"

# 通过名称获取多个账号（逗号分隔）
curl "http://localhost:8000/api/v1/token/batch?names=公众号A,公众号B&simple_response=true"

# 通过 AppID 获取多个账号（逗号分隔）
curl "http://localhost:8000/api/v1/token/batch?app_ids=wx111,wx222&simple_response=true"
```

#### 响应示例

**完整响应**：

```json
{
  "success": true,
  "code": 0,
  "message": "success",
  "total": 2,
  "succeeded": 2,
  "failed": 0,
  "data": [
    {
      "app_id": "wx111",
      "name": "公众号A",
      "success": true,
      "access_token": "82_xxx",
      "expires_in": 6500,
      "from_cache": true
    },
    {
      "app_id": "wx222",
      "name": "公众号B",
      "success": true,
      "access_token": "82_yyy",
      "expires_in": 7100,
      "from_cache": false
    }
  ]
}
```

**简单响应**：

```json
[
  {"app_id": "wx111", "name": "公众号A", "access_token": "82_xxx", "expires_in": 6500},
  {"app_id": "wx222", "name": "公众号B", "access_token": "82_yyy", "expires_in": 7100}
]
```

---

### 🔄 实时获取 Token

跳过缓存，直接从微信服务器获取新 Token。

```bash
# 实时获取默认账号
curl "http://localhost:8000/api/v1/token/realtime?simple_response=true"

# 指定账号实时获取
curl "http://localhost:8000/api/v1/token/realtime?name=公众号A&simple_response=true"
```

> ⚠️ **注意**: 频繁调用可能触发微信 API 频率限制。

---

### 🗑️ 删除缓存的 Token

```bash
curl -X DELETE "http://localhost:8000/api/v1/token/wx123456?secret=your_secret"
```

响应：

```json
{
  "success": true,
  "code": 0,
  "message": "Token 已删除: wx123456"
}
```

---

### 📋 获取所有账号信息

```bash
curl "http://localhost:8000/api/v1/token/accounts?secret=your_secret"
```

响应：

```json
{
  "success": true,
  "code": 0,
  "message": "success",
  "data": [
    {
      "app_id": "wx123456",
      "name": "公众号A",
      "has_token": true,
      "token_expires_at": "2024-01-15T12:00:00",
      "remaining_seconds": 6500
    },
    {
      "app_id": "wx789012",
      "name": "公众号B",
      "has_token": false,
      "token_expires_at": null,
      "remaining_seconds": null
    }
  ]
}
```

---

### 📊 服务状态

获取服务状态、账号验证结果和出口 IP。

```bash
curl "http://localhost:8000/status"
```

响应：

```json
{
  "service": "WechatTokenHub",
  "status": "healthy",
  "proxy": {
    "enabled": true,
    "url": "http://127.0.0.1:7890",
    "ip": "203.156.xxx.xxx",
    "error": null
  },
  "accounts": {
    "total": 3,
    "valid_count": 2,
    "invalid_count": 1,
    "validated": true,
    "valid_accounts": [
      {"app_id": "wx111", "name": "公众号A"},
      {"app_id": "wx222", "name": "公众号B"}
    ],
    "invalid_accounts": [
      {"app_id": "wx333", "name": "测试号", "error": "微信接口错误: 40013 - invalid appid"}
    ]
  }
}
```

#### 重新验证状态

```bash
curl -X POST "http://localhost:8000/status/refresh"
```

---

## 🐍 Python 调用示例

### 基础用法

```python
import requests

def get_token(name=None, app_id=None, secret=None):
    """获取单个账号 Token"""
    params = {"simple_response": True}
    if name:
        params["name"] = name
    elif app_id:
        params["app_id"] = app_id
    if secret:
        params["secret"] = secret

    resp = requests.get("http://localhost:8000/api/v1/token", params=params)
    return resp.json()

# 使用
result = get_token(name="公众号A", secret="your_secret")
if result:
    print(f"Token: {result['access_token']}")
    print(f"剩余: {result['expires_in']}秒")
else:
    print("获取失败")
```

### 批量获取

```python
import requests

def get_all_tokens(secret=None):
    """获取所有账号 Token"""
    params = {"all": True, "simple_response": True}
    if secret:
        params["secret"] = secret

    resp = requests.get("http://localhost:8000/api/v1/token/batch", params=params)
    return resp.json()

# 使用
tokens = get_all_tokens(secret="your_secret")
for item in tokens:
    if item.get("access_token"):
        print(f"✅ {item['name']}: {item['access_token'][:20]}...")
    else:
        print(f"❌ {item['name']}: {item.get('error')}")
```

### 带本地缓存的客户端（推荐）

```python
import json
import time
import tempfile
import requests
from pathlib import Path


class WechatTokenClient:
    """微信 Token 客户端（带本地缓存）"""

    def __init__(self, base_url="http://localhost:8000", secret=None, cache_dir=None):
        self.base_url = base_url
        self.api = "/api/v1"
        self.secret = secret

        if cache_dir:
            self.cache_dir = Path(cache_dir)
        else:
            self.cache_dir = Path(tempfile.gettempdir()) / "wechat_token_cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_cache_file(self, identifier):
        safe_name = "".join(c if c.isalnum() else "_" for c in identifier)
        return self.cache_dir / f"token_{safe_name}.json"

    def _load_cache(self, identifier):
        cache_file = self._get_cache_file(identifier)
        if not cache_file.exists():
            return None
        try:
            with open(cache_file, "r") as f:
                data = json.load(f)
                if time.time() < data["expires_at"] - 60:
                    return data
        except:
            pass
        return None

    def _save_cache(self, identifier, token, expires_in):
        cache_file = self._get_cache_file(identifier)
        data = {
            "access_token": token,
            "expires_in": expires_in,
            "expires_at": time.time() + expires_in
        }
        with open(cache_file, "w") as f:
            json.dump(data, f)

    def get_token(self, name=None, app_id=None, force_refresh=False):
        """获取 Token（优先本地缓存 -> 服务端缓存 -> 微信服务器）"""
        identifier = name or app_id or "default"

        if not force_refresh:
            cache = self._load_cache(identifier)
            if cache:
                return cache["access_token"]

        params = {"simple_response": True}
        if name:
            params["name"] = name
        elif app_id:
            params["app_id"] = app_id
        if force_refresh:
            params["force_refresh"] = True
        if self.secret:
            params["secret"] = self.secret

        try:
            resp = requests.get(f"{self.base_url}{self.api}/token", params=params)
            result = resp.json()
            if result:
                self._save_cache(identifier, result["access_token"], result["expires_in"])
                return result["access_token"]
        except Exception as e:
            print(f"请求失败: {e}")

        return None


# 使用
client = WechatTokenClient(secret="your_secret")
token = client.get_token(name="公众号A")
print(f"Token: {token}")
```

### 完整封装类

```python
import requests
from typing import Optional, Dict, Any, List


class WechatTokenHub:
    """WechatTokenHub 完整客户端"""
    
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_prefix: str = "/api/v1",
        secret: Optional[str] = None
    ):
        self.base_url = base_url.rstrip("/")
        self.api_prefix = api_prefix
        self.secret = secret
    
    def _request(
        self, 
        method: str, 
        endpoint: str, 
        params: Dict = None, 
        json_data: Dict = None
    ) -> Any:
        """发送请求"""
        url = f"{self.base_url}{self.api_prefix}{endpoint}"
        params = params or {}
        
        if self.secret:
            params["secret"] = self.secret
        
        if method.upper() == "GET":
            response = requests.get(url, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, params=params, json=json_data)
        elif method.upper() == "DELETE":
            response = requests.delete(url, params=params)
        else:
            raise ValueError(f"不支持的方法: {method}")
        
        return response.json()
    
    def get_token(
        self,
        name: str = None,
        app_id: str = None,
        force_refresh: bool = False,
        simple: bool = True
    ) -> Optional[Dict]:
        """获取单个账号 Token"""
        params = {"simple_response": simple}
        if name:
            params["name"] = name
        elif app_id:
            params["app_id"] = app_id
        if force_refresh:
            params["force_refresh"] = True
        return self._request("GET", "/token", params)
    
    def get_token_batch(
        self,
        names: List[str] = None,
        app_ids: List[str] = None,
        all_accounts: bool = False,
        force_refresh: bool = False,
        simple: bool = True
    ) -> List[Dict]:
        """批量获取 Token"""
        params = {"simple_response": simple}
        if all_accounts:
            params["all"] = True
        elif names:
            params["names"] = ",".join(names)
        elif app_ids:
            params["app_ids"] = ",".join(app_ids)
        if force_refresh:
            params["force_refresh"] = True
        return self._request("GET", "/token/batch", params)
    
    def get_token_realtime(
        self,
        name: str = None,
        app_id: str = None,
        simple: bool = True
    ) -> Optional[Dict]:
        """实时获取 Token（跳过缓存）"""
        params = {"simple_response": simple}
        if name:
            params["name"] = name
        elif app_id:
            params["app_id"] = app_id
        return self._request("GET", "/token/realtime", params)
    
    def delete_token(self, app_id: str) -> Dict:
        """删除缓存的 Token"""
        return self._request("DELETE", f"/token/{app_id}")
    
    def get_accounts(self) -> Dict:
        """获取所有账号信息"""
        return self._request("GET", "/token/accounts")
    
    def get_status(self) -> Dict:
        """获取服务状态（含出口IP）"""
        url = f"{self.base_url}/status"
        return requests.get(url).json()
    
    def refresh_status(self) -> Dict:
        """刷新账号验证状态和代理连接"""
        url = f"{self.base_url}/status/refresh"
        return requests.post(url).json()


# 使用示例
if __name__ == "__main__":
    client = WechatTokenHub(secret="your_secret")
    
    # 获取单个 Token
    token = client.get_token(name="公众号A")
    if token:
        print(f"Token: {token['access_token'][:30]}...")
    
    # 批量获取所有账号
    tokens = client.get_token_batch(all_accounts=True)
    for item in tokens:
        status = "✅" if item.get("access_token") else "❌"
        print(f"{status} {item['name']}")
    
    # 获取服务状态（查看出口IP）
    status = client.get_status()
    print(f"出口 IP: {status['proxy']['ip']}")
    print(f"有效账号: {status['accounts']['valid_count']}")
    print(f"无效账号: {status['accounts']['invalid_count']}")
```

---

## 🛠️ 二次开发

### 环境准备

```bash
# 克隆项目
git clone https://github.com/xiaoqiangclub/WechatTokenHub.git
cd WechatTokenHub

# 安装 Poetry（如未安装）
pip install poetry

# 安装依赖
poetry install
```

### 项目结构

```
WechatTokenHub/
├── pyproject.toml
├── poetry.lock
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
└── src/
    └── wechat_token_hub/
        ├── __init__.py
        ├── main.py
        ├── config.py
        ├── models.py
        ├── storage.py
        ├── wechat_api.py
        └── routers/
            ├── __init__.py
            └── token.py
```

### 本地运行

```bash
# 方式一：使用 Poetry
poetry run wechat-token-hub

# 方式二：直接运行（需设置 PYTHONPATH）
# Windows PowerShell
$env:PYTHONPATH = "$(Get-Location)\src"
python -m wechat_token_hub.main

# Linux / macOS
export PYTHONPATH="$(pwd)/src"
python -m wechat_token_hub.main
```

### 开发配置

创建 `.env` 文件：

```env
DEBUG=true
API_SECRET=dev_secret
PROXY_URL=http://127.0.0.1:7890
WECHAT_ACCOUNTS='[{"app_id":"wx1234567890abcdef","app_secret":"your_app_secret_here_32chars","name":"测试账号"}]'
```

---

## 🐳 Docker 镜像构建

### 本地构建

```bash
# 生成 poetry.lock
poetry lock --no-update

# 构建镜像
docker build -t xiaoqiangclub/wechat-token-hub:latest .

# 本地测试
docker run -d --name test-hub -p 8000:8000 \
  -e 'WECHAT_ACCOUNTS=[{"app_id":"wx123","app_secret":"secret123","name":"测试"}]' \
  xiaoqiangclub/wechat-token-hub:latest

# 检查服务
curl http://localhost:8000/health
curl http://localhost:8000/status

# 清理
docker stop test-hub && docker rm test-hub
```

### 推送到 Docker Hub

```bash
# 登录
docker login

# 打标签
VERSION=1.0.0
docker tag xiaoqiangclub/wechat-token-hub:latest xiaoqiangclub/wechat-token-hub:$VERSION

# 推送
docker push xiaoqiangclub/wechat-token-hub:latest
docker push xiaoqiangclub/wechat-token-hub:$VERSION
```

### 多架构构建（AMD64 + ARM64）

```bash
# 创建 buildx builder
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# 构建并推送
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t xiaoqiangclub/wechat-token-hub:latest \
  -t xiaoqiangclub/wechat-token-hub:$VERSION \
  --push \
  .
```

---

## ❓ 常见问题

### 1. 服务启动后显示无效账号

服务启动时会自动验证所有配置的账号。如果显示无效账号，请检查：

- **AppID 和 AppSecret 是否正确** - 从微信公众平台后台获取
- **服务器 IP 是否已加白名单** - 在微信公众平台「开发 - 基本配置 - IP白名单」中添加服务器出口 IP
- **查看具体错误信息** - 访问 `/status` 接口或查看首页

常见错误码：

| 错误码 | 说明 |
|--------|------|
| `40001` | AppSecret 错误 |
| `40013` | AppID 错误 |
| `40164` | IP 未加白名单 |

### 2. 如何确认出口 IP

访问服务首页或 `/status` 接口，会显示当前请求微信服务器使用的出口 IP 地址。将该 IP 添加到微信公众号的 IP 白名单中。

### 3. 使用代理后仍然报 IP 白名单错误

- 检查代理是否正常工作（首页会显示代理出口 IP）
- 如果代理出口 IP 显示失败，检查代理配置是否正确
- 将代理出口 IP 添加到微信公众号白名单

### 4. expires_in 不是 7200

这是正常的！`expires_in` 返回的是**剩余有效期**，不是固定值。

### 5. 如何刷新账号验证状态

```bash
curl -X POST "http://localhost:8000/status/refresh"
```

### 6. Token 缓存在哪里

Token 缓存在服务内存中。服务重启后缓存会清空，但首次请求会自动从微信服务器获取新 Token。

---

## 💖 打赏支持

如果这个项目对你有帮助，欢迎打赏支持！你的支持是我持续更新的动力 💪

<div align="center">
  <img src="https://s2.loli.net/2025/11/10/lQRcAvN3Lgxukqb.png" alt="打赏支持" width="300">
  
  <p><strong>扫码打赏 | 支持作者 | 持续更新</strong></p>
</div>

---

<div align="center">
  <p><strong>Made with ❤️ by <a href="https://github.com/xiaoqiangclub">Xiaoqiang</a></strong></p>
  
  <p><strong>欢迎关注微信公众号：XiaoqiangClub</strong></p>
  
  <p><a href="#-wechattokenhub">⬆ 回到顶部</a></p>
</div>