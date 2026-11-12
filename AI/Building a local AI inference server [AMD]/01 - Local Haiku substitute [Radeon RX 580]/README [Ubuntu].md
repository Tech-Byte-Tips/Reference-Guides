## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to run a local Haiku substitute using a Radeon RX 580 [8GB] (Ubuntu)

Tech Byte Tips brings you another video tutorial to breathe life into old hardware for modern uses.

## The goal

In this tutorial, we are going to use an old computer with an old AMD graphics card to run a local substitute for Haiku with Claude Code.  We are basically building our own personal and local inference server.

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
    | **GPU** | AMD Radeon RX 580 [8GB] |
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
    01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere [Radeon RX 470/480/570/570X/580/580X/590] (rev e7)
    ```

    This is showing the CPU graphics as the first entry (Intel HD 4000) and the dedicated GPU as the second (RX 580).

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
    GPU id : 1 (AMD Radeon RX 580 Series (RADV POLARIS10)):
            Surface type = VK_KHR_wayland_surface
            Formats: count = 14
                    SurfaceFormat[0]:
                            ...
    ```

    Press `q` to exit the information pages.

## Building Llama.cpp

We will be using Vulkan for Llama.cpp because the graphics card is old and this is the simplest path to target the GPU without depending on ROCm support which is is likely not available.

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
      Vulkan0: AMD Radeon RX 580 Series (RADV POLARIS10) (8192 MiB, 8186 MiB free)
    ```

    We should see that Vulkan ignores the Intel HD 4000, which is great.

    Also, the RX 580 is available as a dedicated inference device.

## Attempting to benchmark the GPU

Let's perform a quick benchmark of the GPU to make sure that the GPU can execute compute workloads.

1. List the devices

    ```
    ./build/bin/llama-bench --list-devices
    ```

    We should see something like this:

    ```
    MESA-INTEL: warning: Ivy Bridge Vulkan support is incomplete
    ggml_vulkan: Found 1 Vulkan device:
    ggml_vulkan: 0 = AMD Radeon RX 580 Series (RADV POLARIS10) (radv) | uma: 0 | rebar: 1 | fp16: 0 | bf16: 0 | fp4: 0 | warp size: 64 | shared memory: 65536 | int dot: 0 | matrix cores: none
    Available devices:
      Vulkan0: AMD Radeon RX 580 Series (RADV POLARIS10) (8192 MiB, 8186 MiB free)
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
    ggml_vulkan: 0 = AMD Radeon RX 580 Series (RADV POLARIS10) (radv) | uma: 0 | rebar: 1 | fp16: 0 | bf16: 0 | fp4: 0 | warp size: 64 | shared memory: 65536 | int dot: 0 | matrix cores: none
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
    mkdir -p ~/models/haiku
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

8. Test the model with the RX 580

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

    We should now only see the folder for `Haiku`.

    This is our current directory structure

    ```
    models
    └── haiku
    ```

## Downloading our Haiku model

We obviously don't have access to the Anthropic Haiku model weights.  We will be using a substitute model to serve as our Haiku in Claude Code.  Our best bet for this will be using `Qwen3-4B` at a quantization of Q4_K_M.

**Why?**

1. Many people have found `Qwen3-4B` to be significantly stronger than the older small Qwen2.5 models
2. It fits easily in 8GB of VRAM
3. It has better reasoning than Qwen2.5-Coder 3B
4. It has good tool use
5. It is faster than larger coding models
6. It has an excellent "Haiku" personality

Let's continue...

1. Download the "`Haiku`" model from Hugginface

    ```
    cd ~/models/haiku    
    hf download Qwen/Qwen3-4B-GGUF Qwen3-4B-Q4_K_M.gguf --local-dir .
    ls -lh
    ```

## Testing our `Haiku`

