# Please Support This Project!

I would appreciate a donation if you found it useful.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a Bitcoin donation to the following address:

```text
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to Run a Local Sonnet Substitute Using a Radeon RX 7900 XT [20GB] on Windows 10

Tech Byte Tips brings you another tutorial to breathe new life into old hardware for modern AI workloads.

---

# The Goal

In this tutorial, we are going to use an older PC equipped with an AMD Radeon RX 7900 XT to run a local Sonnet substitute for Claude Code.

By the end of this guide, you will have a Windows 10 AI inference server exposing an OpenAI-compatible API endpoint backed by Qwen3.6-27B.

---

# Pre-Requisites

## Hardware

The example hardware used in this guide:

| Part | Details |
|--------|--------|
| **Motherboard** | Gigabyte Z77-DS3H |
| **CPU** | Intel Core i7-3770K |
| **RAM** | 32GB DDR3-1600 |
| **PSU** | 750W Gold |
| **GPU** | AMD Radeon RX 7900 XT 20GB |
| **Storage** | 512GB SSD |

## Operating System

| Operating System | Version |
|------------------|----------|
| Windows | Windows 10 22H2 |

---

# Preparing Windows

## Install AMD Drivers

Download and install the latest AMD Adrenalin drivers for the RX 7900 XT.

Reboot after installation.

---

## Install Git

Download and install Git for Windows.

Verify:

```powershell
git --version
```

Example:

```text
git version 2.50.1.windows.1
```

---

## Install Python

Install Python 3 and check:

```text
Add Python to PATH
```

during installation.

Verify:

```powershell
python --version
```

---

# Verify the GPU

Open PowerShell:

```powershell
Get-CimInstance Win32_VideoController |
    Select Name, DriverVersion
```

Example:

```text
Name                               DriverVersion
----                               -------------
AMD Radeon RX 7900 XT              32.x.x.x
Intel(R) HD Graphics 4000          10.x.x.x
```

The RX 7900 XT is the device we will use for inference.

---

# Create the Folder Structure

Create the working folders:

```powershell
mkdir C:\LLM
mkdir C:\LLM\models
mkdir C:\LLM\models\sonnet
mkdir C:\LLM\logs
mkdir C:\LLM\scripts
```

Expected structure:

```text
C:\LLM
├── llama.cpp
├── logs
├── models
│   └── sonnet
└── scripts
```

---

# Downloading llama.cpp

Download the latest Windows release of llama.cpp and extract it to:

```text
C:\LLM\llama.cpp
```

You should have files such as:

```text
llama-cli.exe
llama-server.exe
llama-bench.exe
```

---

# Validating Vulkan Detection

Open PowerShell:

```powershell
cd C:\LLM\llama.cpp
```

Run:

```powershell
.\llama-cli.exe --list-devices
```

Expected output:

```text
Available devices:

Vulkan0: AMD Radeon RX 7900 XT
```

This confirms Vulkan support is functioning correctly.

---

# Benchmarking GPU Detection

This quick test ensures llama.cpp can communicate with the GPU.

List available devices:

```powershell
.\llama-bench.exe --list-devices
```

Example:

```text
Available devices:
  Vulkan0: AMD Radeon RX 7900 XT
```

Run:

```powershell
.\llama-bench.exe -dev Vulkan0
```

You may receive an error similar to:

```text
failed to open GGUF file
```

This is expected because the benchmark model is not present.

The important part is that llama.cpp successfully found and initialized the GPU.

---

# Downloading and Testing a Small Model

Before downloading a 27B model, let's validate inference.

## Install Hugging Face CLI

```powershell
python -m pip install huggingface_hub
```

Verify:

```powershell
hf --help
```

---

## Create Test Directory

```powershell
mkdir C:\LLM\models\test
cd C:\LLM\models\test
```

---

## Download Tiny Test Model

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

## Test Inference

```powershell
C:\LLM\llama.cpp\llama-cli.exe `
    -m C:\LLM\models\test\Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -p "Write a hello world program in Python."
```

Expected output:

```text
print("Hello, World!")
```

If this works, the GPU is functioning correctly.

Exit with:

```text
CTRL + C
```

---

## Remove Test Model

```powershell
Remove-Item `
    -Path C:\LLM\models\test `
    -Recurse `
    -Force
```

Current structure:

```text
models
└── sonnet
```

---

# Downloading Our Sonnet Model

We obviously do not have access to Anthropic Sonnet model weights.

Instead, we will use:

```text
Qwen3.6-27B-Q4_K_M.gguf
```

as a Sonnet substitute.

## Why Qwen3.6-27B?

- Excellent coding performance
- Strong reasoning ability
- Reliable tool usage
- Good multi-step planning
- Works well with agent workflows
- Fits within the RX 7900 XT's 20GB VRAM

---

## Download the Model

```powershell
cd C:\LLM\models\sonnet
```

Download:

```powershell
hf download `
    bartowski/Qwen_Qwen3.6-27B-GGUF `
    Qwen_Qwen3.6-27B-Q4_K_M.gguf `
    --local-dir .
```

