## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# How to run a local AI agent using only CPU and RAM

In this guide we are going to set up a machine to serves us as our local AI agent. It can be your local computer, an old computer, or a NAS device.

For the sake of the YouTube video, we will be using a virtual Synology NAS but the instructions are basically the same for any of the cases described above because we will be using a docker container.

## The goal

To host a local AI agent locally, using fully open source software and models.  No fees, no subscriptions, and pretty decent results with "average Joe" hardware.

### What we will be setting up:

1. Local Ollama Container

   Will serve as the backend API for our User Interface.  This container will run our model using only CPU and RAM.  This container will use Ollama, which is free.  For best results, I recommend replicating the hardware that I used for the video:

   | Requirement | Value |
   |-|-|
   | CPU | 8 cores |
   | RAM | 16 GB |

2. Local Qwen 3.5 model

   Qwen is a free and open weights model easily downloadable from Huggingface.  We will be using a repository that provides us the model weights in GGUF format.  Always make sure to use GGUF for any model that you plan to use with Ollama.

3. OpenCode

   OpenCode is a free alternative to Claude.  It is basically the scaffolding surrounding the model.  It gives the model the ability to use tools, think, and validate its work.  It is OpenSource and free.

## Preparing the environment

1. Create the following Folder Structure in your machine

    ```
      /docker
      --/Containers
      ----/Ollama           <-- Will contain all of the Ollama containers information
      ------/data           <-- Will contain all of the Ollama data like models and Modelfiles
      --/Projects
      ----/Ollama
      ------/compose.yaml   <-- Will contain our project docker compose
    ```

2. Download the gguf model(s) of Qwen 3.5 9B from Huggingface and save it/them to a folder in the NAS that will be mounted to the container.  These links are not the official release because the official repository shares the models in .safetensors files.  They are a conversion to GGUF by somebody named Bartowski.

   | Size | Huggingface URL |
   |-|-|
   | 2B Model | https://huggingface.co/bartowski/Qwen_Qwen3.5-2B-GGUF |
   | 4B Model | https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF |
   | 9B Model | https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF |

    Save the files in the following directory:

    ```
    docker\Containers\Ollama
    ```

3. Create a Modelfile (for each model) to be consumed by Ollama.  This tells Ollama how to load the model.  I have included the files in this repository for your benefit.  These files are named:

    - **Qwen35-2B** - For the 2B parameter model size
    - **Qwen35-4B** - For the 4B parameter model size
    - **Qwen35-9B** - For the 9B parameter model size

    Save the files in the following folder:

    ```
    docker\Containers\Ollama\<Modelfile>
    ```

    These files are necessary for Ollama to understand how to use the models.  Since we want this model to behave like an AI agent and not just like a chat agent, we need to provide it a specific format to interact with the model.  The file defines how Ollama should load the model, format prompts, and control inference behavior.

    It tells Ollama to use an OpenAI style API, to load a local GGUF model, to use a Qwen‑style chat template, and run it with specific inference parameters (temperature, context length, prediction length, and stop tokens).  Be aware that **these Modelfiles are specific to Qwen!**  If you are going to use another model, you need to figure out the format of these files.
    
    Qwen is a very powerful agent.  Even if we configure it like this, you can use it freely like a chat agent if that's all that you need.

    The Modelfiles look like this:

    ```
    FROM ./Qwen_Qwen3.5-4B-Q8_0.gguf
    TEMPLATE """{{- range .Messages }}
    {{- if eq .Role "system" }}<|im_start|>system
    {{ .Content }}<|im_end|>
    {{- else if eq .Role "user" }}<|im_start|>user
    {{ .Content }}<|im_end|>
    {{- else if eq .Role "assistant" }}<|im_start|>assistant
    {{ .Content }}<|im_end|>
    {{- end }}
    {{- end }}
    {{- if not .Prompt }}<|im_start|>assistant
    {{- end }}"""
    PARAMETER temperature 0.2
    PARAMETER num_ctx 8192
    PARAMETER num_predict 4096
    PARAMETER stop "<|im_end|>"
    PARAMETER stop "<|endoftext|>"
    ```