1. Launch the model with the following command

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/models/haiku/Qwen3-4B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 4 \
      -tb 4 \
      --ctx-size 65536 \
      --host 0.0.0.0 \
      --port 8002
    ```

2. Open another terminal and query the server to see if it is being served

    In Linux:

    ```
    curl http://<machine ip>:8002/v1/models
    ```

    In Windows:

    ```
    (curl http://<machine ip>:8002/v1/models).Content
    ```

    If you see a JSON response like this, everything is good.

    ```
    {
      "models": [
        {
          "name": "/home/<user>/models/haiku/Qwen3-4B-Q4_K_M.gguf",
          "model": "/home/<user>/models/haiku/Qwen3-4B-Q4_K_M.gguf",
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
          "id": "/home/<user>/models/haiku/Qwen3-4B-Q4_K_M.gguf",
          "aliases": [
            "/home/<user>/models/haiku/Qwen3-4B-Q4_K_M.gguf"
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
          "created": 1794361400,
          "owned_by": "llamacpp",
          "meta": {
            "vocab_type": 2,
            "n_vocab": 151936,
            "n_ctx": 40960,
            "n_ctx_train": 40960,
            "n_embd": 2560,
            "n_params": 4022468096,
            "size": 2491323904,
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
      -m ~/models/haiku/Qwen3-4B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -p "Explain what a Python dictionary is."
    ```

    If the model responds to the prompt, everythig is OK.

    Press `CTRL + C` to exit.

4. Start the Haiku Server

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/models/haiku/Qwen3-4B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 4 \
      -tb 4 \
      --ctx-size 65536 \
      --host 0.0.0.0 \
      --port 8002
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
        -Uri "http://<machine ip>:8002/v1/chat/completions" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    ```

    If you get a reply with a chat.completion object, it is working properly:

    ```
    choices            : {@{finish_reason=stop; index=0; message=}}
    created            : 1794364323
    model              : /home/jlpc/models/haiku/Qwen3-4B-Q4_K_M.gguf
    system_fingerprint : b12282-aa75ff323
    object             : chat.completion
    usage              : @{completion_tokens=227; prompt_tokens=15; total_tokens=242; prompt_tokens_details=}
    id                 : chatcmpl-BwbJpUf7v9QIITNamNvspO3sq733nxZq
    timings            : @{cache_n=0; prompt_n=15; prompt_ms=1813.774; prompt_per_token_ms=120.91826666666665; prompt_per_second=8.270049079984606; predicted_n=227; predicted_ms=5055.135;
                        predicted_per_token_ms=22.367853982300886; predicted_per_second=44.70701573746299}
    ```

6. Confirm from the browser

    Open the following URL in the browser

    ```
    http://<machine ip>:8002/v1/models
    ```

    You should see the model that is available in the reply.

    Press `CTRL + C` to exit.

## Making it Production ready

We have validate that everything works.  Now we need to make it so that the machine acts like an inference server that is always available.

1. Create the folders for the server

    ```
    mkdir -p ~/llama/bin
    mkdir -p ~/llama/models/haiku
    mkdir -p ~/llama/logs
    mkdir -p ~/llama/config
    mkdir -p ~/llama/haiku
    ```

    This will give us the following server folder structure:

    ```
    ~/llama/
    ├── bin/
    │   └── start-haiku.sh
    │
    ├── models/
    │   └── haiku/
    │       └── Qwen3-4B-Q4_K_M.gguf
    │
    ├── logs/
    │   └── haiku.log
    │
    ├── config/
    │   └── haiku.env
    │
    └── haiku/
        └── runtime files if needed
    ```

2. Let's relocate our `Haiku` model to its folder

    ```
    mv ~/models/haiku/Qwen3-4B-Q4_K_M.gguf ~/llama/models/haiku/
    ```

3. Let's delete the unnecessary folders

    ```
    rm -rf ~/models
    ```

4. Check that everything still runs

    ```
    ~/llama.cpp/build/bin/llama-server \
      -m ~/llama/models/haiku/Qwen3-4B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 4 \
      -tb 4 \
      --ctx-size 65536 \
      --host 0.0.0.0 \
      --port 8002
    ```

    Press `CTRL + C` to exit.

5. Create the server startup script

    ```
    nano ~/llama/bin/start-haiku.sh
    ```

    Paste the following contents:

    ```
    #!/bin/bash

    ~/llama.cpp/build/bin/llama-server \
      -m ~/llama/models/haiku/Qwen3-4B-Q4_K_M.gguf \
      -dev Vulkan0 \
      -ngl 999 \
      -t 4 \
      -tb 4 \
      --ctx-size 65536 \
      --parallel 1 \
      --sleep-idle-seconds 300 \
      --host 0.0.0.0 \
      --port 8002
    ```

    *NOTE: We are telling it to try to use the maximum allowed YARN context of 132K but the model caps at 40,960.  If I figure out how to extend it, I will update this guide.*

6. Make the script executable

    ```
    chmod +x ~/llama/bin/start-haiku.sh
    ```

7. Test the script

    ```
    ~/llama/bin/start-haiku.sh
    ```

    Press `CTRL + C` to exit.

8. Create a Linux Service

    This is necessary for the server to automatically start whenever the machine boots.

    ```
    sudo nano /etc/systemd/system/haiku.service
    ```

    ```
    [Unit]
    Description=Haiku LLM Server
    After=network.target

    [Service]
    Type=simple
    User=<user>
    Group=<user>

    WorkingDirectory=/home/<user>/llama.cpp

    ExecStart=/home/<user>/llama/bin/start-haiku.sh

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
    sudo systemctl enable haiku.service
    ```

11. Start the Service

    ```
    sudo systemctl start haiku.service
    ```

12. Verify it is running

    ```
    sudo systemctl status haiku.service
    ```

Press `CTRL + C` to exit.

13. Check in the browser for a reply from the server

    ```
    http://<machine ip>:8002/v1/models
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