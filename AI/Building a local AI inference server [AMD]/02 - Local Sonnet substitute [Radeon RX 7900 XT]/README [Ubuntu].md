## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to run a local Sonnet substitute using a Radeon RX 7900 XT [20GB]

Tech Byte Tips brings you another video tutorial to breathe life into old hardware for modern uses.

## The goal

In this tutorial, we are going to use an old computer with an old AMD graphics card to run a local substitute for Sonnet with Claude Code.  We are basically building our own personal and local inference server.

## Pre-Requisites

Here are the requirements to complete the goal of this tutorial with an example of what I am using.

**Hardware**

1. An old PC (This used to be my gaming PC back in 2012)

    | Part | Details |
    |-|-|
    | **Motherboard** | Gigabyte Z77-DS3H |
    | **CPU** | Intel Core i7-3770K |
    | **RAM** | 32 GB [PC3-12800 DDR3-1600] (Max amount of RAM on this motherboard) |
    | **PSU** | 750W Gold |
    | **GPU** | AMD Radeon RX 7900 XT [20GB] |
    | **Disk** | Orico mSATA drive [512GB ] |

**Operating System**

1. We will be using a Linux distribution to run our AI server.

    | Distro | Version |
    |-|-|
    | Ubuntu | 24.04 |
    
    For the sake of simplicity and to get the most performance out of the system, we will be using Ubuntu.  Install whichever version you prefer; it can be Server or Desktop.  If you are very comfortable with the CLI, server wastes less resources.

NOTE: Make sure to install the `openssh-server` package so that you can manage the server remotely.

```
sudo apt install -y openssh-server
```

## Setting up the System

1. Make sure the system is up to date

    ```
    sudo apt update -y
    sudo apt upgrade -y
    ```

2. Verify the GPU is visible

    ```
    sudo apt install -y pciutils mesa-utils
    lspci | grep VGA
    ```

    You should see something like this:

    ```
    $ lspci | grep VGA

    00:02.0 VGA compatible controller: Intel Corporation IvyBridge GT2 [HD Graphics 4000] (rev 09)
    09:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Navi 31 [Radeon RX 7900 XT/7900 XTX/7900M] (rev cc)
    ```

    This is showing the CPU graphics as the first entry (Intel HD 4000) and the dedicated GPU as the second (RX 7900 XT).

3. Install system dependencies

    ```
    sudo apt install -y git build-essential cmake ninja-build curl wget pkg-config mesa-common-dev vulkan-tools glslc spirv-headers spirv-tools spirv-cross vulkan-tools libvulkan-dev glslang-tools vulkan-utility-libraries-dev
    ```

4. Validate that the graphics cards are working

    ```
    vulkaninfo | less
    ```

    If you see something like this, everything is working properly:

    ```
    GPU id : 2 (AMD Radeon RX 7900 XT (RADV NAVI31)):
        Surface type = VK_KHR_wayland_surface
        Formats: count = 14
                SurfaceFormat[0]:
                            ...
    ```

    Press `q` to exit the information pages.

## Building Llama.cpp

We will be using Vulkan for Llama.cpp because this is the simplest path to target the GPU without depending on ROCm support.

1. Clone the Llama.cpp repository

    ```
    cd ~
    git clone https://github.com/ggml-org/llama.cpp.git
    cd llama.cpp
    ```

2. Build the Vulkan backend

    ```
    cmake -B build -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release
    cmake --build build -j $(nproc)
    ```

3. Verify the build was successful

    ```
    ./build/bin/llama-cli --version
    ```

    You should see something like:

    ```
    version: 0.9.0-dev (build 12282, commit aa75ff323)
    built with GNU 13.3.0 for Linux x86_64
    ```

4. List the supported devices

    ```
    ./build/bin/llama-cli --list-devices
    ```

    You should see something like this:

    ```
    MESA-INTEL: warning: Ivy Bridge Vulkan support is incomplete
    Available devices:
      Vulkan0: AMD Radeon RX 7900 XT (RADV NAVI31) (20480 MiB, 20449 MiB free)
    ```

    We should see that Vulkan ignores the Intel HD 4000, which is great.

    Also, the RX 7900 XT is available as a dedicated inference device.

## Attempting to benchmark the GPU

Let's perform a quick benchmark of the GPU to make sure that the GPU can execute compute workloads.

