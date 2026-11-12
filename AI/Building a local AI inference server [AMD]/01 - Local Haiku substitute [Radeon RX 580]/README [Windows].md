# Please Support This Project!

I would appreciate a donation if you found it useful.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a Bitcoin donation to the following address:

```text
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to Run a Local Haiku Substitute Using a Radeon RX 580 [8GB] (Windows 10)

Tech Byte Tips brings you another tutorial to breathe new life into old hardware for modern AI workloads.

---

# The Goal

In this tutorial, we are going to use an old computer with an AMD Radeon RX 580 to run a local substitute for Claude Haiku.

By the end of this guide, you will have a dedicated Windows 10 AI inference server running Qwen3-4B through `llama.cpp` and exposing an OpenAI-compatible API endpoint that can later be integrated into Claude Code Router or other AI tooling.

---

# Pre-Requisites

Here are the requirements used in this guide.

## Hardware

The hardware used for this tutorial is an old gaming PC from 2012.

| Part | Details |
|--------|--------|
| **Motherboard** | Gigabyte Z77-DS3H |
| **CPU** | Intel Core i7-3770K |
| **RAM** | 32 GB DDR3-1600 |
| **PSU** | 750W Gold |
| **GPU** | AMD Radeon RX 580 8GB |
| **Disk** | 512GB mSATA SSD |

This hardware is more than sufficient for serving a small modern AI model.

## Operating System

| Operating System | Version |
|-----------------|---------|
| Windows | Windows 10 22H2 |

Windows 10 is used throughout this guide.

---

# Preparing Windows

## Install AMD Drivers

Download and install the latest AMD Adrenalin drivers that support Polaris GPUs such as the RX 580.

After installation, reboot the machine.

---

## Install Git

Download and install Git for Windows.

Open PowerShell and verify:

```powershell
git --version
```

Example:

```text
git version 2.50.1.windows.1
```

---

## Install Python

Download and install Python 3.

During installation make sure to check:

```text
Add Python to PATH
```

Verify:

```powershell
python --version
```

Example:

```text
Python 3.13.2
```

---

# Verifying the GPU

Open Task Manager and on the Performance tab you should see the GPU0 as Radeon RX 580 Series.

Open Device Manager and you should see the GPU there.  In my case, I have the integrated GPU and the Radeon.

1. Intel(R) HD Graphics 4000
2. AMD Radeon RX 580 Series

The RX 580 is the GPU we will use for inference.

---

# Creating the Folder Structure

Create our working directories:

```powershell
mkdir C:\LLM
mkdir C:\LLM\models
mkdir C:\LLM\models\haiku
mkdir C:\LLM\logs
mkdir C:\LLM\scripts
```

Expected structure:

```text
C:\LLM
├── llama.cpp
├── models
│   └── haiku
├── logs
└── scripts
```

---

# Downloading llama.cpp

## Download a Prebuilt Release

Download the latest [Vulkan Windows](https://github.com/ggml-org/llama.cpp/releases/download/b12292/llama-b12292-bin-win-vulkan-x64.zip) release of llama.cpp from GitHub.

Extract the archive to:

```text
C:\LLM\llama.cpp
```

The directory should contain executables such as:

```text
llama-cli.exe
llama-server.exe
llama-bench.exe
```

---

# Validating GPU Support

Open PowerShell:

```powershell
cd C:\LLM\llama.cpp
```

List available devices:

```powershell
.\llama-cli.exe --list-devices
```

You should see something similar:

```text
Available devices:

Vulkan0: AMD Radeon RX 580 Series
```

If the RX 580 appears, Vulkan support is functioning correctly.

---

# Testing the GPU

Before downloading a larger model, let's make sure inference works correctly.

---

## Install Hugging Face CLI

Install the Hugging Face tools:

```powershell
python -m pip install huggingface_hub
```

Verify:

```powershell
hf --help
```

---

## Create a Test Model Directory

```powershell
mkdir C:\LLM\models\test
cd C:\LLM\models\test
```

---

## Download a Small Test Model

```powershell
hf download `
    bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF `
    Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf `
    --local-dir .
```

Verify:

```powershell
dir
```

---

## Test GPU Inference

Run:

```powershell
C:\LLM\llama.cpp\llama-cli.exe `
    -m C:\LLM\models\test\Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -p "Write a hello world program in Python."
```

Expected output:

```text
> Write a hello world program in Python.

print("Hello, World!")
```

You should also see token generation statistics.

Example:

```text
Prompt: 180 t/s
Generation: 100 t/s
```

If you received a valid response, the GPU is working correctly.

Press:

```text
CTRL + C
```

to exit.

---

## Remove the Test Model

```powershell
cd C:\LLM\models
Remove-Item `
    -Path C:\LLM\models\test `
    -Recurse `
    -Force
```

Current structure:

```text
models
└── haiku
```

---

# Downloading Our Haiku Model

We obviously do not have access to the real Anthropic Haiku model weights.

Instead, we will use **Qwen3-4B-Q4_K_M**, which performs exceptionally well on older GPUs and comfortably fits inside 8GB of VRAM.