Rename:

```powershell
Rename-Item `
    Qwen_Qwen3.6-27B-Q4_K_M.gguf `
    Qwen3.6-27B-Q4_K_M.gguf
```

Verify:

```powershell
dir
```

Expected:

```text
Qwen3.6-27B-Q4_K_M.gguf
```

---

# Testing Sonnet

## Launch the Server

```powershell
C:\LLM\llama.cpp\llama-server.exe `
    -m C:\LLM\models\sonnet\Qwen3.6-27B-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -t 6 `
    -tb 6 `
    --ctx-size 49152 `
    --host 0.0.0.0 `
    --port 8003
```

**Important:** Through testing, `49152` was found to be a practical maximum context value before performance begins to degrade significantly.

Leave this PowerShell window running.

---

## Verify Model Availability

Open a second PowerShell window:

```powershell
Invoke-RestMethod `
    -Uri http://localhost:8003/v1/models
```

You should receive model metadata.

---

## Test Inference

```powershell
C:\LLM\llama.cpp\llama-cli.exe `
    -m C:\LLM\models\sonnet\Qwen3.6-27B-Q4_K_M.gguf `
    -dev Vulkan0 `
    -ngl 999 `
    -t 6 `
    -tb 6 `
    -p "Explain what a Python dictionary is."
```

If the model responds successfully, inference is working properly.

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

Submit the request:

```powershell
Invoke-RestMethod `
    -Uri "http://localhost:8003/v1/chat/completions" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

If you receive a response containing:

```text
chat.completion
```

everything is working correctly.

---

## Confirm from a Browser

Open:

```text
http://localhost:8003/v1/models
```

You should see the model metadata returned by the server.

Stop the server:

```text
CTRL + C
```

---

# Making It Production Ready

Now we will configure the machine to act as a permanent inference server.

---

## Create Startup Script

Create:

```text
C:\LLM\scripts\start-sonnet.bat
```

Contents:

```bat
@echo off

C:\LLM\llama.cpp\llama-server.exe ^
  -m C:\LLM\models\sonnet\Qwen3.6-27B-Q4_K_M.gguf ^
  -dev Vulkan0 ^
  -ngl 999 ^
  -t 6 ^
  -tb 6 ^
  --ctx-size 49152 ^
  --parallel 1 ^
  --sleep-idle-seconds 300 ^
  --host 0.0.0.0 ^
  --port 8003 >> C:\LLM\logs\sonnet.log 2>&1
```

---

## Test the Startup Script

```powershell
C:\LLM\scripts\start-sonnet.bat
```

Verify:

```text
http://localhost:8003/v1/models
```

works correctly.

Exit with:

```text
CTRL + C
```

---

# Create Automatic Startup

Since Windows does not have systemd, we'll use Task Scheduler.

Open an elevated PowerShell session and run:

```powershell
$Action = New-ScheduledTaskAction `
    -Execute "C:\LLM\scripts\start-sonnet.bat"

$Trigger = New-ScheduledTaskTrigger `
    -AtStartup

Register-ScheduledTask `
    -TaskName "Sonnet Server" `
    -Action $Action `
    -Trigger $Trigger `
    -RunLevel Highest `
    -User "SYSTEM"
```

---

## Start the Task

```powershell
Start-ScheduledTask `
    -TaskName "Sonnet Server"
```

---

## Verify the Task

```powershell
Get-ScheduledTask `
    -TaskName "Sonnet Server"
```

Or simply browse to:

```text
http://localhost:8003/v1/models
```

If you receive a response, the service is running.

---

## Validate After Reboot

Restart Windows:

```powershell
shutdown /r /t 0
```

After reboot, verify:

```text
http://localhost:8003/v1/models
```

The API should respond automatically.

---

# Checking Resource Utilization

Open:

```text
Task Manager
```

Navigate to:

```text
Performance → GPU
```

and:

```text
Performance → Memory
```

Typical resource usage:

| Resource | Usage |
|-----------|---------|
| VRAM | ~18-20 GB |
| RAM | ~8-12 GB |
| CPU | Moderate during inference |

Actual usage may vary depending on prompt size and active context.

---

# Success!

If you've made it this far, your local AI inference server is successfully running a Sonnet-class model powered by the Radeon RX 7900 XT.

Your server now exposes an OpenAI-compatible API endpoint and can be integrated with:

- Claude Code Router
- Claude Code
- Open WebUI
- Continue.dev
- Aider
- Roo Code
- Cline
- Custom applications

In the next step of the series, we'll connect both the Haiku and Sonnet servers together and integrate them with Claude Code for a complete local AI development environment.