1. List the devices

    ```
    ./build/bin/llama-bench --list-devices
    ```

    We should see something like this:

    ```
    MESA-INTEL: warning: Ivy Bridge Vulkan support is incomplete
    ggml_vulkan: Found 2 Vulkan devices:
    ggml_vulkan: 1 = AMD Radeon RX 7900 XT (RADV NAVI31) (radv) | uma: 0 | rebar: 0 | fp16: 1 | bf16: 0 | fp4: 0 | warp size: 64 | shared memory: 65536 | int dot: 0 | matrix cores: KHR_coopmat
    Available devices:
      Vulkan0: AMD Radeon RX 7900 XT (RADV NAVI31) (20480 MiB, 20449 MiB free)
    ```

    We can see that our GPU's ID is `Vulkan0`.

2. Run the benchmark

    ```
    ./build/bin/llama-bench -dev Vulkan0
    ```

    Well likely get an error like this:

    ```
    MESA-INTEL: warning: Ivy Bridge Vulkan support is incomplete
    ggml_vulkan: Found 2 Vulkan devices:
    ggml_vulkan: 1 = AMD Radeon RX 7900 XT (RADV NAVI31) (radv) | uma: 0 | rebar: 0 | fp16: 1 | bf16: 0 | fp4: 0 | warp size: 64 | shared memory: 65536 | int dot: 0 | matrix cores: KHR_coopmat
    | model                          |       size |     params | backend    | ngl | dev          |            test |                  t/s |
    | ------------------------------ | ---------: | ---------: | ---------- | --: | ------------ | --------------: | -------------------: |
    gguf_init_from_file: failed to open GGUF file 'models/7B/ggml-model-q4_0.gguf' (No such file or directory)
    llama_model_load: error loading model: llama_model_loader: failed to load model from models/7B/ggml-model-q4_0.gguf
    llama_model_load_from_file_impl: failed to load model
    llama_bench: error: failed to load model 'models/7B/ggml-model-q4_0.gguf'
    ```

    But that is fine, it is just telling us that we don't have the model that it uses for the benchmark.  But it didn't error out on trying to use the GPU, which is what we wanted to test.

## Preparing the directory Structure

1. Create the folder that will hold our model:

    ```
    mkdir -p ~/models/sonnet
    ```

## Downloading and testing with a tiny model

Before downloading models, let's test that the GPU selection works properly.

1. Install Python dependencies to download models from Huggingface

    ```
    sudo apt install -y pipx

    pipx install huggingface_hub
    ```

2. Reload the shell

    ```
    source ~/.bashrc
    ```

3. Fix the path as it installs huggingface CLI as `hf`

    ```
    pipx ensurepath
    source ~/.bashrc
    ```

4. Validate it is available

    ```
    which hf
    ```

    You should see something like:

    ```
    /home/<user>/.local/bin/hf
    ```

5. Create a test directory for the tiny model

    ```
    mkdir -p ~/models/test
    cd ~/models/test
    ```

6. Download the tiny test model

    ```
    hf download \
      bartowski/Qwen2.5-Coder-1.5B-Instruct-GGUF \
      Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf \
      --local-dir .
    ```

7. Check that we have the file

    ```
    ls -lh
    ```

8. Test the model with the RX 7900 XT

    ```
    ~/llama.cpp/build/bin/llama-cli \
      -m ~/models/test/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -p "Write a hello world program in Python."
    ```

    You should get something like this:

    ```
    MESA-INTEL: warning: Ivy Bridge Vulkan support is incomplete


    Loading model...

    ▄▄ ▄▄
    ██ ██
    ██ ██  ▀▀█▄ ███▄███▄  ▀▀█▄    ▄████ ████▄ ████▄
    ██ ██ ▄█▀██ ██ ██ ██ ▄█▀██    ██    ██ ██ ██ ██
    ██ ██ ▀█▄██ ██ ██ ██ ▀█▄██ ██ ▀████ ████▀ ████▀
                                        ██    ██
                                        ▀▀    ▀▀

    build      : b12282-aa75ff323
    model      : /home/<user>/models/test/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf
    ftype      : Q4_K - Medium
    modalities : text

    available commands:
      /exit or Ctrl+C     stop or exit
      /regen              regenerate the last response
      /clear              clear the chat history
      /read <file>        add a text file
      /glob <pattern>     add text files using globbing pattern



    > Write a hello world program in Python.
    Sure! Here's a simple "Hello, World!" program in Python:

    ---python
    print("Hello, World!")
    ---

    This program will output "Hello, World!" to the console when executed.

    [ Prompt: 191.5 t/s | Generation: 107.5 t/s ]
    ```

    Press `CTRL + C` to exit.

