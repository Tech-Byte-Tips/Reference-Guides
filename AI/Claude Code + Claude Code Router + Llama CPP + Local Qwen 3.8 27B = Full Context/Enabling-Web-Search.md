## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to enable Web Search for your local AI agent

Web Search for Claude Code gives the coding agent the ability to look up current information on the internet instead of relying only on its built-in training data and the files in your project.

It can be especially useful for:

- Finding the latest documentation for libraries, APIs, frameworks, and tools.
- Researching error messages and known fixes.
- Checking current software versions, breaking changes, and release notes.
- Looking up unfamiliar APIs, command-line options, or configuration settings.
- Finding examples and implementation approaches from official documentation and other technical sources.
- Verifying information that may have changed since the model was trained.

In short, Web Search makes Claude Code more effective when solving problems involving recent, obscure, or rapidly changing technical information, rather than forcing it to rely entirely on what the underlying model already knows.

## The Goal

We want to allow Qwen to have a tool that allows it to search the internet using things like Duck Duck Go or Bing.  These are the only search engines that we can use for free with MCP servers as of now.

For this functionality, we will leverage a Model Context Protocol (MCP) tool to search the internet for new and relevant data.  Kind of the same thing that we all used to do before AI became a thing.

Example:

  **Person 1:** Do you know who Napoleon Bonaparte was?

  **You:** Mmmm... it sounds famililar.  I think it was some dude from France that got destroyed in Russia or something like that.  Let me check on Google.

  *You perform a Google search and get knowledge that you either didn't know or didn't remember*

  **You:** Ah yes, Napoleon was the short military general and emperor from France that tried to conquer a lot of Europe and Russia in the 19th century and got destroyed by the cold weather in Russia.

The architecture will look like this:

```
Claude Code
   │
   ├── ddg-search MCP ─────► DuckDuckGo
   ├── ddgs-search MCP
   │       ├───────────────► Bing (enabled)
   └── inference
          ↓
         CCR
          ↓
      llama.cpp
          ↓
       Qwen 3.8
```

## Claude Code Router

We don't need to touch our configuration for the CCR that we made in the original guide.

### Install a corrected Qwen 3.8 chat template

This template fixes an issue with calling tools in a structured way.  The template project specifically supports Qwen 3.8, llama.cpp, tool calling, and reasoning. The version v22.4 is validated to work properly.

1. Download the fixed Qwen template into the existing llama-server models directory:

```
hf download froggeric/Qwen-Fixed-Chat-Templates chat_template.jinja --local-dir C:/llama-server/models
```

It should show up as `C:\llama-server\models\chat_template.jinja`.

## Modify the Llama.cpp launcher script:

Update the script to be like this:

```
@echo off
setlocal

set "LLAMA_DIR=C:\llama-server\server"
set "MODEL_DIR=C:\llama-server\models"

echo.
echo ========================================
echo  Starting llama.cpp - Qwen 3.8 27B
echo ========================================
echo.
echo Model: Qwen3.8-27B-Q4_K_M.gguf
echo Port:  11434
echo Context: 262144
echo.

"%LLAMA_DIR%\llama-server.exe" ^
  --model "%MODEL_DIR%\Qwen3.8-27B-Q4_K_M.gguf" ^
  --mmproj "%MODEL_DIR%\mmproj-BF16.gguf" ^
  --n-gpu-layers 999 ^
  --ctx-size 262144 ^
  --parallel 1 ^
  --flash-attn on ^
  --cache-type-k q8_0 ^
  --cache-type-v q8_0 ^
  --image-min-tokens 1024 ^
  --batch-size 2048 ^
  --ubatch-size 512 ^
  --jinja ^
  --chat-template-file "%MODEL_DIR%\chat_template.jinja" ^
  --reasoning-format deepseek ^
  --reasoning-effort xhigh ^
  --temp 1.0 ^
  --top-p 0.95 ^
  --top-k 20 ^
  --min-p 0.0 ^
  --presence-penalty 0.0 ^
  --repeat-penalty 1.0 ^
  --host 0.0.0.0 ^
  --port 11434 ^
  --timeout 300 ^
  --sleep-idle-seconds 300

endlocal
```

Notice the changes between the lines with `jinja` and `reasoning-effort`.

We are specifying that it should use the template that we just downloaded.

The fixed template's documentation describes it as a drop-in replacement for Qwen 3.8 and specifically addresses tool-calling and agentic-stalling problems.

### Restart the Llama.cpp server

Do it by killing the process in the Task Manager.

Then, re run it from the Task Scheduler.

## Verify that the tool works

In a PowerShell window, run:

```
$model = "C:\llama-server\models\Qwen3.8-27B-Q4_K_M.gguf"

$body = @{
    model = $model

    messages = @(
        @{
            role = "user"
            content = "You must use the get_current_weather tool to find the weather in Miami."
        }
    )

    tools = @(
        @{
            type = "function"
            function = @{
                name = "get_current_weather"
                description = "Get the current weather for a location."
                parameters = @{
                    type = "object"
                    properties = @{
                        location = @{
                            type = "string"
                            description = "City and state"
                        }
                    }
                    required = @("location")
                }
            }
        }
    )

    tool_choice = "auto"
    max_tokens = 1000
} | ConvertTo-Json -Depth 20

$result = Invoke-RestMethod `
    -Method Post `
    -Uri "http://127.0.0.1:11434/v1/chat/completions" `
    -ContentType "application/json" `
    -Body $body

$result.choices[0] | ConvertTo-Json -Depth 20
```

Success means seeing this:

```
"finish_reason": "tool_calls"
```

and something like:

```
"tool_calls": [
  {
    "type": "function",
    "function": {
      "name": "get_current_weather",
      "arguments": "{\"location\":\"Miami\"}"
    }
  }
]
```

## Getting Duck Duck Go to work

The first option that we have is to have an MCP server to search with Duck Duck Go.

### Verify `uvx` is available

The Duck Duck Go MCP server runs through `uvx`.  Check that it is available in your system.

```
uvx --version
```

If it is not, install it:

```
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Test the Duck Duck Go MCP server by itself

Run this in PowerShell:

```
uvx duckduckgo-mcp-server
```

You should see something like this:

```
DuckDuckGo MCP Server initialized:
  SafeSearch: MODERATE
  Default Region: none
  Search backend: auto
  Fetch backend: httpx
  Allow private URLs: False
```

It will stay waiting to press CTRL + C to cancel if you see that.

### Register Duck Duck Go with Claude Code

Add it as a user-scoped MCP server with this PowerShell command:

```
claude mcp add --transport stdio --scope user ddg-search -- uvx duckduckgo-mcp-server
```

A successful install will return:

```
Added stdio MCP server ddg-search with command:
uvx duckduckgo-mcp-server to user config
```

### Verify the MCP Server is available to Claude

Run this in PowerShell:

```
claude mcp list
```

You should see something like this:

```
ddg-search: uvx duckduckgo-mcp-server - ✔ Connected
```

### Check that Claude Code can use the MCP Server

Open a new terminal and launche Claude Code.

Run the following:

```
/mcp
```

You should see:

```
ddg-search · ✔ connected · 2 tools
```

As long as you see `ddg-search`, it is available.

Test it with Claude by asking it this prompt:

```
Use the DuckDuckGo MCP search tool.

Find the latest llama.cpp release.

Do not use Claude's built-in WebSearch tool.
Do not start from a URL you already know.

Give me:
- release tag
- publication date
- source URL
```

If you see something like this, everything is good:

```
Thought for 29s, called ddg-search 2 times
```

Do a more thorough test:

```
Use the DuckDuckGo MCP search tool.

Find three web pages published within the last 48 hours that discuss
new llama.cpp developments.

Do not use Claude's built-in WebSearch.
Do not begin from URLs you already know.

For each result give me:
- page title
- publication date
- URL
- two-sentence summary
```

A good result will look similar to this:

```
Thought for 17s, called ddg-search 5 times
```

### Usage

To trigger the use of the search tool in your daily work, just make a reference to it in your prompt, like:

```
Use Duck Duck Go to search the web for current reports of Qwen 3.8 tool-calling problems with llama.cpp.
```

## Getting Bing to work

For these two, we need another MCP Server that allows us to search for free.

It is called `heventure-search-mcp` and it supports Google, Bing, Duck Duck Go, or both of the others that we want.


### Install the DDGS for Bing Search

Run this in PowerShell:

```
uvx --from "ddgs[mcp]" ddgs mcp
```

Like the previous one, it will likely stay running until you send the CTRL + C keys.

### Register it globally for Claude Code

Run this in PowerShell:

```
claude mcp add --transport stdio --scope user ddgs-search -- uvx --from "ddgs[mcp]" ddgs mcp
```

### Verify it works

Run this in PowerShell:

```
claude mcp list
```

You should see something like this:

```
ddg-search: uvx duckduckgo-mcp-server - ✔ Connected
ddgs-search: uvx --from ddgs[mcp] ddgs mcp - ✔ Connected
```

### Test Bing

Ask Claude:

```
Use the ddgs-search MCP search_text tool.

  Search for:
  latest llama.cpp release

  Use these parameters:
  backend = bing
  max_results = 5
  region = us-en

  Do not use Claude's built-in WebSearch.
  Do not use DuckDuckGo.
  Do not use Google.

  Tell me how many Bing results were returned first.

  Then list each result's:
  - title
  - URL
  - summary
```

You should get something like this:

```
5 Bing results returned.

1. Title: llama.cpp - Wikipedia
   - URL: https://en.wikipedia.org/wiki/Llama.cpp
   - Summary: Llama.cpp supports many large language models, including Llama, Mistral, Gemma, DeepSeek, gpt-oss, Phi and Qwen. (Related: LM Studio, SGLang, vLLM.)
2. Title: Releases · ggml-org/llama.cpp
   - URL: https://github.com/ggml-org/llama.cpp/releases
   - Summary: Official release feed. Most recent entry (30 Aug, 00:11) — commit b10688 / c589f0e, GPG-verified — notes metal: add fa-vec tunings for M2 (#27940). Website: https://llama.app
3. Title: Llama.cpp - Run LLM Inference in C/C++
   - URL: https://llama-cpp.com/
   - Summary: Llama.cpp (LLaMA C++) allows you to run efficient Large Language Model inference in pure C/C++. Download llama.cpp for Windows, Linux and Mac.
4. Title: llama.cpp release history | Freedom.Tech
   - URL: https://freedom.tech/project/llama-cpp/
   - Summary: Release-history tracker for the C/C++ inference engine that powers most local LLM runners. Notes that Llama.cpp now passes the reasoning_effort parameter through chat templates, enabling fine-grained control over model reasoning depth.
5. Title: Releases · JamePeng/llama-cpp-python
   - URL: https://github.com/JamePeng/llama-cpp-python/releases
   - Summary: Release feed for the llama-cpp-python bindings (v0.3.48-cu131/cu130/cu128 for Windows and Linux, dated 20260821).
   ```