4. Create the Docker Project with the following Docker Compose:

    *NOTE: This compose is written like if you are using a Synology NAS.  If not, you need to make changes to the volume paths to point to the location of the folders in your machine.*

    ```
    services:

      # Container: Llama Model Server
      ollama:
        image: ollama/ollama:latest
        container_name: Ollama-Qwen
        environment:
          # The directory in the container that will hold the model files
          - OLLAMA_MODELS=/models
        volumes:
          # NAS | Container
          - /volume1/docker/Containers/Ollama:/models
          - /volume1/docker/Containers/Ollama/data:/root/.ollama
        ports:
          # NAS | Container
          - "11434:11434"
        restart: unless-stopped
    ```

## Building the project

If you are using a Synology NAS, simply build the project.

If you are using your local machine or running this in a server:

Make sure that you have docker and docker compose instaslled and then run the docker compose command:

```
docker compose -f compose.yaml up
```

This should start the container.  The container will create additional folders in the directory that we specified for it (as long as the permissions allow it).

## Preparing Ollama to serve our model(s)

1. Open a terminal session to the container and run the following command to create the model that we specified for use:

    ```
    ollama create <model name> -f /models/<Modelfile>
    ```

    Example:

    ```
    ollama create qwen35-2b -f /models/Qwen35-2B
    ```

   This command tells Ollama to read the model GGUF file and prepare it for its use.  It will create blobs from it and understand how to interact with the model based on the details in the Modelfile.  Once it is done processing, the model will be available for us through Ollama.

2. Check it was created:

    ```
    ollama list
    ```

   This command tells Ollama to show us which models we have available to call for use.

8. Test the model inside the container:

    ```
    ollama run qwen35-2b "Hello"
    ```

   This command is like if we sent the text "Hello" to the model through our OpenCode user interface.  You should get a reply from the model after Ollama loads it loads into RAM and the model processes your request.  Something like:

   "Hello!  How can I help you today?"

9. Test it from Windows using PowerShell:

    ```
    (Invoke-RestMethod -Uri "http://<NASIP>:11434/v1/chat/completions" `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"model":"qwen35-2b","messages":[{"role":"user","content":"Hello"}]}').choices[0].message.content
    ```

    Example:

    ```
    (Invoke-RestMethod -Uri "http://10.0.0.73:11434/v1/chat/completions" `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"model":"qwen35-2b","messages":[{"role":"user","content":"Hello"}]}').choices[0].message.content
    ```

   This command will do the same thing but from outside the container, in our Windows machine.  This will allow us to confirm that the Ollama container is accessible from outside the outside.


## Installing OpenCode

1. Download the installer (has to be the Desktop app so that we can configure a custom provider) from the official website and run it.

    ```
    https://opencode.ai/download
    ```

    Click on the "Download for Windows" button and save it to your computer.

2. Install OpenCode by executing the installer.

## Configuring OpenCode

1. Configure OpenCode to use the container:

   **File > Settings > Models > Add Provider**

   Scroll all the way down and click the link **"Show more providers"**

   Search for OpenAI and select the **"Custom OpenAI-compatible provider"**

   Fill in the values:

    | Propery | Value |
    |-|-|
    | Provider ID | container-qwen |
    | Display Name | Qwen3.5 |
    | Base URL | http://\<IP\>:11434/v1 |
    | API Key | Leave blank |

   In Models:

    | First Field | Second Field |
    |-|-|
    | qwen35-2b | Qwen 3.5 2B |
    | qwen35-4b	| Qwen 3.5 4B |
    | qwen35-9b	| Qwen 3.5 9B |

   Click Submit

   Now, you should see your new model(s) in the drop down named like "Qwen 3.5 2B".

2. Enable the Coding Agent features

    **File > Settings**

    Scroll all the down and toggle the option that says:

    **"Show agent - Switch between agents in the composer.  When hidden, defaults to Build agent."**

## Start using your AI agent and enjoy!

The first time that you interact with the model or any time that you interact after a while of no interaction, it will be a little slow because Ollama will have to load the model again.  It offloads the model when not in use to not consume all your RAM.