9. Let's get rid of the tiny model, as we don't need it.

    ```
    rm -rf ~/models/test
    du -sh ~/models/*
    ```

    We should now only see the folder for `Sonnet`.

    This is our current directory structure

    ```
    models
    └── sonnet
    ```

## Downloading our `Sonnet` model

We obviously don't have access to the Anthropic Sonnet model weights.  We will be using a substitute model to serve as our Sonnet in Claude Code.  Our best bet for this will be using `Qwen3.6-27B-A3B` at a quantization of Q4_K_M.

**Why?**

1. Excellent coding capability
2. Tool calling behavior
3. Follows complex instructions
4. Long conversation stability
5. Agentic workflows

Let's continue...

1. Download the "`Sonnet`" model from Hugginface

    ```
    hf download bartowski/Qwen_Qwen3.6-27B-GGUF Qwen_Qwen3.6-27B-Q4_K_M.gguf --local-dir .
    mv Qwen_Qwen3.6-27B-Q4_K_M.gguf Qwen3.6-27B-Q4_K_M.gguf
    ls -lh
    ```

    We are using the Bartowski repository because the official Qwen repository does not provide the model in GGUF format.

## Testing our `Sonnet`

1. Launch the model with the following command

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/Qwen3.6-27B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 6 \
      -tb 6 \
      --ctx-size 49152 \
      --host 0.0.0.0 \
      --port 8003
    ```

2. Open another terminal and query the server to see if it is being served

    In Linux:

    ```
    curl http://<machine ip>:8003/v1/models
    ```

    In Windows:

    ```
    (curl http://<machine ip>:8003/v1/models).Content
    ```

    If you see a JSON response like this, everything is good.

    ```
    {
      "models": [
        {
          "name": "Qwen3.6-27B-Q4_K_M.gguf",
          "model": "Qwen3.6-27B-Q4_K_M.gguf",
          "modified_at": "",
          "size": "",
          "digest": "",
          "type": "model",
          "description": "",
          "tags": [
            ""
          ],
          "capabilities": [
            "completion"
          ],
          "parameters": "",
          "details": {
            "parent_model": "",
            "format": "gguf",
            "family": "",
            "families": [
              ""
            ],
            "parameter_size": "",
            "quantization_level": ""
          }
        }
      ],
      "object": "list",
      "data": [
        {
          "id": "Qwen3.6-27B-Q4_K_M.gguf",
          "aliases": [
            "Qwen3.6-27B-Q4_K_M.gguf"
          ],
          "tags": [],
          "object": "model",
          "architecture": {
            "input_modalities": [
              "text"
            ],
            "output_modalities": [
              "text"
            ]
          },
          "created": 1794412779,
          "owned_by": "llamacpp",
          "meta": {
            "vocab_type": 2,
            "n_vocab": 248320,
            "n_ctx": 131072,
            "n_ctx_train": 262144,
            "n_embd": 5120,
            "n_params": 27320697856,
            "size": 17973878784,
            "ftype": "Q4_K - Medium"
          }
        }
      ]
    }
    ```

    Press `CTRL + C` to exit.

3. Test the model inference

    ```
    ~/llama.cpp/build/bin/llama-cli \
      -m ~/Qwen3.6-27B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 6 \
      -tb 6 \
      -p "Explain what a Python dictionary is."
    ```

    If the model responds to the prompt, everythig is OK.

    Press `CTRL + C` to exit.

4. Start the Sonnet Server

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/Qwen3.6-27B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 6 \
      -tb 6 \
      --ctx-size 49152 \
      --host 0.0.0.0 \
      --port 8003
    ```

5. Ask it to answer a question using the server API endpoint

    ```
    $body = @{
        messages = @(
            @{
                role = "user"
                content = "Write a Python hello world program."
            }
        )
    } | ConvertTo-Json -Depth 10

    Invoke-RestMethod `
        -Uri "http://<machine ip>:8003/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    ```

    If you get a reply with a chat.completion object, it is working properly:

    ```
    choices            : {@{finish_reason=stop; index=0; message=}}
    created            : 1794410635
    model              : /home/jlpc/Qwen3.6-35B-A3B-Q4_K_M.gguf
    system_fingerprint : b12282-aa75ff323
    object             : chat.completion
    usage              : @{completion_tokens=371; prompt_tokens=17; total_tokens=388; prompt_tokens_details=}
    id                 : chatcmpl-Ojb4syPZlRGrQfRQYStYRCzsg1tsKdCt
    timings            : @{cache_n=0; prompt_n=17; prompt_ms=19496.914; prompt_per_token_ms=1146.8772941176471; prompt_per_second=0.8719328607594001; predicted_n=371; predicted_ms=74514.131;
                     predicted_per_token_ms=201.38954324324322; predicted_per_second=4.96550110743424}
    ```

6. Confirm from the browser

    Open the following URL in the browser

    ```
    http://<machine ip>:8003/v1/models
    ```

    You should see the model that is available in the reply.

    Press `CTRL + C` to exit.

## Making it Production ready

We have validate that everything works.  Now we need to make it so that the machine acts like an inference server that is always available.

1. Create the folders for the server

    ```
    mkdir -p ~/llama/bin
    mkdir -p ~/llama/models/sonnet
    mkdir -p ~/llama/logs
    mkdir -p ~/llama/config
    mkdir -p ~/llama/sonnet
    ```

    This will give us the following server folder structure:

    ```
    ~/llama/
    ├── bin/
    │   └── start-sonnet.sh
    │
    ├── models/
    │   └── sonnet/
    │       └── Qwen3-4B-Q4_K_M.gguf
    │
    ├── logs/
    │   └── sonnet.log
    │
    ├── config/
    │   └── sonnet.env
    │
    └── sonnet/
        └── runtime files if needed
    ```

2. Let's relocate our `Sonnet` model to its folder

    ```
    mv ~/Qwen3.6-35B-A3B-Q4_K_M.gguf ~/llama/models/sonnet/
    ```

3. Let's delete the unnecessary folders

    ```
    rm -rf ~/models
    ```

4. Check that everything still runs

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/llama/models/sonnet/Qwen3.6-35B-A3B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 6 \
      -tb 6 \
      --ctx-size 49152 \
      --host 0.0.0.0 \
      --port 8003
    ```

    Press `CTRL + C` to exit.

5. Create the server startup script

    ```
    nano ~/llama/bin/start-sonnet.sh
    ```

    Paste the following contents:

    ```
    #!/bin/bash

    ~/llama.cpp/build/bin/llama-server \
      -m ~/llama/models/sonnet/Qwen3.6-35B-A3B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 6 \
      -tb 6 \
      --ctx-size 49152 \
      --parallel 1 \
      --host 0.0.0.0 \
      --port 8003
    ```

    *NOTE: We are telling it to use 48K of context because after that, it exceeds the VRAM capacity and inference goes down a cliff.*

6. Make the script executable

    ```
    chmod +x ~/llama/bin/start-sonnet.sh
    ```

7. Test the script

    ```
    ~/llama/bin/start-sonnet.sh
    ```

    Press `CTRL + C` to exit.

8. Create a Linux Service

    This is necessary for the server to automatically start whenever the machine boots.

    ```
    sudo nano /etc/systemd/system/sonnet.service
    ```

    ```
    [Unit]
    Description=Sonnet LLM Server
    After=network.target

    [Service]
    Type=simple
    User=<user>
    Group=<user>

    WorkingDirectory=/home/<user>/llama.cpp

    ExecStart=/home/<user>/llama/bin/start-sonnet.sh

    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    ```

    Press `CTRL + X` then `y` then `Enter` to save.

9. Reload the System Control daemon to make it aware of the new service

    ```
    sudo systemctl daemon-reload
    ```

10. Enable the Service to auto start

    ```
    sudo systemctl enable sonnet.service
    ```

11. Start the Service

    ```
    sudo systemctl start sonnet.service
    ```

12. Verify it is running

    ```
    sudo systemctl status sonnet.service
    ```

Press `CTRL + C` to exit.

13. Check in the browser for a reply from the server

    ```
    http://<machine ip>:8003/v1/models
    ```

14. Reboot the machine to validate that it starts automatically

    ```
    sudo reboot now
    ```

## Checking RAM utilization

1. View the utilization graph

```
htop
```

This lets us know that we are using about 9GB of RAM with our current context.

It still leaves us with enough RAM for other things.

## Success!

If you made it to this point, your AI agent is being properly served from the local AI inference server.

In the next step of the series, we will add an additional graphics card and serve a Sonnet substitute also!

Then, we will connect them all together for use with Claude Code.