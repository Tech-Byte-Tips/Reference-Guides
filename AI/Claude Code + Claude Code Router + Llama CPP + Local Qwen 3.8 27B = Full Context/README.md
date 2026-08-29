## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to Run Claude Code with a Local Qwen Backend and 262K Context

In this guide we are going to set up a combination of free and open-weight/open-source tools to create a powerful local coding agent on Windows 10/11.

The model inference itself will run locally on your own computer instead of using Anthropic, OpenAI, OpenRouter, xAI, or another hosted inference provider.

This means:

- No per-token hosted-model API fees.
- Your source code and prompts do not need to be sent to a hosted model provider for inference.
- The model can operate entirely from your own GPU.
- You can use Claude Code's agent interface and tools with a local Qwen model.
- We can use Qwen 3.8 27B's full 262,144-token context window.

Keep in mind that Claude Code and the other supporting programs may still perform things such as update checks or other network activity depending on their configuration. This guide is specifically making the **model inference path local**.

The configuration described here was tested using:

| Component | Tested Version |
|---|---|
| Windows | Windows 10 |
| GPU | NVIDIA RTX 5090 32 GB |
| Claude Code | 2.1.247 |
| Claude Code Router | 3.0.22 |
| llama.cpp | b10679 |
| Model | Qwen 3.8 27B Q4_K_M |
| Context | 262,144 tokens |

Newer versions may also work, but command-line options or application behavior can change.

---

## Pre-Requisites

1. **Windows 10 / 11** - This guide is written for native Windows.
2. **NVIDIA RTX 5090** - This particular configuration was tested on an NVIDIA RTX 5090 with 32 GB of VRAM.

   A 32 GB GPU is the recommended target for running this Q4_K_M configuration with a very large 262,144-token context while keeping the model on a single GPU.

   Smaller GPUs may still run the model by using:
   - A smaller context window
   - More aggressive quantization
   - CPU offloading
   - Different KV-cache quantization
   - Multiple GPUs
3. **Internet Connectivity** - Internet access is needed initially to download:
   - Claude Code
   - Claude Code Router
   - llama.cpp
   - The Qwen model
   - The multimodal projector
4. **Recommended Machine Specs**
    | Requirement | Value |
    |---|---|
    | CPU | 8 cores / 16 threads or better |
    | RAM | 16 GB minimum, 32 GB recommended |
    | GPU | NVIDIA GPU with 32 GB VRAM recommended for this exact configuration |
    | Storage | At least 30-40 GB free |
5. **Python 3.10+** - Your system must already have Python 3.10+ installed.
6. **Git for Windows** - Git for Windows is recommended because Claude Code uses Bash-based tooling for many coding operations.

   Download it from:

   ```
   https://git-scm.com/download/win
   ```
7. **Recent NVIDIA Drivers** - Make sure your installed NVIDIA driver supports the CUDA version used by the llama.cpp release you download.

### What we will be setting up:

1. **Local Llama CPP server**

   llama.cpp will serve as the backend inference API for our coding agent.  We will run `llama-server.exe` directly on Windows.  It exposes an OpenAI-compatible HTTP API that Claude Code Router can communicate with.

2. **Local Qwen 3.8 27B model**

   Qwen 3.8 27B is an open-weight language model.  We will use a GGUF version of the model so that it can run through llama.cpp.  The quantization used in this guide is:

   ```
   Q4_K_M
   ```

   This provides a good balance between:

   - Model quality
   - VRAM requirements
   - Performance

3. **Multi-Modal Projector**

   `mmproj-BF16.gguf` is the multimodal projector provides the visual component used alongside Qwen.

   Think of it like this:

   ```
                           ┌────────────────────┐
   Text ─────────────────► │                    │
                           │   Qwen 3.8 27B     │──► Response
                           │   Q4_K_M.gguf      │
                           │                    │
   Image ─► mmproj ──────► │                    │
                           └────────────────────┘
   ```

   The `mmproj` converts visual input into representations that the Qwen language model can process.  Image capability will be enabled in llama.cpp and Claude Code Router.  Current llama.cpp releases also contain experimental video-input capabilities, but this guide does **not** verify video input.