## Why Qwen3-4B?

1. Significantly stronger than older small Qwen2.5 models
2. Fits comfortably in 8GB VRAM
3. Strong reasoning capability
4. Excellent tool use
5. Fast response times
6. Makes a great Haiku substitute

---

## Download the Model

```powershell
cd C:\LLM\models\haiku
```

Download:

```powershell
hf download `
    Qwen/Qwen3-4B-GGUF `
    Qwen3-4B-Q4_K_M.gguf `
    --local-dir .
```

Verify:

```powershell
dir
```

Expected:

```text
Qwen3-4B-Q4_K_M.gguf
```

---

# Testing Our Haiku Model

## Launch the Model

```powershell
C:\LLM\llama.cpp\llama-server.exe `
    -m C:\LLM\models\haiku\Qwen3-4B-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -t 4 `
    -tb 4 `
    --ctx-size 32768 `
    --host 0.0.0.0 `
    --port 8002
```

Leave this PowerShell window open.

---

## Test Model Availability

Open another PowerShell window:

```powershell
Invoke-RestMethod `
    -Uri http://localhost:8002/v1/models
```

A JSON response should be returned.

---

## Test Local Inference

```powershell
C:\LLM\llama.cpp\llama-cli.exe `
    -m C:\LLM\models\haiku\Qwen3-4B-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -p "Explain what a Python dictionary is."
```

If the model responds correctly, everything is working.

---

## Test the OpenAI-Compatible Endpoint

```powershell
$body = @{
    messages = @(
        @{
            role = "user"
            content = "Write a Python hello world program."
        }
    )
} | ConvertTo-Json -Depth 10
```

Send the request:

```powershell
Invoke-RestMethod `
    -Uri "http://localhost:8002/v1/chat/completions" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

You should receive a valid:

```text
chat.completion
```

response.

---

## Confirm from a Browser

Open:

```text
http://localhost:8002/v1/models
```

or

```text
http://<machine-ip>:8002/v1/models
```

You should see JSON containing the available model.

Press:

```text
CTRL + C
```

to stop the server.

---

# Making It Production Ready

Now that everything works, let's make the machine function as a permanent AI inference server.

---

## Create the Startup Script

Create:

```text
C:\LLM\scripts\start-haiku.bat
```

Contents:

```bat
@echo off

C:\LLM\llama.cpp\llama-server.exe ^
  -m C:\LLM\models\haiku\Qwen3-4B-Q4_K_M.gguf ^
  -dev Vulkan0 ^
  -ngl 999 ^
  -t 4 ^
  -tb 4 ^
  --ctx-size 32768 ^
  --parallel 1 ^
  --sleep-idle-seconds 300 ^
  --host 0.0.0.0 ^
  --port 8002 >> C:\LLM\logs\haiku.log 2>&1
```

Save the file.

---

## Test the Script

```powershell
C:\LLM\scripts\start-haiku.bat
```

Verify:

```text
http://localhost:8002/v1/models
```

Responds successfully.

Press:

```text
CTRL + C
```

to stop it.

---

# Creating an Automatic Startup Service

Windows does not include systemd, so we will use Task Scheduler.

---

## Open an Elevated PowerShell

Create the scheduled task:

```powershell
$Action = New-ScheduledTaskAction `
    -Execute "C:\LLM\scripts\start-haiku.bat"

$Trigger = New-ScheduledTaskTrigger `
    -AtStartup

Register-ScheduledTask `
    -TaskName "Haiku Server" `
    -Action $Action `
    -Trigger $Trigger `
    -RunLevel Highest `
    -User "SYSTEM"
```

---

## Start the Task Manually

```powershell
Start-ScheduledTask `
    -TaskName "Haiku Server"
```

---

## Verify the Task

Open:

```powershell
Get-ScheduledTask `
    -TaskName "Haiku Server"
```

or simply browse to:

```text
http://localhost:8002/v1/models
```

If the API responds, the service is active.

---

## Reboot Validation

Restart Windows:

```powershell
shutdown /r /t 0
```

After reboot:

```text
http://localhost:8002/v1/models
```

should immediately respond.

---

# Checking RAM Usage

Open:

```text
Task Manager
```

Navigate to:

```text
Performance → Memory
```

and

```text
Performance → GPU
```

You should observe approximately:

| Resource | Usage |
|-----------|---------|
| VRAM | 7 GB |
| RAM | ~4 GB |
| CPU | Negligible impact |

The exact amount depends on active requests and context size.

---

# Success!

If you made it this far, your local AI server is successfully running on a Windows 10 machine powered by an aging Radeon RX 580.

Your server now exposes an OpenAI-compatible API endpoint and can serve as a local Haiku substitute for tools such as:

- Claude Code Router
- Claude Code
- Open WebUI
- Continue.dev
- Cline
- Roo Code
- Aider
- Custom applications

In the next step of the series, we will add a second GPU and deploy a larger Sonnet-class model alongside our Haiku substitute.