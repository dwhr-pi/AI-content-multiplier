# Prompts

Prompt generation in this repository follows a reusable structure:

1. Define the role
2. State the goal
3. Add constraints
4. Specify the output format
5. Surface assumptions and risks

## Model routing guidance

- Use Ollama for privacy-sensitive local iterations
- Use ChatGPT or Claude for broader writing and restructuring tasks
- Use Flux or Stable Diffusion style tools for image prompting
- Use Suno or Udio for music prompting
- Use Veo, Kling, Runway, or similar tools for video prompts

## Output contract

Prompt bundles should return:

- recommended model choices
- a production prompt
- expected output shape
- notes about quality, privacy, and validation