4. **Claude Code Router**

   Claude Code Router, or CCR, is the compatibility and routing layer between Claude Code and llama.cpp.

   Claude Code expects an Anthropic-style API.

   llama.cpp exposes an OpenAI-compatible API.

   CCR performs the translation between them.

   Conceptually:

    ```
    +------------------+
    |   Claude Code    |
    |  CLI / Agent UI  |
    +--------+---------+
             |
             | Anthropic-style requests
             v
    +--------------------------+
    |   Claude Code Router     |
    |                          |
    | - API translation        |
    | - Model routing          |
    | - Tool-call conversion   |
    | - Response conversion    |
    +------------+-------------+
                 |
                 | OpenAI-compatible API
                 v
    +--------------------------+
    |      Llama.cpp Server    |
    |   localhost:11434        |
    +------------+-------------+
                 |
                 v
    +--------------------------+
    |   Local Qwen 3.8 27B     |
    |      GGUF Model          |
    +--------------------------+
    ```
   
   Response flow goes back upward:

   Qwen -> Llama.cpp -> Claude Code Router -> Claude Code

5. **Claude Code**

   Claude Code is Anthropic's terminal-based coding-agent application.

   Claude Code provides the scaffolding surrounding the language model, including capabilities such as:

   - Reading files
   - Editing files
   - Running commands
   - Searching projects
   - Managing tasks
   - Calling tools
   - Maintaining conversation state
   - Working across an entire project

   In this configuration, Claude Code remains the agent interface, but the actual model answering its requests is our local Qwen model.

## Preparing the environment

1. **Claude Code folder structure**

   When you install Claude Code, it will create this folder and you will need to be aware of it and a crucial file that helps you to configure it properly.

   ```
   C:\Users\<user>\.claude
   │
   │   Claude Code's per-user configuration and runtime-data directory.
   │   On Windows, ~/.claude resolves to %USERPROFILE%\.claude.
   │
   ├── backups/
   │      Backup copies of Claude Code's global application-state file
   │      (~/.claude.json). Claude creates these when it rewrites or
   │      migrates that file. Normally the five newest backups are retained,
   │      plus a backup of a version Claude could not parse.
   │
   ├── cache/
   │      General-purpose Claude Code cache files. For example,
   │      cache\changelog.md contains a locally cached copy of the Claude
   │      Code changelog used by /release-notes. Other small feature caches
   │      may appear here. These are generally regenerable.
   │
   ├── downloads/
   │      Temporary download/staging directory used primarily by the native
   │      Claude Code installer and updater. On Windows, downloaded
   │      claude.exe versions may temporarily be placed here before the
   │      installation/update process installs them.
   │
   ├── file-history/
   │      Per-session snapshots of files before Claude modifies them.
   │      These snapshots support Claude Code's checkpoint/rewind/restore
   │      functionality. Deleting this directory removes the ability to
   │      restore files from old Claude Code checkpoints.
   │
   ├── paste-cache/
   │      Storage for large blocks of text pasted into Claude Code.
   │      Instead of embedding some large pasted content repeatedly in
   │      interactive state, Claude can keep the content here and reference
   │      it from the corresponding session/prompt history.
   │
   ├── plans/
   │      Plan files generated by Claude Code while using Plan Mode.
   │      These represent plans Claude created during sessions rather than
   │      normal source-code files belonging to your projects.
   │
   ├── plugins/
   │      Claude Code's installed-plugin infrastructure.
   │
   │      This can contain:
   │        • cloned plugin marketplaces
   │        • installed/versioned plugin packages
   │        • plugins\cache\
   │        • plugin manifests and metadata
   │        • persistent per-plugin data under plugins\data\
   │
   │      This is NOT merely a disposable cache. Deleting it can remove
   │      installed plugins and plugin state.
   │
   ├── projects/
   │      The main persistent storage area for Claude Code conversations.
   │      Claude creates a directory representing each project/workspace
   │      from which Claude Code has been used.
   │
   │      It can contain:
   │        • <session-id>.jsonl
   │             Full conversation transcript for a session.
   │
   │        • <session-id>\subagents\
   │             Conversation transcripts from subagents.
   │
   │        • <session-id>\tool-results\
   │             Large tool outputs that Claude stored separately instead
   │             of embedding directly into the main JSONL transcript.
   │
   │        • memory\
   │             Claude Code Auto Memory for that project.
   │
   │      The JSONL transcripts can contain prompts, Claude's responses,
   │      tool calls, command output, and file contents read by tools.
   │
   ├── session-env/
   │      Runtime/environment metadata associated with individual Claude
   │      Code sessions. Claude uses this to retain information about the
   │      execution environment associated with a session.
   │
   ├── sessions/
   │      Small marker/state files representing CURRENTLY RUNNING Claude
   │      Code sessions.
   │
   │      Claude uses these to detect:
   │        • concurrent sessions
   │        • whether another Claude process/session is active
   │        • sessions that terminated abnormally
   │
   │      A session marker is normally removed when that session exits
   │      cleanly. Leftovers from crashes are cleared on a later launch.
   │
   ├── tasks/
   │      Per-session structured task lists created by Claude Code's task
   │      tools. These hold Claude's internal task/work tracking state,
   │      such as tasks and relationships/dependencies between them.
   │
   └── settings.json
         Claude Code's USER-SCOPE configuration file.

         Settings here apply to Claude Code across all of your projects
         unless overridden by a project/local/managed setting.

         It can configure things such as:
           • permissions
           • environment variables
           • hooks
           • enabled plugins
           • model-related/default behavior
           • sandbox settings
           • cleanupPeriodDays
           • UI/behavior preferences
           • other Claude Code features
   ```

2. **Claude Code Router folder structure**

   **NOTE: We will NOT need to touch any files in this folder.  All configurations will be made in the UI, but might as well understand what is there.**

   ```
   C:\Users\<user>\AppData\Roaming\claude-code-router\
   │
   ├── config.sqlite
   │      Main CCR configuration database.
   │
   │      This is now the authoritative configuration store for things
   │      configured through the CCR GUI, including providers, models,
   │      routing, profiles, etc.
   │
   ├── config.sqlite-wal
   │      SQLite Write-Ahead Log.
   │      Exists while SQLite has pending/recent database activity.
   │
   ├── config.sqlite-shm
   │      SQLite shared-memory file used together with the WAL.
   │
   ├── gateway.config.json
   │      GENERATED runtime configuration used by the CCR gateway.
   │
   │      Think of this as:
   │
   │          config.sqlite
   │              ↓
   │          CCR generates runtime settings
   │              ↓
   │          gateway.config.json
   │              ↓
   │          CCR Gateway
   │
   ├── service.json
   │      Information about the running/background CCR service,
   │      including service state and its private/internal token.
   │
   ├── app-data\
   │      Runtime databases and supporting data.
   │
   │      May contain things such as:
   │        • API-key information
   │        • request logs
   │        • usage information
   │        • certificates
   │        • other runtime databases/files
   │
   ├── profiles\
   │      Per-agent / per-profile configuration.
   │
   │      For example, the profile you created for:
   │
   │         Qwen 3.8 27B
   │
   │      can cause CCR to generate isolated configuration/environment
   │      information here.
   │
   └── bin\
         Launch wrappers generated by CCR.

         On your Windows installation this is where you found:

             ccr-app.cmd

         These wrappers prepare the environment and launch the selected
         agent/profile.
   ```

3. **The Llama.cpp folder structure**

   We are going to download Llama.cpp in a folder in our computer and we are going to download the models that we will be serving in there too.  This makes is easy to track and find when any changes are necessary.

    ```
    C:/llama-server                     <-- The root of the Llama.cpp server files
    ├── models/                         <-- This folder contains the model files
          ├── Qwen3.8-27B-Q4_K_M.gguf   <-- The Base Qwen 3.8 27B model
          └── mmproj-BF16.gguf          <-- The Multi-Modal Projector file
    └── server/                         <-- Will contain the actual server files
    ```

## Downloading the Model and Projector files from Huggingface

1. These are the necessary files from Huggingface that we need to download.  Copy these commands to put the in the proper place or just download them to the `C:\llama-server\models` folder.

   | What is it? | Huggingface URL |
   |-|-|
   | Qwen 3.8 27B Q4_K_M | https://huggingface.co/bartowski/Qwen3.8-27B-GGUF/resolve/main/Qwen3.8-27B-Q4_K_M.gguf?download=true |
   | Multi-Modal Projector | https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/resolve/main/mmproj-BF16.gguf?download=true |

    Install the Huggingface Hub if you don't have it.

    ```
    pip install -U huggingface_hub
    ```

    Download the Qwen 3.8 27B model.

    ```
    hf download bartowski/Qwen3.8-27B-GGUF Qwen3.8-27B-Q4_K_M.gguf --local-dir C:/llama-server/models
    ```

    Download the Multi-Modal Projector.

    ```
    hf download unsloth/Qwen3.8-27B-GGUF mmproj-BF16.gguf --local-dir C:/llama-server/models
    ```

## Downloading the Llama.cpp server files

1. Go to the official GitHub repository release files:

   ```
   https://github.com/ggml-org/llama.cpp/releases
   ```

   Download the following assets to this folder:

   ```
   C:/llama-server/server
   ```

   | File Name | URL | Notes |
   |-|-|-|
   | Windows x64 (CUDA 13) | https://github.com/ggml-org/llama.cpp/releases/download/b10679/llama-b10679-bin-win-cuda-13.3-x64.zip | The core application files |
   | CUDA 13.3 DLLs | https://github.com/ggml-org/llama.cpp/releases/download/b10679/cudart-llama-bin-win-cuda-13.3-x64.zip | The CUDA libraries |

   Extract the files there and delete the zip files when done.

## Installing Claude Code

1. Open a PowerShell window and run the following command to install Claude Code:

   ```
   irm https://claude.ai/install.ps1 | iex
   ```

   This will create the folder that we mentioned above for Claude Code.

2. Create the settings.json file for Claude Code in the following folder:

   ```
   C:\Users\<user>\.claude
   ```

   Put the following contents:

   ```
   {
     "env": {
       "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
       "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
       "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1",
       "DISABLE_TELEMETRY": "1"
     },
     "autoUpdatesChannel": "latest",
     "theme": "dark"
   }
   ```

   NOTE: The file is minimal on purpose.  The configurations flow from Claude Code Router.

## Installing the Claude Code Router

Visit their official GitHub repository release files:

```
https://github.com/musistudio/claude-code-router/releases
```

Download the installer file:

```
https://github.com/musistudio/claude-code-router/releases/download/v3.0.22/Claude-Code-Router_3.0.22.exe
```

Run the installer and follow the instructions.

## Configuring Claude Code Router

1. Run the Router

2. In the `Choose Provider` option:

    | Property | Value |
    |-|-|
    | Preset | Custom API Provider |
    | Name | Llama CPP |
    | API Endpoint | http://localhost:11434/v1 |

   Click on `Next Step`.

3. In the `Choose API Key`:

    | Property | Value |
    |-|-|
	  | API Key | local |

   Click on `Next Step`.

4. The existing model should have been recognized and added.  Configure as follows:

    | Property | Value | Notes |
    |-|-|-|
    | Context Window | 262144	| Full context
    | All Pricing Values | 0	| We don't care about pricing estimates
    | Reasoning Level | High | If fails use Xtra High or Medium
    | Fast Mode | Off	| Until we get everything working properly
    | Web Search | Off	| We don't have a web search provider attached
    | Image | On	| We are multimodal capable

   Click on `Next Step`.

5. Open the `Advanced` menu and change the following selections in Protocols Details:

   * Check OpenAI Chat
   * Uncheck everything else

   Leave the other settings as they are.  Click the `Check Connection` button then `Start check`.

   We should see the request coming to the terminal window of Llama-cpp.  Finally we should see a message like:

   ```
   Check results:	1 Available | 0 Unavailable
   Available Models:
   C:/llama-server/models/Qwen3.8-27B-Q4_K_M.gguf
   Connection verified
   OpenAI  Chat
   ```

   Click Close then `Next Step`.

6. Configure the agent like this:

    | Property | Value |
    |-|-|
    | Agent | Claude Code
    | Profile Name | Qwen 3.8 27B
    | Effect Scope | Only opened from CCR
    | Entry Mode | CLI & App
    | Default Model | Make sure to select the model from the dropdown
    | Fable Model | Keep Claude Code default
    | Opus Model | Keep Claude Code default
    | Sonnet Model | Keep Claude Code default
    | Haiku Model | Keep Claude Code default

   Don't touch the `Advanced` settings.  Click `Next Step`.

7. Write down the endpoint:

   ```
	 http://localhost:3456
   ```

   Click on `Let's Start`.

## Create a custom Claude Code launcher script

1. Open the folder where Claude Code is usually found:

   ```
   C:\Users\<user>\.local\bin
   ```

   If it is not found there, find out where it is by running:

   ```
   where claude.exe
   ```

2. In there, create a file named `claude-qwen.cmd` with the following contents:

   **NOTE: Make sure to change <user> to the appropriate user value.  Also check that all of the files referenced in the script are in the appropriate folders or change the paths.**

   ```
   @echo off
   setlocal

   set "CCR_TOKEN_FILE=%APPDATA%\claude-code-router\bin\ccr-claude-code-wif-token-default-claude-code.txt"
   set "CCR_MODEL=Llama CPP/C:/llama-server/models/Qwen3.8-27B-Q4_K_M.gguf"

   if not exist "%CCR_TOKEN_FILE%" (
       echo ERROR: CCR credential file was not found:
       echo %CCR_TOKEN_FILE%
       exit /b 1
   )

   set /p ANTHROPIC_API_KEY=<"%CCR_TOKEN_FILE%"

   if not defined ANTHROPIC_API_KEY (
       echo ERROR: CCR credential file is empty.
       exit /b 1
   )

   rem Use CCR as the Anthropic-compatible gateway.
   set "ANTHROPIC_BASE_URL=http://127.0.0.1:3456"

   rem IMPORTANT: Do not allow the old AUTH_TOKEN path to override API_KEY.
   set "ANTHROPIC_AUTH_TOKEN="

   rem Use the actual CCR provider/model identifier.
   set "ANTHROPIC_MODEL=%CCR_MODEL%"
   set "ANTHROPIC_SMALL_FAST_MODEL=%CCR_MODEL%"

   rem Allow CCR's model discovery support.
   set "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1"

   rem Enable Maximum Qwen 3.8 27B context
   set "CLAUDE_CODE_MAX_CONTEXT_TOKENS=262144"

   "C:\Users\<user>\.local\bin\claude.exe" %*

   set "CLAUDE_EXIT_CODE=%ERRORLEVEL%"
   endlocal & exit /b %CLAUDE_EXIT_CODE%
   ```

## Create a custom Llama.cpp launcher script

1. Navigate to the folder where you have Claude Code:

   ```
   C:\Users\<user>\.local\bin
   ```

2. Create a file named `llama-qwen.cmd` with the following contents:

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

   NOTE: You can change the reasoning effort with the following values, depending on how you feel it works best for you **[default = medium]**:

   `default`, `minimal`, `low`, `medium`, `high`, `xhigh`, and `max`

## Testing that Qwen is accessible through Llama.cpp

1. Open a new PowerShell window and start the Llama.cpp server:

   ```
   llama-qwen
   ```

   This should start the Llama.cpp server and you can follow changes on the PowerShell window.

2. Open a new PowerShell window and type the following command to check if the model is available:

   ```
   Invoke-RestMethod -Uri "http://localhost:11434/v1/models" -Method Get | ConvertTo-Json -Depth 20 | Out-Host
   ```

   We should get a reply similar to this:

   ```
   {
    "models":  [
                   {
                       "name":  "C:\\llama-server\\models\\Qwen3.8-27B-Q4_K_M.gguf",
                       "model":  "C:\\llama-server\\models\\Qwen3.8-27B-Q4_K_M.gguf",
                       "modified_at":  "",
                       "size":  "",
                       "digest":  "",
                       "type":  "model",
                       "description":  "",
                       "tags":  [
                                    ""
                                ],
                       "capabilities":  [
                                            "completion",
                                            "multimodal"
                                        ],
                       "parameters":  "",
                       "details":  {
                                       "parent_model":  "",
                                       "format":  "gguf",
                                       "family":  "",
                                       "families":  [
                                                        ""
                                                    ],
                                       "parameter_size":  "",
                                       "quantization_level":  ""
                                   }
                   }
               ],
    "object":  "list",
    "data":  [
                 {
                     "id":  "C:\\llama-server\\models\\Qwen3.8-27B-Q4_K_M.gguf",
                     "aliases":  [
                                     "C:\\llama-server\\models\\Qwen3.8-27B-Q4_K_M.gguf"
                                 ],
                     "tags":  [

                              ],
                     "object":  "model",
                     "created":  1787976473,
                     "owned_by":  "llamacpp",
                     "meta":  {
                                  "vocab_type":  true,
                                  "n_vocab":  248320,
                                  "n_ctx":  262144,
                                  "n_ctx_train":  262144,
                                  "n_embd":  5120,
                                  "n_params":  27320697856,
                                  "size":  17761542144,
                                  "ftype":  "Q4_K - Medium"
                              }
                 }
             ]
   }
   ```

   This lets us know that our model is being served and its configuration.

3. Enter the following command to check if the model can reply to our requests:

   NOTE: When you first send a prompt, the Llama.cpp server will load the model into memory and then process the prompt.  The first time is always slower to reply.

   ```
   curl -Method POST http://localhost:11434/v1/chat/completions -Headers @{ "Content-Type"="application/json" } -Body '{ "model": "/models/Qwen3.8-27B-Q4_K_M.gguf", "messages": [{"role":"user","content":"Hello"}] }'
   ```

   We should get something like this:

   ```
   StatusCode        : 200
   StatusDescription : OK
   Content           : {"choices":[{"finish_reason":"stop","index":0,"message":{"role":"assistant","content":"Hello! How's your day going? Is there something I can help you with today?","reasoning_content":"The user said \"...
   RawContent        : HTTP/1.1 200 OK
                      Access-Control-Allow-Origin:
                      Keep-Alive: timeout=5, max=100
                      Content-Length: 919
                      Content-Type: application/json; charset=utf-8
                      Server: llama.cpp

                      {"choices":[{"finish_reason":"s...
   Forms             : {}
   Headers           : {[Access-Control-Allow-Origin, ], [Keep-Alive, timeout=5, max=100], [Content-Length, 919], [Content-Type, application/json; charset=utf-8]...}
   Images            : {}
   InputFields       : {}
   Links             : {}
   ParsedHtml        : mshtml.HTMLDocumentClass
   RawContentLength  : 919
   ```

   As we can see, the `Content` field contains the thought process of the model and its reply.

## Start Claude Code

To start Claude Code, we use the launcher script that we created previously.

1. Open a new PowerShell window and run:

   ```
   claude-qwen
   ```

## Start using your AI agent and enjoy!

The first time that you interact with the model or any time that you interact after a while of no interaction, it will be a little slow because Llama.cpp will have to load the model again.  It offloads the model when not in use to not consume all your RAM if you don't need it.

If you want to run the Llama.cpp server without having a Window open start it like this:

```
powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c llama-qwen' -WindowStyle Hidden"
```